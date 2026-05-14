import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";
import { uploadLead } from "@/lib/drive";
import { sendAdminLeadNotification, sendContactConfirmation } from "@/lib/email";
import { findCallsForPhone } from "@/lib/retell";

/**
 * Contact form endpoint (multipart).
 *
 * Steps:
 *   1. Parse multipart form
 *   2. Honeypot check
 *   3. Turnstile verification (skipped in dev if secret unset)
 *   4. Zod validation
 *   5. Upload images to Google Drive (creates a folder for the lead; stub if creds missing)
 *   6. Forward lead to Make.com (when MAKE_CONTACT_WEBHOOK_URL is set)
 *   7. Send confirmation email to customer (when RESEND_API_KEY is set)
 *   8. Redirect to /tak (frontend handles routing on 200)
 *
 * All optional integrations log clearly when stubbed.
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

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    // honeypot — silently succeed so bots don't learn what failed
    if (String(form.get("website") ?? "").trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    // turnstile
    const token = String(form.get("turnstileToken") ?? "");
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? undefined;
    const verify = await verifyTurnstile(token, ip);
    if (!verify.ok) {
      return NextResponse.json({ ok: false, error: "captcha-failed" }, { status: 400 });
    }

    // text fields
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
      return NextResponse.json({ ok: false, error: "validation-failed", details: parsed.error.flatten() }, { status: 400 });
    }

    // files
    const fileEntries = form.getAll("billeder").filter((v): v is File => v instanceof File);
    if (fileEntries.length > MAX_FILES) {
      return NextResponse.json({ ok: false, error: "too-many-files" }, { status: 400 });
    }
    let totalBytes = 0;
    const files: { name: string; type: string; bytes: Buffer }[] = [];
    for (const f of fileEntries) {
      if (!ACCEPTED_MIME.has(f.type)) {
        return NextResponse.json({ ok: false, error: "invalid-file-type" }, { status: 400 });
      }
      totalBytes += f.size;
      if (totalBytes > MAX_TOTAL_BYTES) {
        return NextResponse.json({ ok: false, error: "total-size-exceeded" }, { status: 413 });
      }
      const buf = Buffer.from(await f.arrayBuffer());
      files.push({ name: f.name, type: f.type, bytes: buf });
    }

    // Upload to Drive — non-blocking. Drive failures (bad credentials,
    // network blip, folder permissions) must NOT lose the lead. We capture
    // them and continue so the customer still gets a confirmation email
    // and Adam still gets a notification.
    let drive: Awaited<ReturnType<typeof uploadLead>> = {
      folderId: null,
      folderUrl: null,
      uploaded: [],
      stub: true,
    };
    try {
      drive = await uploadLead({
        customer: parsed.data.navn,
        source: "kontakt",
        files,
      });
    } catch (err) {
      console.error("[contact] drive upload failed (non-fatal):", err);
    }

    const lead = {
      ...parsed.data,
      source: "kontakt",
      receivedAt: new Date().toISOString(),
      driveFolder: drive.folderUrl,
      driveFiles: drive.uploaded,
    };

    console.log("[contact] Lead modtaget:", lead);

    // Build the admin notification context with everything Adam needs to act
    // on this lead manually. Includes Drive folder link if upload succeeded.
    const adminContext = [
      parsed.data.opgavetype ? `Opgavetype: ${parsed.data.opgavetype}` : null,
      parsed.data.adresse ? `Adresse: ${parsed.data.adresse}` : null,
      `Besked:\n${parsed.data.besked}`,
      drive.folderUrl ? `\nDrive-mappe (billeder): ${drive.folderUrl}` : null,
      drive.uploaded && drive.uploaded.length > 0
        ? `Filer uploaded: ${drive.uploaded.length}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Look up prior Sofia calls for this phone number so the admin email
    // can clearly say "Sofia has / has not talked to this customer". The
    // helper has its own 4s timeout + try/catch — it never throws. Worst
    // case it returns an empty array, which the admin template treats as
    // "no prior contact" (showing the red banner). Run this BEFORE
    // sendAdminLeadNotification so we can pass the result in.
    const sofiaHistory = await findCallsForPhone(parsed.data.telefon).catch(() => []);

    // Fire both emails in parallel so a slow Resend response doesn't double
    // the form's perceived latency. Either failing only logs — the form
    // submission itself still succeeds (we've already stored the lead).
    const [adminMail, customerMail] = await Promise.allSettled([
      sendAdminLeadNotification({
        customerName: parsed.data.navn,
        customerPhone: parsed.data.telefon,
        customerEmail: parsed.data.email,
        source: "kontakt",
        context: adminContext,
        sofiaHistory,
      }),
      sendContactConfirmation({
        to: parsed.data.email,
        customerName: parsed.data.navn,
        besked: parsed.data.besked,
        opgavetype: parsed.data.opgavetype || undefined,
        adresse: parsed.data.adresse || undefined,
      }),
    ]);

    if (adminMail.status === "rejected") {
      console.error("[contact] admin mail failed:", adminMail.reason);
    }
    if (customerMail.status === "rejected") {
      console.error("[contact] customer mail failed:", customerMail.reason);
    }

    // TODO Make.com webhook — implementeres i morgen (per Adam 14/5)
    // if (process.env.MAKE_CONTACT_WEBHOOK_URL) {
    //   await fetch(process.env.MAKE_CONTACT_WEBHOOK_URL, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(lead),
    //   });
    // }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] error", err);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}
