import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";
import { createOutboundCall, findCallsForPhone, isRetellConfigured } from "@/lib/retell";
import { sendAdminLeadNotification } from "@/lib/email";
import { logEvent, newSubmissionContext } from "@/lib/submission-log";

/**
 * POST /api/sofia
 *
 * Handles the "Ring mig op"-form submission from /book-besigtigelse.
 *
 * Flow:
 *   1. Honeypot + Turnstile + Zod validation
 *   2. Within business hours?
 *        - YES → trigger Retell outbound call (Sofia rings the customer)
 *        - NO  → mark as scheduled for next business day, do NOT call yet
 *   3. Always send Adam a backup notification so leads never go missing,
 *      even if Sofia is down or no phone number is configured.
 *
 * Adam can take over manually if Retell is unavailable.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  navn: z.string().min(2).max(120),
  telefon: z.string().min(8).max(20),
  email: z.string().email(),
  // Optional address trio — when filled, passes to Sofia as dynamic
  // variables so she can confirm rather than ask. All three are
  // independently optional (a customer might know the street but not
  // the postal code, or vice versa).
  adresse: z.string().max(200).optional().default(""),
  postnummer: z.string().max(10).optional().default(""),
  by: z.string().max(80).optional().default(""),
  samtykke: z.literal(true),
  kilde: z.string().optional(),
  turnstileToken: z.string().optional().default(""),
  website: z.string().optional().default(""),
});

// Business hours: Mon–Fri 06:00–17:00 (Europe/Copenhagen)
function isWithinBusinessHours(d = new Date()): boolean {
  // Use Intl to get the hour/day in Copenhagen regardless of server timezone
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Copenhagen",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const day = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  // minute parsing was only needed for the old half-hour boundary; keep
  // the parse just in case future logic wants finer granularity.
  parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
  const open = hour >= 6;
  const beforeClose = hour < 17;
  return isWeekday && open && beforeClose;
}

function normalizePhone(raw: string): string {
  // Strip spaces. If 8 digits and no leading +, assume Denmark and prepend +45.
  const cleaned = raw.replace(/\s|-/g, "");
  if (/^\d{8}$/.test(cleaned)) return `+45${cleaned}`;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("+")) return cleaned;
  return cleaned;
}

export async function POST(request: Request) {
  const ctx = newSubmissionContext("sofia-callback", request);
  logEvent(ctx, { area: "lifecycle", status: "ok", note: "submission-started" });

  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      logEvent(
        ctx,
        { area: "validation", status: "invalid", note: "zod-failed", meta: parsed.error.flatten() },
        "warn",
      );
      return NextResponse.json({ ok: false, error: "validation-failed", submission_id: ctx.id }, { status: 400 });
    }

    // Honeypot — bots fill any visible field
    if (parsed.data.website.trim() !== "") {
      logEvent(ctx, { area: "honeypot", status: "invalid", note: "bot-detected" }, "warn");
      return NextResponse.json({ ok: true, submission_id: ctx.id });
    }

    // Turnstile
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? undefined;
    const verify = await verifyTurnstile(parsed.data.turnstileToken, ip);
    if (!verify.ok) {
      logEvent(ctx, { area: "turnstile", status: "failed" }, "warn");
      return NextResponse.json({ ok: false, error: "captcha-failed", submission_id: ctx.id }, { status: 400 });
    }
    logEvent(ctx, { area: "turnstile", status: "ok" });

    const phoneE164 = normalizePhone(parsed.data.telefon);
    // SOFIA_TEST_MODE=true bypasses the business-hours check so we can test
    // the full Sofia flow outside of working hours. Leave UNSET in production.
    const bypassHours = process.env.SOFIA_TEST_MODE === "true";
    const withinHours = bypassHours || isWithinBusinessHours();
    const retellConfigured = isRetellConfigured();
    if (bypassHours) {
      console.log("[sofia] ⚠️ SOFIA_TEST_MODE active — bypassing business hours check");
    }

    let callTriggered = false;
    let scheduledFor: "asap" | "next-business-day" = "next-business-day";

    // Normalise the optional address fields into a single trim'd record
    // we can pass to Retell as dynamic variables AND surface in the
    // admin email. Empty strings stay empty rather than appearing as
    // "undefined" in Adam's inbox.
    const customerAddress = parsed.data.adresse.trim();
    const customerPostal = parsed.data.postnummer.trim();
    const customerCity = parsed.data.by.trim();
    const hasAddressData = !!(customerAddress || customerPostal || customerCity);

    if (withinHours && retellConfigured) {
      // Within hours: ring kunden NU via Sofia
      const r = await createOutboundCall({
        toNumber: phoneE164,
        customerName: parsed.data.navn,
        customerEmail: parsed.data.email,
        customerAddress,
        customerPostal,
        customerCity,
        metadata: { source: "ring-mig-op-form", submission_id: ctx.id },
      });
      callTriggered = r.ok && !r.stub;
      scheduledFor = "asap";
      logEvent(ctx, {
        area: "retell-call",
        status: callTriggered ? "ok" : r.stub ? "stub" : "failed",
        meta: { callId: r.callId, stub: r.stub ?? false, error: r.error },
      }, callTriggered ? "info" : "warn");
    } else {
      // Outside hours OR no phone number yet — Sofia ringer ikke nu
      scheduledFor = withinHours ? "asap" : "next-business-day";
      logEvent(ctx, {
        area: "retell-call",
        status: "skipped",
        note: withinHours ? "retell-not-configured" : "outside-business-hours",
        meta: { withinHours, retellConfigured },
      });
    }

    // Always notify Adam — sikkerhedsnet
    const baseNote = callTriggered
      ? `Sofia ringer kunden op NU. Hvis hun ikke når at booke en tid, ringer du selv op.`
      : retellConfigured
      ? `Henvendelse uden for åbningstid. Sofia ringer næste hverdag morgen. Du kan også ringe manuelt.`
      : `Sofia er endnu ikke aktiveret (manglende RETELL_FROM_NUMBER). Ring kunden op manuelt.`;

    // Append the customer-supplied address details when present — Adam
    // gets them at a glance, AND Sofia has already received them as
    // dynamic variables so the call should reference them.
    const addressLine = hasAddressData
      ? [
          customerAddress || null,
          customerPostal && customerCity
            ? `${customerPostal} ${customerCity}`
            : customerPostal || customerCity || null,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    const note = addressLine
      ? `${baseNote}\n\nKunden angav adresse:\n${addressLine}`
      : baseNote;

    // Only look up call history when Sofia ISN'T calling right now. If she
    // is calling now (callTriggered=true), the "Sofia ringer kunden op NU"
    // note already explains the state — we don't want a red "har IKKE talt
    // med kunden" banner appearing for a call literally in progress.
    // For deferred calls (out-of-hours / not-configured), surfacing prior
    // contact history helps Adam know whether this is a returning lead.
    const sofiaHistory = callTriggered
      ? undefined
      : await findCallsForPhone(phoneE164).catch(() => []);

    const adminResult = await sendAdminLeadNotification({
      customerName: parsed.data.navn,
      customerPhone: phoneE164,
      customerEmail: parsed.data.email,
      source: "sofia-callback",
      context: note,
      sofiaHistory,
      submissionId: ctx.id,
    }).catch((err) => {
      logEvent(
        ctx,
        { area: "email-admin", status: "failed", meta: { reason: String(err).slice(0, 200) } },
        "error",
      );
      return { ok: false } as const;
    });
    if (adminResult && (adminResult as { ok: boolean }).ok) {
      logEvent(ctx, { area: "email-admin", status: "ok" });
    }

    logEvent(ctx, { area: "lifecycle", status: "ok", note: "submission-completed" });

    return NextResponse.json({
      ok: true,
      callTriggered,
      scheduledFor,
      submission_id: ctx.id,
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
    console.error("[sofia] error", err);
    return NextResponse.json({ ok: false, error: "server-error", submission_id: ctx.id }, { status: 500 });
  }
}
