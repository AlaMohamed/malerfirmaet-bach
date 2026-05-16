import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeSofia } from "@/lib/sofia-auth";
import { createBooking, isConfigured, verifySlotAvailable } from "@/lib/google-calendar";
import { signCancelToken } from "@/lib/cancel-token";
import { sendBookingConfirmation } from "@/lib/email";
import { company } from "@/content/site";

/**
 * POST /api/sofia/book
 *
 * Called by Sofia (Retell Custom Function) to create the booking once
 * the customer has agreed to a specific time slot.
 *
 * Hardening (May 2026):
 *  - Re-verifies slot availability against live freebusy → catches Sofia
 *    hallucinating wrong ISO timestamps
 *  - Enforces 13-hour minimum lead time + 30-day maximum
 *  - Enforces working-hours window before insert
 *  - Idempotency: same idempotency_key within 5 min returns the existing
 *    booking instead of creating a duplicate
 *  - Returns specific error codes Sofia can use to recover gracefully
 *
 * Request body:
 * {
 *   "name":                "Lars Hansen",
 *   "phone":               "+4512345678",
 *   "email":               "lars@example.dk",
 *   "start":               "2026-05-20T14:00:00+02:00",
 *   "duration_min":        30,
 *   "address":             "Hovedgaden 1, 2860 Søborg",
 *   "project_description": "Indvendig maling af stue og soveværelse, ca 25 kvm",
 *   "idempotency_key":     "call-abc123"  // optional but recommended (Sofia uses Retell call_id)
 * }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// LLMs often send `null` for unset optional fields. Strip them so .optional()
// works as expected and we don't reject valid calls.
function stripNulls(input: unknown): unknown {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).filter(([, v]) => v !== null),
    );
  }
  return input;
}

const Schema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email(),
  start: z.string(),
  duration_min: z.number().int().min(15).max(180).optional().default(30),
  address: z.string().min(4).max(200),
  project_description: z.string().max(2000).optional().default(""),
  idempotency_key: z.string().max(100).optional(),
});

// In-memory idempotency cache. Resets on cold start — for production-grade we
// could persist in Vercel KV, but bookings are rare enough that this is fine.
interface CachedBooking {
  at: number;
  payload: Record<string, unknown>;
}
const idempotencyCache = new Map<string, CachedBooking>();
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;

function pruneCache() {
  const now = Date.now();
  const toDelete: string[] = [];
  idempotencyCache.forEach((value, key) => {
    if (now - value.at > IDEMPOTENCY_TTL_MS) toDelete.push(key);
  });
  toDelete.forEach((k) => idempotencyCache.delete(k));
}

const REASON_MAP: Record<string, { status: number; sofiaMessage: string }> = {
  "outside-working-hours": {
    status: 422,
    sofiaMessage:
      "Det tidspunkt ligger uden for Adams arbejdstid (man-fre 06:00–17:00). Bed kunden vælge en anden tid fra check_availability.",
  },
  "slot-taken": {
    status: 409,
    sofiaMessage:
      "Den tid er ikke længere ledig — den blev sandsynligvis taget mens I talte. Kør check_availability igen og tilbyd kunden alternativer.",
  },
  "outside-min-lead": {
    status: 422,
    sofiaMessage:
      "Bookinger skal være mindst 3 timer ude i fremtiden. Bed kunden vælge en tid senere fra check_availability.",
  },
  "outside-max-window": {
    status: 422,
    sofiaMessage:
      "Bookinger kan kun foretages op til 30 dage frem. Bed kunden vælge en tid tidligere.",
  },
};

export async function POST(request: Request) {
  const auth = authorizeSofia(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isConfigured()) {
    return NextResponse.json({ error: "calendar-not-configured" }, { status: 503 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { body = {}; }
  body = stripNulls(body);

  // Defense in depth: catch unresolved Retell dynamic-variable placeholders
  // BEFORE zod runs. Without this, "{{customer_email}}" trips zod's email()
  // validator with the generic "Invalid input" message — Sofia then has no
  // idea which field is the actual problem. Web-call tests from the Retell
  // dashboard frequently surface this (variables are never populated), so
  // we return a specific error that tells Sofia exactly which field to
  // collect from the customer.
  if (body && typeof body === "object") {
    const fields = ["name", "phone", "email", "address", "project_description"] as const;
    const placeholderFields: string[] = [];
    for (const f of fields) {
      const v = (body as Record<string, unknown>)[f];
      if (typeof v === "string" && /\{\{[^}]+\}\}/.test(v)) {
        placeholderFields.push(f);
      }
    }
    if (placeholderFields.length > 0) {
      console.error("[sofia/book] ❌ UNRESOLVED PLACEHOLDERS", { placeholderFields });
      return NextResponse.json(
        {
          error: "unresolved-placeholders",
          fields: placeholderFields,
          sofiaMessage:
            `Felterne [${placeholderFields.join(", ")}] indeholder placeholder-strenge der ikke er udfyldt. Spørg kunden direkte om disse værdier i samtalen — kald ALDRIG book_appointment med "{{...}}"-strenge.`,
        },
        { status: 400 },
      );
    }
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    // Detailed log for debugging — shows exactly which field Sofia sent wrong.
    // Phone/email are partially redacted to avoid PII in logs.
    const safeBody = body && typeof body === "object" ? { ...(body as Record<string, unknown>) } : {};
    if (typeof safeBody.phone === "string") safeBody.phone = safeBody.phone.slice(0, 6) + "***";
    if (typeof safeBody.email === "string") {
      const [u, d] = safeBody.email.split("@");
      safeBody.email = `${u.slice(0, 2)}***@${d ?? ""}`;
    }
    console.error("[sofia/book] ❌ VALIDATION FAILED", {
      receivedFields: safeBody,
      missingOrInvalid: parsed.error.flatten(),
    });
    return NextResponse.json(
      {
        error: "validation-failed",
        sofiaMessage: "Et eller flere felter mangler. Saml alle 6 påkrævede felter (name, phone, email, start, address, project_description) før du kalder mig igen.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Idempotency check
  pruneCache();
  if (data.idempotency_key) {
    const cached = idempotencyCache.get(data.idempotency_key);
    if (cached) {
      return NextResponse.json({ ...cached.payload, idempotent_replay: true });
    }
  }

  // Verify slot is actually free + within constraints
  const verify = await verifySlotAvailable({
    startISO: data.start,
    durationMin: data.duration_min,
  });
  if (!verify.ok) {
    const info = REASON_MAP[verify.reason] ?? { status: 422, sofiaMessage: "Ukendt fejl ved booking — kør check_availability igen." };
    return NextResponse.json(
      { error: verify.reason, sofiaMessage: info.sofiaMessage },
      { status: info.status },
    );
  }

  try {
    const booking = await createBooking({
      name: data.name,
      phone: data.phone,
      email: data.email,
      startISO: new Date(data.start).toISOString(),
      durationMin: data.duration_min,
      address: data.address,
      projectDescription: data.project_description,
    });

    const token = signCancelToken(booking.eventId);
    const base = process.env.NEXT_PUBLIC_SITE_URL || company.url;
    const cancelUrl = `${base}/aflys?token=${encodeURIComponent(token)}`;

    const mailResult = await sendBookingConfirmation({
      to: data.email,
      customerName: data.name,
      startISO: booking.startISO,
      endISO: booking.endISO,
      address: data.address,
      projectDescription: data.project_description,
      cancelUrl,
      eventId: booking.eventId,
    });

    console.log("[sofia/book] Booking oprettet:", {
      eventId: booking.eventId,
      customer: data.name,
      when: booking.startISO,
      emailSent: mailResult.ok,
      idempotency: data.idempotency_key ?? "none",
    });

    const payload = {
      ok: true,
      event_id: booking.eventId,
      start: booking.startISO,
      end: booking.endISO,
      cancel_url: cancelUrl,
      email_sent: mailResult.ok,
      email_stub: mailResult.stub ?? false,
      sofiaMessage: `Booket. Bekræftelse sendt til ${data.email}.`,
    };

    if (data.idempotency_key) {
      idempotencyCache.set(data.idempotency_key, { at: Date.now(), payload });
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[sofia/book] error", err);
    const msg = err instanceof Error ? err.message : "server-error";
    return NextResponse.json(
      {
        error: "booking-failed",
        details: msg,
        sofiaMessage: "Der opstod en intern fejl. Sig til kunden at Adam ringer manuelt op snarest — og afslut samtalen høfligt.",
      },
      { status: 500 },
    );
  }
}
