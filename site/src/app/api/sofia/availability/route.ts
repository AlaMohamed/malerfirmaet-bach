import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeSofia } from "@/lib/sofia-auth";
import { findAvailableSlots, isConfigured } from "@/lib/google-calendar";

/**
 * POST /api/sofia/availability
 *
 * Called by Sofia (Retell Custom Function) to ask:
 *   "Hvilke tider er ledige i Adams kalender?"
 *
 * Auth: header  X-Sofia-Secret  must match SOFIA_API_SECRET.
 *
 * Request body:
 * {
 *   "preferred_date":      "2026-05-20"        // YYYY-MM-DD, optional
 *   "duration_min":        30,                  // default 30
 *   "preferred_time_of_day": "morning" | "afternoon" | "any",  // optional
 *   "days_ahead":          14                   // optional
 * }
 *
 * Response:
 * {
 *   "slots": [
 *     { "start": "ISO", "end": "ISO", "label": "Tirsdag 20. maj kl. 14:00" },
 *     ... up to 3
 *   ],
 *   "count": 3
 * }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// LLMs (especially GPT) often send `null` for omitted optional fields.
// We coerce all `null` values to `undefined` before validation so the schema
// can use simple `.optional()` semantics without choking on nulls.
function stripNulls(input: unknown): unknown {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).filter(([, v]) => v !== null),
    );
  }
  return input;
}

const Schema = z.object({
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  duration_min: z.number().int().min(15).max(180).optional().default(30),
  preferred_time_of_day: z.enum(["morning", "afternoon", "any"]).optional().default("any"),
  days_ahead: z.number().int().min(1).max(60).optional().default(14),
});

export async function POST(request: Request) {
  const auth = authorizeSofia(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isConfigured()) {
    return NextResponse.json(
      { error: "calendar-not-configured", hint: "Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY and GOOGLE_CALENDAR_ID" },
      { status: 503 },
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch { body = {}; }
  body = stripNulls(body);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    console.error("[sofia/availability] ❌ VALIDATION FAILED", {
      receivedFields: body,
      missingOrInvalid: parsed.error.flatten(),
    });
    return NextResponse.json(
      {
        error: "validation-failed",
        sofiaMessage: "Et felt er ugyldigt. Ring check_availability igen med kun de relevante felter — udelad felter du ikke har et svar på.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const slots = await findAvailableSlots({
      fromDate: parsed.data.preferred_date,
      durationMin: parsed.data.duration_min,
      preferredTimeOfDay: parsed.data.preferred_time_of_day,
      daysAhead: parsed.data.days_ahead,
      count: 3,
    });

    return NextResponse.json({ slots, count: slots.length });
  } catch (err) {
    console.error("[sofia/availability] error", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }
}
