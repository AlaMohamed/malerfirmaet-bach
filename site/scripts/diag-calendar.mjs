/**
 * Calendar diagnostic.
 *
 * Pulls the next 14 days of events from the configured GOOGLE_CALENDAR_ID
 * using the service-account credentials, plus a freebusy snapshot for the
 * same window. Useful when Sofia is offering slots that should be booked —
 * lets us see whether (a) the calendar ID is the right one and (b) the
 * service account can actually read the events.
 *
 * Run from site/ after `vercel env pull .env.production.local`:
 *   node scripts/diag-calendar.mjs
 */
import { google } from "googleapis";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Crude .env loader so the script works without dotenv installed.
const envPath = resolve(".env.production.local");
try {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(?:"(.*)"|(.*))$/);
    if (m) process.env[m[1]] = m[2] ?? m[3];
  }
} catch {
  // No env file — assume already exported
}

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar",
];

const calId = process.env.GOOGLE_CALENDAR_ID;
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!calId || !email || !key) {
  console.error("Missing env: need GOOGLE_CALENDAR_ID + GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  process.exit(1);
}

console.log("Calendar ID:", calId);
console.log("Service account:", email);
console.log();

const auth = new google.auth.JWT({ email, key, scopes: SCOPES });
const calendar = google.calendar({ version: "v3", auth });

const start = new Date();
const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);

// 1. Try to read calendar metadata (confirms read access at all)
try {
  const meta = await calendar.calendars.get({ calendarId: calId });
  console.log("Calendar summary:", meta.data.summary);
  console.log("Time zone:", meta.data.timeZone);
  console.log();
} catch (err) {
  console.error("calendars.get FAILED:", err.message);
  console.error("→ Service account probably doesn't have read access to this calendar.");
  console.error("→ Share the calendar with", email, "and grant 'See all event details'.");
  process.exit(1);
}

// 2. Freebusy snapshot — what Sofia sees when computing availability
console.log("=== freebusy.query() — what Sofia sees ===");
const fb = await calendar.freebusy.query({
  requestBody: {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    timeZone: "Europe/Copenhagen",
    items: [{ id: calId }],
  },
});
const busy = fb.data.calendars?.[calId]?.busy ?? [];
console.log(`Busy intervals in the next 14 days: ${busy.length}`);
for (const b of busy.slice(0, 20)) {
  console.log("  busy:", b.start, "→", b.end);
}
console.log();

// 3. events.list — same window, with details (what Adam sees in his calendar UI)
console.log("=== events.list() — full events ===");
const ev = await calendar.events.list({
  calendarId: calId,
  timeMin: start.toISOString(),
  timeMax: end.toISOString(),
  singleEvents: true,
  orderBy: "startTime",
  maxResults: 50,
});
const items = ev.data.items ?? [];
console.log(`Events in the next 14 days: ${items.length}`);
for (const e of items.slice(0, 20)) {
  const s = e.start?.dateTime ?? e.start?.date;
  const f = e.end?.dateTime ?? e.end?.date;
  const transparency = e.transparency ?? "opaque"; // "transparent" = free, "opaque" = busy
  console.log(`  ${transparency.padEnd(11)} ${s} → ${f}  "${e.summary ?? "(no title)"}"`);
}
console.log();

if (busy.length === 0 && items.length > 0) {
  console.warn("⚠ Events exist but freebusy returned 0 busy intervals.");
  console.warn("  Most likely cause: events are marked 'transparency: transparent' (= free)");
  console.warn("  which freebusy intentionally ignores. Fix in Google Calendar UI by");
  console.warn("  editing each event → 'Show me as' → Busy.");
}
if (items.length === 0) {
  console.warn("⚠ No events visible to the service account.");
  console.warn("  Either the calendar is genuinely empty, OR the calendar ID points to");
  console.warn("  a different calendar than the one Adam books into.");
}
