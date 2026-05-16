import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";
import { uploadLead } from "@/lib/drive";
import { sendAdminLeadNotification, sendContactConfirmation } from "@/lib/email";
import { findCallsForPhone } from "@/lib/retell";
import { logEvent, newSubmissionContext } from "@/lib/submission-log";
import { shrinkForUpload } from "@/lib/image-resize";

/**
 * Contact form endpoint (multipart).
 *
 * Pipeline:
 *   1. Build a submission context (UUID, source, IP, UA) — used as the
 *      correlation key across every log event in this handler.
 *   2. Parse multipart form data.
 *   3. Honeypot check (silently succeed for bots).
 *   4. Cloudflare Turnstile verification.
 *   5. Zod validation.
 *   6. File guard (count, MIME, total size).
 *   7. Upload to Google Drive (non-throwing — captures errors for admin email).
 *   8. Look up prior Sofia call history for the phone (for the banner).
 *   9. Send admin notification + customer confirmation in parallel.
 *  10. Return 200 — the form has succeeded if we got this far, even if
 *      individual integrations failed (admin will see exactly what broke).
 *
 * Every step emits a structured submission-log event tied to the same
 * submissionId. Search Vercel logs for `[submission]` to follow a trace.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES = 10;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/heic", "image/heif"]);

const Schema = z.object({
  navn: z.string().min(2),
  telefon: z.string().min(8),
  email: z.string().email(),
  adresse: z.string().optional().default(""),
  // Optional postal code + city — both share a row in the UI but
  // submit as separate fields so the admin email + Drive folder
  // naming can use either independently.
  postnummer: z.string().optional().default(""),
  by: z.string().optional().default(""),
  opgavetype: z.string().optional().default(""),
  besked: z.string().min(5),
  samtykke: z.literal("true", { message: "Samtykke er påkrævet" }),
});

function redactEmail(e: string): string {
  const [u, d] = e.split("@");
  if (!u || !d) return "[invalid]";
  return `${u.slice(0, 2)}***@${d}`;
}

function redactPhone(p: string): string {
  return p.length > 4 ? p.slice(0, 4) + "***" : "[short]";
}

export async function POST(request: Request) {
  const ctx = newSubmissionContext("kontakt", request);
  logEvent(ctx, { area: "lifecycle", status: "ok", note: "submission-started" });

  try {
    const form = await request.formData();

    // 1. Honeypot — silently succeed so bots don't learn what failed
    if (String(form.get("website") ?? "").trim() !== "") {
      logEvent(ctx, { area: "honeypot", status: "invalid", note: "bot-detected" }, "warn");
      return NextResponse.json({ ok: true, submission_id: ctx.id });
    }

    // 2. Turnstile
    const token = String(form.get("turnstileToken") ?? "");
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? undefined;
    const verify = await verifyTurnstile(token, ip);
    if (!verify.ok) {
      logEvent(ctx, { area: "turnstile", status: "failed", note: "captcha-rejected" }, "warn");
      return NextResponse.json({ ok: false, error: "captcha-failed", submission_id: ctx.id }, { status: 400 });
    }
    logEvent(ctx, { area: "turnstile", status: "ok" });

    // 3. Text fields + zod
    const rawFields = {
      navn: String(form.get("navn") ?? ""),
      telefon: String(form.get("telefon") ?? ""),
      email: String(form.get("email") ?? ""),
      adresse: String(form.get("adresse") ?? ""),
      postnummer: String(form.get("postnummer") ?? ""),
      by: String(form.get("by") ?? ""),
      opgavetype: String(form.get("opgavetype") ?? ""),
      besked: String(form.get("besked") ?? ""),
      samtykke: String(form.get("samtykke") ?? "false"),
    };
    const parsed = Schema.safeParse(rawFields);
    if (!parsed.success) {
      logEvent(
        ctx,
        { area: "validation", status: "invalid", note: "zod-failed", meta: parsed.error.flatten() },
        "warn",
      );
      return NextResponse.json(
        { ok: false, error: "validation-failed", details: parsed.error.flatten(), submission_id: ctx.id },
        { status: 400 },
      );
    }
    logEvent(ctx, {
      area: "validation",
      status: "ok",
      meta: {
        navn: parsed.data.navn,
        emailRedacted: redactEmail(parsed.data.email),
        phoneRedacted: redactPhone(parsed.data.telefon),
        opgavetype: parsed.data.opgavetype || null,
        adresse: parsed.data.adresse || null,
        postnummer: parsed.data.postnummer || null,
        by: parsed.data.by || null,
        beskedLen: parsed.data.besked.length,
      },
    });

    // 4. Files (count + size + MIME guard)
    const fileEntries = form.getAll("billeder").filter((v): v is File => v instanceof File);
    if (fileEntries.length > MAX_FILES) {
      logEvent(
        ctx,
        { area: "files", status: "invalid", note: "too-many-files", meta: { count: fileEntries.length } },
        "warn",
      );
      return NextResponse.json(
        { ok: false, error: "too-many-files", submission_id: ctx.id },
        { status: 400 },
      );
    }
    let totalBytes = 0;
    const files: { name: string; type: string; bytes: Buffer }[] = [];
    for (const f of fileEntries) {
      if (!ACCEPTED_MIME.has(f.type)) {
        logEvent(
          ctx,
          { area: "files", status: "invalid", note: "bad-mime", meta: { mime: f.type, name: f.name } },
          "warn",
        );
        return NextResponse.json(
          { ok: false, error: "invalid-file-type", submission_id: ctx.id },
          { status: 400 },
        );
      }
      totalBytes += f.size;
      if (totalBytes > MAX_TOTAL_BYTES) {
        logEvent(ctx, { area: "files", status: "invalid", note: "total-size-exceeded" }, "warn");
        return NextResponse.json(
          { ok: false, error: "total-size-exceeded", submission_id: ctx.id },
          { status: 413 },
        );
      }
      const buf = Buffer.from(await f.arrayBuffer());
      files.push({ name: f.name, type: f.type, bytes: buf });
    }

    // 4b. Server-side resize/recompress to keep Drive + email payloads
    //     small. shrinkForUpload is best-effort — if sharp can't decode
    //     a particular buffer (corrupt, exotic format) the original is
    //     returned unchanged so the upload still succeeds. Runs in
    //     parallel since each file is independent.
    const resized = await Promise.all(files.map(shrinkForUpload));
    const totalBytesBefore = totalBytes;
    const totalBytesAfter = resized.reduce((s, f) => s + f.bytes.length, 0);
    // Replace the working buffer set in place so downstream sees the
    // smaller files.
    files.length = 0;
    files.push(...resized);

    logEvent(ctx, {
      area: "files",
      status: "ok",
      meta: {
        count: files.length,
        totalBytesIn: totalBytesBefore,
        totalBytesOut: totalBytesAfter,
        reductionPct: totalBytesBefore > 0
          ? Math.round((1 - totalBytesAfter / totalBytesBefore) * 100)
          : 0,
        names: files.map((f) => f.name),
      },
    });

    // Combine the three optional address fields into a single
    // human-readable line for the Drive folder name and the email
    // bodies. Each piece is optional so the result is built defensively
    // — "Hovedgaden 1, 2860 Søborg" when all three are present, just
    // "Hovedgaden 1" or "2860 Søborg" otherwise. Empty when nothing
    // is supplied.
    const cityLine = [parsed.data.postnummer, parsed.data.by]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
    const fullAddress = [parsed.data.adresse.trim(), cityLine]
      .filter(Boolean)
      .join(", ");

    // 5. Drive upload — non-throwing, error captured for admin email
    const drive = await uploadLead({
      customer: parsed.data.navn,
      source: "kontakt",
      address: fullAddress || undefined,
      files,
    });
    if (drive.error) {
      logEvent(
        ctx,
        {
          area: "drive",
          status: "failed",
          note: drive.error.message,
          meta: {
            stage: drive.error.stage,
            details: drive.error.details,
            attempted: drive.attempted,
            uploaded: drive.uploaded.length,
          },
        },
        "error",
      );
    } else if (drive.stub) {
      logEvent(ctx, {
        area: "drive",
        status: "stub",
        meta: { attempted: drive.attempted, uploaded: 0 },
      });
    } else {
      logEvent(ctx, {
        area: "drive",
        status: "ok",
        meta: {
          attempted: drive.attempted,
          uploaded: drive.uploaded.length,
          folderUrl: drive.folderUrl,
        },
      });
    }

    // 6. Build admin-email context (kept human-readable).
    //    Use the combined fullAddress so the admin email shows
    //    "Hovedgaden 1, 2860 Søborg" rather than a bare street.
    const adminContext = [
      parsed.data.opgavetype ? `Opgavetype: ${parsed.data.opgavetype}` : null,
      fullAddress ? `Adresse: ${fullAddress}` : null,
      `Besked:\n${parsed.data.besked}`,
    ]
      .filter(Boolean)
      .join("\n");

    // 7. Look up prior Sofia calls for the banner
    const sofiaHistory = await findCallsForPhone(parsed.data.telefon).catch(() => []);
    logEvent(ctx, {
      area: "retell-history",
      status: "ok",
      meta: { matchCount: sofiaHistory.length },
    });

    // 8. Send admin + customer emails in parallel — neither blocks the
    //    response on failure (Promise.allSettled catches everything).
    //
    // We attach the customer's image buffers DIRECTLY to the admin email
    // as a Drive fallback. Two reasons:
    //   1. Personal Gmail-Drive folders can't accept service-account
    //      writes (no quota) — until Adam moves to a Shared Drive, this
    //      ensures Adam still gets the photos.
    //   2. Even with Drive working, having photos inline saves a click.
    // Resend's per-message cap is ~40 MB; our form caps uploads at 20 MB,
    // so we stay well inside the budget.
    const adminAttachments = files.map((f) => ({ filename: f.name, content: f.bytes }));

    const [adminMail, customerMail] = await Promise.allSettled([
      sendAdminLeadNotification({
        customerName: parsed.data.navn,
        customerPhone: parsed.data.telefon,
        customerEmail: parsed.data.email,
        source: "kontakt",
        context: adminContext,
        sofiaHistory,
        driveStatus: {
          attempted: drive.attempted,
          uploaded: drive.uploaded.length,
          folderUrl: drive.folderUrl,
          stub: drive.stub,
          error: drive.error,
        },
        submissionId: ctx.id,
        attachments: adminAttachments,
      }),
      sendContactConfirmation({
        to: parsed.data.email,
        customerName: parsed.data.navn,
        besked: parsed.data.besked,
        opgavetype: parsed.data.opgavetype || undefined,
        // Customer email shows the same combined address line — saves
        // them having to recombine street + postal + city from
        // separate fields in the receipt.
        adresse: fullAddress || undefined,
      }),
    ]);

    logEvent(
      ctx,
      {
        area: "email-admin",
        status: adminMail.status === "fulfilled" && (adminMail.value as { ok: boolean }).ok ? "ok" : "failed",
        meta:
          adminMail.status === "rejected"
            ? { reason: String(adminMail.reason).slice(0, 200) }
            : { stub: (adminMail.value as { stub?: boolean }).stub ?? false },
      },
      adminMail.status === "rejected" ? "error" : "info",
    );
    logEvent(
      ctx,
      {
        area: "email-customer",
        status: customerMail.status === "fulfilled" && (customerMail.value as { ok: boolean }).ok ? "ok" : "failed",
        meta:
          customerMail.status === "rejected"
            ? { reason: String(customerMail.reason).slice(0, 200) }
            : { stub: (customerMail.value as { stub?: boolean }).stub ?? false },
      },
      customerMail.status === "rejected" ? "error" : "info",
    );

    // TODO Make.com webhook — implementeres senere
    // if (process.env.MAKE_CONTACT_WEBHOOK_URL) { ... }

    logEvent(ctx, { area: "lifecycle", status: "ok", note: "submission-completed" });

    return NextResponse.json({
      ok: true,
      submission_id: ctx.id,
      drive_uploaded: drive.uploaded.length,
      drive_error: drive.error ? drive.error.message : null,
    });
  } catch (err) {
    logEvent(
      ctx,
      {
        area: "lifecycle",
        status: "failed",
        note: "unhandled-exception",
        meta: { message: err instanceof Error ? err.message : String(err) },
      },
      "error",
    );
    console.error("[contact] error", err);
    return NextResponse.json(
      { ok: false, error: "server-error", submission_id: ctx.id },
      { status: 500 },
    );
  }
}
