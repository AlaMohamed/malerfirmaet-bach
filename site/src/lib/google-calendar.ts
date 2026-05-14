/**
 * Google Calendar integration for Sofia's direct booking flow.
 *
 * - findAvailableSlots: returns N suggested time slots within working hours
 * - createBooking:      inserts an event with 30-min buffers on each side
 * - cancelBooking:      deletes an event (used by /aflys flow)
 * - getBooking:         reads an event for the cancellation confirmation page
 *
 * All times are handled in Europe/Copenhagen.
 */
import { google, calendar_v3 } from "googleapis";

// =========================================================================
// Config
// =========================================================================

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const TZ = "Europe/Copenhagen";

// Adam's working hours (Mon–Fri 07:00–17:30)
// Effective bookable hours after 30-min buffer: 07:30 – 17:00
const WORKING_HOURS = {
  workDays: [1, 2, 3, 4, 5], // Mon=1 ... Fri=5 (JS getDay: Sun=0)
  startHour: 7,
  startMinute: 30,
  endHour: 17,
  endMinute: 0,
};

const BUFFER_MIN = 30;

/**
 * Lead-time policy (in hours).
 *  - MIN_LEAD: minimum hours from now before a booking can start.
 *    Both findAvailableSlots and verifySlotAvailable use this constant
 *    so Sofia never gets offered a slot she can't actually book.
 *  - MAX_AHEAD: max days bookable in the future.
 */
export const MIN_LEAD_HOURS = 3;
export const MAX_AHEAD_DAYS = 30;
const MIN_LEAD_MS = MIN_LEAD_HOURS * 60 * 60 * 1000;
const MAX_AHEAD_MS = MAX_AHEAD_DAYS * 24 * 60 * 60 * 1000;

// =========================================================================
// Client
// =========================================================================

function getCalendar(): calendar_v3.Calendar {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !key) {
    throw new Error("Google Service Account credentials missing — set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  }
  const auth = new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });
  return google.calendar({ version: "v3", auth });
}

function calendarId(): string {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error("GOOGLE_CALENDAR_ID is not set");
  return id;
}

export function isConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

// =========================================================================
// Availability
// =========================================================================

export interface AvailabilitySlot {
  start: string; // ISO 8601 in UTC
  end: string;
  /** Human-readable Danish string e.g. "Tirsdag 20. maj kl. 14:00" */
  label: string;
}

/**
 * Find available slots within the next `daysAhead` days, matching the
 * requested time-of-day preference. Returns up to `count` slots.
 *
 * Algorithm: walks each working day, builds candidate slots that respect
 * working hours and 30-min buffer, then removes those overlapping existing
 * calendar events.
 */
