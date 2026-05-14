/**
 * Retell AI client — triggers Sofia outbound calls.
 *
 * Used by the "Ring mig op" form submission handler (/api/sofia).
 * If RETELL_API_KEY / RETELL_FROM_NUMBER / RETELL_AGENT_ID are not all set,
 * the helper returns a stub so the form still works gracefully — and the
 * webhook to Adam ensures the lead isn't lost.
 */

const RETELL_API = "https://api.retellai.com/v2";

export function isRetellConfigured(): boolean {
  return !!(
    process.env.RETELL_API_KEY &&
    process.env.RETELL_AGENT_ID &&
    process.env.RETELL_FROM_NUMBER
  );
}

interface CreateCallOpts {
  toNumber: string;
  customerName: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

interface CreateCallResult {
  ok: boolean;
  callId?: string;
  stub?: boolean;
  error?: string;
}

/**
 * Triggers an outbound phone call where Sofia speaks to the customer.
 *
 * dynamic_variables are interpolated into Sofia's prompt at conversation time:
 *   {{customer_name}}  → the customer's name
 *   {{customer_email}} → the email Sofia should send confirmation to
 *   {{customer_phone}} → echo of the to-number (for Sofia's reference)
 */
export async function createOutboundCall(opts: CreateCallOpts): Promise<CreateCallResult> {
  if (!isRetellConfigured()) {
    console.log("[retell] not configured — call would have gone to:", opts.toNumber);
    return { ok: true, stub: true };
  }

  try {
    const res = await fetch(`${RETELL_API}/create-phone-call`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_number: process.env.RETELL_FROM_NUMBER,
        to_number: opts.toNumber,
        override_agent_id: process.env.RETELL_AGENT_ID,
        retell_llm_dynamic_variables: {
          customer_name: opts.customerName,
          customer_email: opts.customerEmail,
          customer_phone: opts.toNumber,
        },
        metadata: opts.metadata ?? {},
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[retell] create-phone-call failed", res.status, text);
      return { ok: false, error: `retell-${res.status}` };
    }

    const json = (await res.json()) as { call_id?: string };
    return { ok: true, callId: json.call_id };
  } catch (err) {
    console.error("[retell] create-phone-call exception", err);
    return { ok: false, error: "network-error" };
  }
}
