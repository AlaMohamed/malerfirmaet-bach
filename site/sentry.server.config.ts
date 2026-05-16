/**
 * Sentry server-side initialization.
 *
 * Loaded by instrumentation.ts at server startup. Captures unhandled
 * exceptions and rejected promises from all Server Components, Route
 * Handlers, and Server Actions, plus a sampled fraction of API
 * transaction traces.
 *
 * Privacy / data minimization
 * ---------------------------
 * `sendDefaultPii: false` plus a `beforeSend` redactor strips the
 * customer phone/email/address from any captured request payloads —
 * so even if a /api/contact handler crashes mid-validation, the
 * customer's personal data doesn't end up in Sentry. This matches
 * our existing submission-log redaction policy.
 */

import * as Sentry from "@sentry/nextjs";

const PII_FIELDS = ["telefon", "email", "navn", "adresse", "besked", "customer_phone", "customer_email", "customer_name"];

function redactPii(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redactPii);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (PII_FIELDS.includes(k.toLowerCase())) {
      out[k] = "[redacted]";
    } else {
      out[k] = redactPii(v);
    }
  }
  return out;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  tracesSampleRate: 1.0,
  debug: false,
  sendDefaultPii: false,

  beforeSend(event) {
    // Strip request body PII before transmission to Sentry.
    if (event.request?.data) {
      event.request.data = redactPii(event.request.data) as typeof event.request.data;
    }
    // Strip extra context.
    if (event.extra) {
      event.extra = redactPii(event.extra) as typeof event.extra;
    }
    return event;
  },
});