export async function findAvailableSlots(opts: {
  fromDate?: string;  // YYYY-MM-DD, defaults to today (or tomorrow if it's already late)
  durationMin: number;
  daysAhead?: number;
  preferredTimeOfDay?: "morning" | "afternoon" | "any";
  count?: number;
}): Promise<AvailabilitySlot[]> {
  const calendar = getCalendar();
  const calId = calendarId();
  const duration = opts.durationMin;
  const daysAhead = opts.daysAhead ?? 14;
  const count = opts.count ?? 3;
  const preference = opts.preferredTimeOfDay ?? "any";

  const start = opts.fromDate
    ? new Date(opts.fromDate + "T00:00:00")
    : new Date();
  // Don't suggest a slot less than MIN_LEAD_HOURS from now.
  // Identical rule to verifySlotAvailable so Sofia never gets a slot rejected later.
  const earliest = new Date(Date.now() + MIN_LEAD_MS);

  const rangeEnd = new Date(start.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  // Pull busy times in the search range
  const fb = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: rangeEnd.toISOString(),
      timeZone: TZ,
      items: [{ id: calId }],
    },
  });
  const busy = (fb.data.calendars?.[calId]?.busy ?? []).map((b) => ({
    start: new Date(b.start!),
    end: new Date(b.end!),
  }));

  // Generate candidate slots
  const candidates: { start: Date; end: Date }[] = [];
  for (let dayOffset = 0; dayOffset < daysAhead && candidates.length < count * 3; dayOffset++) {
    const day = new Date(start.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const weekday = getDayInTz(day, TZ);
    if (!WORKING_HOURS.workDays.includes(weekday)) continue;

    // For preference: morning = 07:30-12:00, afternoon = 12:00-17:00, any = full
    const dayStart = atTime(day, WORKING_HOURS.startHour, WORKING_HOURS.startMinute, TZ);
    const dayEnd = atTime(day, WORKING_HOURS.endHour, WORKING_HOURS.endMinute, TZ);
    let windowStart = dayStart;
    let windowEnd = dayEnd;
    if (preference === "morning") {
      windowEnd = atTime(day, 12, 0, TZ);
    } else if (preference === "afternoon") {
      windowStart = atTime(day, 12, 0, TZ);
    }

    // Walk in 30-min increments
    const step = 30 * 60 * 1000;
    for (let t = windowStart.getTime(); t + duration * 60 * 1000 <= windowEnd.getTime(); t += step) {
      const slotStart = new Date(t);
      const slotEnd = new Date(t + duration * 60 * 1000);
      // Pre-buffer (kørsel) blocks: 30 min before slot start.
      // No post-buffer needed — the next meeting's pre-buffer covers travel out.
      const blockedStart = new Date(t - BUFFER_MIN * 60 * 1000);
      const blockedEnd = slotEnd;

      if (slotStart < earliest) continue;
      if (busy.some((b) => overlaps(b.start, b.end, blockedStart, blockedEnd))) continue;

      candidates.push({ start: slotStart, end: slotEnd });
      if (candidates.length >= count) break;
    }
  }

  // Format
  return candidates.slice(0, count).map((c) => ({
    start: c.start.toISOString(),
    end: c.end.toISOString(),
    label: formatLabel(c.start),
  }));
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

function atTime(refDate: Date, hour: number, minute: number, tz: string): Date {
  // Builds a Date for the same calendar day as refDate at hour:minute in tz.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(refDate);
  // fmt: YYYY-MM-DD
  const [y, m, d] = fmt.split("-").map(Number);
  // Construct local-in-tz; using fixed +02:00 (Denmark summer) would be wrong year-round.
  // We use ISO + tz offset by trial: build a "naive" UTC date and let Intl correct it.
  // Easier: use Date.UTC and apply tz offset manually.
  return new Date(`${pad(y)}-${pad(m)}-${pad(d)}T${pad(hour)}:${pad(minute)}:00${getTzOffset(new Date(Date.UTC(y, m - 1, d, hour, minute)), tz)}`);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function getTzOffset(d: Date, tz: string): string {
  // Returns the offset like "+02:00" or "+01:00" for the given date in tz.
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  });
  const parts = dtf.formatToParts(d);
  const offsetStr = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  // offsetStr like "GMT+2" or "GMT+02:00"
  const m = offsetStr.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/);
  if (!m) return "+00:00";
  const sign = m[1].startsWith("-") ? "-" : "+";
  const hours = pad(Math.abs(parseInt(m[1], 10)));
  const minutes = m[2] ?? "00";
  return `${sign}${hours}:${minutes}`;
}

function getDayInTz(d: Date, tz: string): number {
  // Returns 0=Sun ... 6=Sat for the date as seen in tz.
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d);
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday] ?? 0;
}

