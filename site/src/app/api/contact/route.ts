import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";
import { uploadLead } from "@/lib/drive";
import { sendAdminLeadNotification, sendContactConfirmation } from "@/lib/email";
import { findCallsForPhone } from "@/lib/retell";
import { logEvent, newSubmissionContext } from "@/lib/submission-log";

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

const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/heic", "image/heif"]);

const Schema = z.object({
  navn: z.string().min(2),
  telefon: z.string().min(8),
  email: z.string().email(),
  adresse: z.string().optional().default(""),
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
    logEvent(ctx, {
      area: "files",
      status: "ok",
      meta: { count: files.length, totalBytes, names: files.map((f) => f.name) },
    });

    // 5. Drive upload — non-throwing, error captured for admin email
    const drive = await uploadLead({
      customer: parsed.data.navn,
      source: "kontakt",
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

    // 6. Build admin-email context (kept human-readable)
    const adminContext = [
      parsed.data.opgavetype ? `Opgavetype: ${parsed.data.opgavetype}` : null,
      parsed.data.adresse ? `Adresse: ${parsed.data.adresse}` : null,
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
      }),
      sendContactConfirmation({
        to: parsed.data.email,
        customerName: parsed.data.navn,
        besked: parsed.data.besked,
        opgavetype: parsed.data.opgavetype || undefined,
        adresse: parsed.data.adresse || undefined,
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
