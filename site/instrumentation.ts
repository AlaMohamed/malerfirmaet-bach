/**
 * Next.js instrumentation hook — runs once when each runtime
 * (Node.js / Edge) boots. We use it to wire up Sentry for the
 * matching context.
 *
 * This must live at the project root (not inside src/) so Next.js
 * detects it automatically; see
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Sentry-Next.js v8+ exposes onRequestError to forward request-scoped
 * server errors (caught by Next.js's error boundary) to Sentry with
 * the full request context attached. Without this hook, those errors
 * still get captured but missing some metadata.
 */
export { captureRequestError as onRequestError } from "@sentry/nextjs";