function formatLabel(d: Date): string {
  const weekday = new Intl.DateTimeFormat("da-DK", { timeZone: TZ, weekday: "long" }).format(d);
  const dateStr = new Intl.DateTimeFormat("da-DK", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).format(d);
  const time = new Intl.DateTimeFormat("da-DK", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dateStr} kl. ${time}`;
}

// =========================================================================
// Pre-booking checks
// =========================================================================

/**
 * Verify the slot at (startISO, startISO+durationMin) is genuinely free.
 * Re-queries freebusy at booking time to catch race conditions, and confirms
 * the slot falls within Adams working hours.
 *
 * Returns { ok: true } if safe to insert, otherwise { ok: false, reason }.
 */
export async function verifySlotAvailable(opts: {
  startISO: string;
  durationMin: number;
}): Promise<{ ok: true } | { ok: false; reason: "outside-working-hours" | "slot-taken" | "outside-min-lead" | "outside-max-window" }> {
  const calendar = getCalendar();
  const calId = calendarId();

  const start = new Date(opts.startISO);
  if (isNaN(start.getTime())) return { ok: false, reason: "slot-taken" };

  const end = new Date(start.getTime() + opts.durationMin * 60 * 1000);

  // Lead-time policy: must be ≥ MIN_LEAD_HOURS from now, ≤ MAX_AHEAD_DAYS from now.
  // Same constants used by findAvailableSlots → Sofia never gets a stale slot.
  const now = Date.now();
  if (start.getTime() - now < MIN_LEAD_MS) return { ok: false, reason: "outside-min-lead" };
  if (start.getTime() - now > MAX_AHEAD_MS) return { ok: false, reason: "outside-max-window" };

  // Working hours check (in Europe/Copenhagen)
  const weekday = getDayInTz(start, TZ);
  if (!WORKING_HOURS.workDays.includes(weekday)) return { ok: false, reason: "outside-working-hours" };

  // Build today's working window in TZ
  const dayStart = atTime(start, WORKING_HOURS.startHour, WORKING_HOURS.startMinute, TZ);
  const dayEnd = atTime(start, WORKING_HOURS.endHour, WORKING_HOURS.endMinute, TZ);
  if (start < dayStart || end > dayEnd) return { ok: false, reason: "outside-working-hours" };

  // Freebusy check
  const blockedStart = new Date(start.getTime() - BUFFER_MIN * 60 * 1000);
  const blockedEnd = end;
  const fb = await calendar.freebusy.query({
    requestBody: {
      timeMin: blockedStart.toISOString(),
      timeMax: blockedEnd.toISOString(),
      timeZone: TZ,
      items: [{ id: calId }],
    },
  });
  const busy = fb.data.calendars?.[calId]?.busy ?? [];
  if (busy.length > 0) return { ok: false, reason: "slot-taken" };

  return { ok: true };
}

// =========================================================================
// Booking
// =========================================================================

export interface BookingInput {
  name: string;
  phone: string;
  email: string;
  startISO: string;
  durationMin: number;
  address: string;
  projectDescription: string;
  postalCode?: string;
}

export interface BookingResult {
  eventId: string;
  startISO: string;
  endISO: string;
  htmlLink: string | null;
}

/**
 * Inserts TWO events into the calendar:
 *   1. "Kørsel" pre-buffer event (30 min) — shown grey in Adams kalender
 *   2. The actual besigtigelse event (30 min) — shown green
 *
 * No post-meeting buffer (Adams ønske — holder kalenderen ren).
 * Cancellation deletes both via the preBufferId stored in extendedProperties.
 */
export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const calendar = getCalendar();
  const calId = calendarId();

  const start = new Date(input.startISO);
  const end = new Date(start.getTime() + input.durationMin * 60 * 1000);
  const bufferStart = new Date(start.getTime() - BUFFER_MIN * 60 * 1000);

  // 1) Pre-meeting buffer (kørsel)
  const preBuffer = await calendar.events.insert({
    calendarId: calId,
    requestBody: {
      summary: `Kørsel → ${input.name}`,
      description: "Buffer-tid før besigtigelse. Oprettet automatisk af Sofia.",
      start: { dateTime: bufferStart.toISOString(), timeZone: TZ },
      end: { dateTime: start.toISOString(), timeZone: TZ },
      colorId: "8", // graphite/grey
      transparency: "opaque",
    },
  });

  // 2) Main meeting
  const main = await calendar.events.insert({
    calendarId: calId,
    requestBody: {
      summary: `Besigtigelse — ${input.name}`,
      description: [
        `📞 Booket via Sofia (AI)`,
        ``,
        `Kunde: ${input.name}`,
        `Telefon: ${input.phone}`,
        `E-mail: ${input.email}`,
        `Adresse: ${input.address}`,
        ``,
        `Projekt-beskrivelse:`,
        input.projectDescription || "(ingen beskrivelse angivet)",
        ``,
        `30-min kørsels-buffer er lagt før mødet.`,
      ].join("\n"),
      location: input.address,
      start: { dateTime: start.toISOString(), timeZone: TZ },
      end: { dateTime: end.toISOString(), timeZone: TZ },
      colorId: "10", // basil (green) — easily distinguishable
      transparency: "opaque",
      extendedProperties: {
        private: {
          preBufferId: preBuffer.data.id ?? "",
          customerEmail: input.email,
          customerPhone: input.phone,
          customerName: input.name,
          source: "sofia-ai",
        },
      },
    },
  });

  return {
    eventId: main.data.id!,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    htmlLink: main.data.htmlLink ?? null,
  };
}

export async function cancelBooking(eventId: string): Promise<{ ok: boolean }> {
  const calendar = getCalendar();
  const calId = calendarId();

  // Get the main event so we can find the pre-buffer id and clean it up too
  let preBufferId: string | undefined;
  try {
    const main = await calendar.events.get({ calendarId: calId, eventId });
    preBufferId = main.data.extendedProperties?.private?.preBufferId || undefined;
  } catch (err) {
    console.warn("[cancelBooking] could not fetch main event before deleting", err);
  }

  // Best-effort delete pre-buffer
  if (preBufferId) {
    try {
      await calendar.events.delete({ calendarId: calId, eventId: preBufferId });
    } catch (err) {
      console.warn(`[cancelBooking] failed to delete pre-buffer ${preBufferId}`, err);
    }
  }

  // Delete main
  await calendar.events.delete({ calendarId: calId, eventId });
  return { ok: true };
}

export async function getBooking(eventId: string) {
  const calendar = getCalendar();
  const calId = calendarId();
  const e = await calendar.events.get({ calendarId: calId, eventId });
  return e.data;
}
