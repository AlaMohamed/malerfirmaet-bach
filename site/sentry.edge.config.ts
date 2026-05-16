/**
 * Sentry edge-runtime initialization.
 *
 * Loaded by instrumentation.ts when middleware.ts or edge route
 * handlers execute. Edge runtime has a restricted Node API surface,
 * so we keep this config minimal.
 *
 * Our middleware handles rate-limiting on form endpoints — any
 * uncaught error there would otherwise be silent (the request still
 * returns 500 to the client but the server log is ephemeral). Sentry
 * gives us the stack trace.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Edge runs on every request to /api/contact, /api/sofia, etc. via
  // our middleware — 100 % traces would be noisy but not expensive.
  // Cut it to 25 % since middleware traces are mostly identical
  // pass-throughs and we already have server-side traces for the
  // actual handlers.
  tracesSampleRate: 0.25,
  debug: false,
  sendDefaultPii: false,
});
