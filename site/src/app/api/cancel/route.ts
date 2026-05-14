import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCancelToken } from "@/lib/cancel-token";
import { cancelBooking, getBooking, isConfigured } from "@/lib/google-calendar";
import { sendCancellationConfirmation } from "@/lib/email";

/**
 * POST /api/cancel
 *
 * Called by the customer from /aflys?token=... when they confirm
 * the cancellation. Token is HMAC-signed and contains the eventId.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  token: z.string().min(10),
});

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "calendar-not-configured" }, { status: 503 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { body = {}; }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation-failed" }, { status: 400 });
  }

  const payload = verifyCancelToken(parsed.data.token);
  if (!payload) {
    return NextResponse.json({ error: "invalid-or-expired-token" }, { status: 400 });
  }

  try {
    // Lookup event for customer details before deleting
    let customerEmail = "";
    let customerName = "";
    let startISO = new Date().toISOString();
    try {
      const event = await getBooking(payload.eventId);
      customerEmail = event.extendedProperties?.private?.customerEmail ?? "";
      customerName = (event.summary ?? "").replace(/^Besigtigelse — /, "");
      startISO = event.start?.dateTime ?? startISO;
    } catch {
      // Event not found — possibly already cancelled. Continue anyway.
    }

    await cancelBooking(payload.eventId);

    if (customerEmail) {
      await sendCancellationConfirmation({ to: customerEmail, customerName, startISO });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cancel] error", err);
    return NextResponse.json({ error: "cancel-failed" }, { status: 500 });
  }
}
