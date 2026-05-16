import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCancelToken } from "@/lib/cancel-token";
import { cancelBooking, getBooking, isConfigured } from "@/lib/google-calendar";
import {
  sendCancellationAdminNotification,
  sendCancellationConfirmation,
} from "@/lib/email";

/**
 * POST /api/cancel
 *
 * Called by the customer from /aflys?token=... when they confirm
 * the cancellation. Token is HMAC-signed and contains the eventId.
 *
 * On a successful cancel we fire two emails in parallel:
 *   - Customer confirmation ("Din besigtigelse er aflyst")
 *   - Admin notification to LEAD_NOTIFY_EMAIL ("🟠 [AFLYST] ...")
 *     so Adam knows a slot just freed up and can follow up if
 *     desired. Includes the optional "hvorfor"-reason if the
 *     customer typed one on /aflys.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  token: z.string().min(10),
  // Optional reason — UI caps at 500 chars; we re-enforce here in case
  // someone hits the API directly. Empty string is fine.
  reason: z.string().max(500).optional().default(""),
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
    // Lookup event for customer details before deleting. We pull email,
    // phone, name and start time so the admin notification can include
    // everything Adam needs to follow up — phone in particular is the
    // primary follow-up channel. getBooking may throw if the event was
    // already deleted; we tolerate that and continue with whatever
    // data we managed to extract.
    let customerEmail = "";
    let customerPhone = "";
    let customerName = "";
    let startISO = new Date().toISOString();
    try {
      const event = await getBooking(payload.eventId);
      customerEmail = event.extendedProperties?.private?.customerEmail ?? "";
      customerPhone = event.extendedProperties?.private?.customerPhone ?? "";
      customerName = (event.summary ?? "").replace(/^Besigtigelse — /, "") || "Ukendt kunde";
      startISO = event.start?.dateTime ?? startISO;
    } catch {
      // Event not found — possibly already cancelled. Continue anyway.
    }

    await cancelBooking(payload.eventId);

    // Fire both emails in parallel — neither blocks the response on
    // failure (Promise.allSettled catches everything). The cancel
    // itself has already succeeded at this point; emails are
    // notifications only.
    const reason = parsed.data.reason.trim();
    const [customerMail, adminMail] = await Promise.allSettled([
      customerEmail
        ? sendCancellationConfirmation({ to: customerEmail, customerName, startISO })
        : Promise.resolve({ ok: true, stub: true }),
      sendCancellationAdminNotification({
        customerName,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        startISO,
        reason: reason || undefined,
        eventId: payload.eventId,
      }),
    ]);

    if (customerMail.status === "rejected") {
      console.error("[cancel] customer mail failed:", customerMail.reason);
    }
    if (adminMail.status === "rejected") {
      console.error("[cancel] admin notification failed:", adminMail.reason);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cancel] error", err);
    return NextResponse.json({ error: "cancel-failed" }, { status: 500 });
  }
}
