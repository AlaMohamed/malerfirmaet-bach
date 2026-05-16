/**
 * Retell AI client — outbound calls + call-history lookup.
 *
 * Two responsibilities:
 *   1. createOutboundCall — used by /api/sofia "Ring mig op" form
 *   2. findCallsForPhone — used by /api/contact to surface whether Sofia
 *      has previously talked to a contact-form lead so Adam knows whether
 *      manual follow-up is needed
 *
 * If RETELL_API_KEY / RETELL_FROM_NUMBER / RETELL_AGENT_ID are not all set,
 * helpers return stubs so forms still work gracefully.
 */

const RETELL_API = "https://api.retellai.com/v2";

/**
 * Normalize a Danish phone number to E.164 ("+45XXXXXXXX") so we can match
 * against Retell's to_number field. Accepts user input like "41 44 07 11",
 * "+4541440711", "0045 41 44 07 11", "41440711". Returns the input
 * unchanged (after digit-stripping) if we can't confidently determine the
 * country code — false negatives on the history check are better than
 * false positives.
 */
export function normalizeDanishPhone(input: string): string {
  const trimmed = input.trim();
  // Keep leading + if present, otherwise drop everything non-digit
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (hasPlus) return `+${digits}`;
  if (digits.startsWith("0045") && digits.length === 12) return `+${digits.slice(2)}`;
  if (digits.startsWith("45") && digits.length === 10) return `+${digits}`;
  if (digits.length === 8) return `+45${digits}`;
  return digits ? `+${digits}` : "";
}

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
  /** Optional address from the contact form. When populated, Sofia
   *  confirms the address rather than asking — see Sofia v2 TRIN 3. */
  customerAddress?: string;
  customerPostal?: string;
  customerCity?: string;
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
          // Empty strings (rather than undefined) so Sofia's prompt
          // can pattern-match "{{customer_address}}" literal vs real
          // value — same convention as the other variables. Sofia's
          // TRIN 3 logic decides whether to confirm or ask.
          customer_address: opts.customerAddress ?? "",
          customer_postal: opts.customerPostal ?? "",
          customer_city: opts.customerCity ?? "",
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

// ─────────────────────────────────────────────────────────────────────────────
// Call-history lookup (admin-email enrichment)
// ─────────────────────────────────────────────────────────────────────────────

export interface RelatedCallSummary {
  /** Retell call_id — useful if Adam wants to dig into the transcript. */
  callId: string;
  /** "ended" | "ongoing" | "error" — Retell's call_status field. */
  status: string;
  /** Start time as ISO 8601 (UTC) so the email template can format it. */
  startedAtIso: string;
  /** Duration in milliseconds — null if the call never connected. */
  durationMs: number | null;
}

/**
 * Look up whether Sofia has ever called a given phone number. Used in the
 * contact-form admin notification to tell Adam at a glance whether this is
 * a brand-new lead (Sofia hasn't talked to them) or a previously-contacted
 * customer (Sofia called them N times before).
 *
 * Always returns an empty array on:
 *   - missing RETELL_API_KEY (stub mode)
 *   - empty/malformed phone input
 *   - HTTP failure (network error, 4xx/5xx) — we never want a Retell
 *     outage to break the contact-form flow
 *
 * Latency: ~300-700 ms in normal conditions. We wrap the call with a 4s
 * AbortSignal so a stuck Retell API can't tank form submissions.
 */
export async function findCallsForPhone(phone: string, limit = 10): Promise<RelatedCallSummary[]> {
  if (!process.env.RETELL_API_KEY) return [];
  const normalized = normalizeDanishPhone(phone);
  if (!normalized || normalized.length < 4) return [];

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 4000);

  try {
    const res = await fetch(`${RETELL_API}/list-calls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        limit,
        sort_order: "descending",
        filter_criteria: {
          // Sofia calls outbound, so the customer is on to_number. Including
          // from_number too catches the rare case where the customer calls
          // *in* via a future inbound flow.
          to_number: [normalized],
          from_number: [normalized],
        },
      }),
    });

    if (!res.ok) {
      console.warn("[retell] list-calls non-ok", res.status, await res.text().catch(() => ""));
      return [];
    }

    const json = (await res.json()) as Array<{
      call_id?: string;
      call_status?: string;
      start_timestamp?: number;
      duration_ms?: number;
      to_number?: string;
      from_number?: string;
    }>;

    return json
      .filter((c) => {
        // Retell's filter_criteria is OR-style across array elements but AND
        // across keys — we asked for matches on either side, so double-check
        // that at least one side actually matches our normalized number.
        return c.to_number === normalized || c.from_number === normalized;
      })
      .map((c) => ({
        callId: c.call_id ?? "",
        status: c.call_status ?? "unknown",
        startedAtIso: c.start_timestamp ? new Date(c.start_timestamp).toISOString() : new Date().toISOString(),
        durationMs: typeof c.duration_ms === "number" ? c.duration_ms : null,
      }));
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.warn("[retell] list-calls timeout (>4s)");
    } else {
      console.error("[retell] list-calls exception", err);
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
