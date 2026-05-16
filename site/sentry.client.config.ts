/**
 * Sentry client-side initialization.
 *
 * Runs in the browser. Captures unhandled errors, unhandled promise
 * rejections, and a sampled fraction of performance transactions.
 *
 * Privacy
 * -------
 * No Session Replay enabled (intentional). Replay records DOM
 * interactions which would expose form fields (name, phone, email,
 * "besked") even with masking — a legal risk under GDPR for the
 * benefit it offers a low-traffic site. Re-enable later via
 * Sentry.replayIntegration() if a specific debugging need arises.
 *
 * Sample rates
 * ------------
 * - `tracesSampleRate: 1.0` — record every transaction. Acceptable
 *   at our traffic level (well under Sentry's free 10k/month perf
 *   quota). Lower this if traffic grows.
 * - Error capture is always 100 % — no `sampleRate` set.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring — 100 % sampling at our traffic level
  tracesSampleRate: 1.0,

  // Send unhandled errors with full stack traces
  debug: false,

  // Don't send PII even when SDK auto-detects it (form values, IPs).
  // We anonymize at the data layer instead.
  sendDefaultPii: false,

  // Strip the Vercel preview-deployment URL from events so issue
  // grouping doesn't fragment across preview hashes.
  beforeSend(event) {
    if (event.request?.url) {
      event.request.url = event.request.url.replace(
        /https?:\/\/malerfirmaet-bach-[a-z0-9]+-alahhx[^/]*\.vercel\.app/,
        "https://malerfirmaet-bach.vercel.app",
      );
    }
    return event;
  },
});
