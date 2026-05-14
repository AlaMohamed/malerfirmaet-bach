import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";
import { createOutboundCall, findCallsForPhone, isRetellConfigured } from "@/lib/retell";
import { sendAdminLeadNotification } from "@/lib/email";

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
  samtykke: z.literal(true),
  kilde: z.string().optional(),
  turnstileToken: z.string().optional().default(""),
  website: z.string().optional().default(""),
});

// Business hours: Mon–Fri 07:00–17:30 (Europe/Copenhagen)
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
  const min = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
  const open = hour > 7 || (hour === 7 && min >= 0);
  const beforeClose = hour < 17 || (hour === 17 && min < 30);
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
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "validation-failed" }, { status: 400 });
    }

    // Honeypot — bots fill any visible field
    if (parsed.data.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    // Turnstile
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? undefined;
    const verify = await verifyTurnstile(parsed.data.turnstileToken, ip);
    if (!verify.ok) {
      return NextResponse.json({ ok: false, error: "captcha-failed" }, { status: 400 });
    }

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

    if (withinHours && retellConfigured) {
      // Within hours: ring kunden NU via Sofia
      const r = await createOutboundCall({
        toNumber: phoneE164,
        customerName: parsed.data.navn,
        customerEmail: parsed.data.email,
        metadata: { source: "ring-mig-op-form" },
      });
      callTriggered = r.ok && !r.stub;
      scheduledFor = "asap";
      console.log("[sofia] Outbound call:", { triggered: callTriggered, stub: r.stub ?? false, callId: r.callId });
    } else {
      // Outside hours OR no phone number yet — Sofia ringer ikke nu
      scheduledFor = withinHours ? "asap" : "next-business-day";
      console.log("[sofia] Call NOT triggered:", { withinHours, retellConfigured });
    }

    // Always notify Adam — sikkerhedsnet
    const note = callTriggered
      ? `Sofia ringer kunden op NU. Hvis hun ikke når at booke en tid, ringer du selv op.`
      : retellConfigured
      ? `Henvendelse uden for åbningstid. Sofia ringer næste hverdag morgen. Du kan også ringe manuelt.`
      : `Sofia er endnu ikke aktiveret (manglende RETELL_FROM_NUMBER). Ring kunden op manuelt.`;

    // Only look up call history when Sofia ISN'T calling right now. If she
    // is calling now (callTriggered=true), the "Sofia ringer kunden op NU"
    // note already explains the state — we don't want a red "har IKKE talt
    // med kunden" banner appearing for a call literally in progress.
    // For deferred calls (out-of-hours / not-configured), surfacing prior
    // contact history helps Adam know whether this is a returning lead.
    const sofiaHistory = callTriggered
      ? undefined
      : await findCallsForPhone(phoneE164).catch(() => []);

    await sendAdminLeadNotification({
      customerName: parsed.data.navn,
      customerPhone: phoneE164,
      customerEmail: parsed.data.email,
      source: "sofia-callback",
      context: note,
      sofiaHistory,
    });

    return NextResponse.json({
      ok: true,
      callTriggered,
      scheduledFor,
    });
  } catch (err) {
    console.error("[sofia] error", err);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}
