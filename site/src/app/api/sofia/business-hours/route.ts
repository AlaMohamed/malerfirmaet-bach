import { NextResponse } from "next/server";
import { authorizeSofia } from "@/lib/sofia-auth";

/**
 * POST /api/sofia/business-hours
 *
 * Called by Sofia BEFORE transferring a customer to Adam, so the decision
 * about transferring is server-side (LLMs can't reliably read clocks).
 *
 * Returns whether it's currently within Adam's working hours
 * (Mon–Fri 06:00–17:00 in Europe/Copenhagen), the human-readable current
 * Danish time, and the next open window if currently closed.
 *
 * Sofia's prompt uses `is_open` to decide whether to call transfer_to_adam
 * or to offer a callback booking instead.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TZ = "Europe/Copenhagen";

interface DkParts {
  weekday: number; // 0 Sun … 6 Sat
  hour: number;
  minute: number;
}

function copenhagenParts(d: Date): DkParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const weekday = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd] ?? 0;
  return { weekday, hour, minute };
}

function isOpen(p: DkParts): boolean {
  if (p.weekday < 1 || p.weekday > 5) return false; // not Mon-Fri
  const minutes = p.hour * 60 + p.minute;
  // Open window: 06:00 (inclusive) until 17:00 (exclusive).
  return minutes >= 6 * 60 && minutes < 17 * 60;
}

function nextOpenDanishString(now: Date): string {
  // Walk forward in 15-min increments until we hit Mon-Fri 06:00.
  for (let i = 0; i < 7 * 24 * 4; i++) {
    const d = new Date(now.getTime() + i * 15 * 60 * 1000);
    const p = copenhagenParts(d);
    if (p.weekday >= 1 && p.weekday <= 5 && p.hour >= 6 && p.hour < 17) {
      const fmt = new Intl.DateTimeFormat("da-DK", {
        timeZone: TZ,
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
      return fmt.format(d);
    }
  }
  return "snart";
}

export async function POST(request: Request) {
  const auth = authorizeSofia(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const now = new Date();
  const parts = copenhagenParts(now);
  const open = isOpen(parts);

  const currentTimeDk = new Intl.DateTimeFormat("da-DK", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  if (open) {
    return NextResponse.json({
      is_open: true,
      current_time_dk: currentTimeDk,
      sofiaMessage: "Adam er ved telefonen nu. Det er OK at kalde transfer_to_adam.",
    });
  }

  return NextResponse.json({
    is_open: false,
    current_time_dk: currentTimeDk,
    next_open_dk: nextOpenDanishString(now),
    sofiaMessage:
      "Adam er IKKE ved telefonen lige nu (uden for man-fre 06:00-17:00). Tilbyd kunden en booking i stedet — kald IKKE transfer_to_adam.",
  });
}
