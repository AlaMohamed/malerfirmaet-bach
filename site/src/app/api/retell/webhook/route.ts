import { NextResponse } from "next/server";
import Retell from "retell-sdk";
import { sendAdminLeadNotification } from "@/lib/email";

/**
 * POST /api/retell/webhook
 *
 * Receives call-summary webhooks from Retell after Sofia ends a call.
 *
 * Events of interest:
 *  - call_started:   ignored
 *  - call_ended:     ignored (analysis-fields are empty here — wait for call_analyzed)
 *  - call_analyzed:  send Adam a summary email with transcript + outcome
 *
 * Security: Retell signs webhooks with HMAC-SHA256 using your account's API key.
 * We use the official Retell SDK's `Retell.verify()` to validate the signature,
 * which matches Retell's exact signing format.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RetellCallObject {
  call_id?: string;
  from_number?: string;
  to_number?: string;
  duration_ms?: number;
  transcript?: string;
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: string;
    call_successful?: boolean;
  };
  retell_llm_dynamic_variables?: Record<string, string>;
  metadata?: Record<string, string>;
}

interface RetellWebhookBody {
  event: "call_started" | "call_ended" | "call_analyzed";
  call?: RetellCallObject;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get("x-retell-signature");

  // Validate signature using Retell's SDK
  const apiKey = process.env.RETELL_API_KEY;
  if (apiKey) {
    const valid = sig ? Retell.verify(rawBody, apiKey, sig) : false;
    if (!valid) {
      console.warn("[retell-webhook] invalid signature", { sigPresent: !!sig });
      return NextResponse.json({ error: "invalid-signature" }, { status: 401 });
    }
  } else {
    console.warn("[retell-webhook] RETELL_API_KEY not set — accepting unsigned payload (dev)");
  }

  let body: RetellWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  console.log(`[retell-webhook] event=${body.event} call_id=${body.call?.call_id}`);

  // Only react to ended/analyzed events
  if (body.event !== "call_ended" && body.event !== "call_analyzed") {
    return NextResponse.json({ ok: true });
  }

  const call = body.call ?? {};
  const customerName = call.retell_llm_dynamic_variables?.customer_name ?? "Ukendt kunde";
  const customerPhone = call.to_number ?? "—";
  const customerEmail = call.retell_llm_dynamic_variables?.customer_email ?? "—";
  const durationSec = Math.round((call.duration_ms ?? 0) / 1000);
  const summary = call.call_analysis?.call_summary ?? "(intet resume)";
  const sentimentRaw = call.call_analysis?.user_sentiment ?? "";
  const successful = call.call_analysis?.call_successful;

  // Format duration as "mm:ss" so Adam can scan it as "how long the call took"
  // rather than mentally converting 223 seconds → 3:43. Padded seconds keep
  // the alignment consistent in monospaced inboxes.
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const durationFormatted = `${minutes}:${String(seconds).padStart(2, "0")}`;

  // Translate Retell's English sentiment labels into Danish so the whole
  // email reads in one language. Unknown / missing values fall through to
  // "—" so Adam isn't left wondering whether the call was good or bad.
  const SENTIMENT_DA: Record<string, string> = {
    Positive: "Positiv",
    Neutral: "Neutral",
    Negative: "Negativ",
    Unknown: "Ukendt",
  };
  const sentiment = SENTIMENT_DA[sentimentRaw] ?? sentimentRaw ?? "—";

  // Outcome heuristic
  let outcome = "Ukendt resultat";
  if (successful === true) outcome = "✅ Sofia bookede en tid";
  else if (successful === false) outcome = "⚠️ Sofia bookede IKKE — manuel opfølgning anbefalet";

  const context = [
    `Resultat: ${outcome}`,
    `Varighed: ${durationFormatted}`,
    `Sentiment: ${sentiment}`,
    ``,
    `Sofias resume:`,
    summary,
    call.transcript ? `\nTranscript:\n${call.transcript.slice(0, 4000)}` : "",
  ].join("\n");

  // Only email Adam on call_analyzed (call_ended fires earlier without analysis)
  if (body.event === "call_analyzed") {
    await sendAdminLeadNotification({
      customerName,
      customerPhone,
      customerEmail,
      source: "sofia-callback",
      context,
    });
  }

  return NextResponse.json({ ok: true });
}
