/**
 * Structured submission logging.
 *
 * Goal
 * ----
 * Adam needs a paper trail for every form submission on the site
 * (kontakt-form + Sofia-callback) so he can:
 *   1. Confirm a customer's form actually landed when they call back
 *      and say "I didn't get a reply"
 *   2. Investigate failures after the fact (Drive down, Resend bounced,
 *      Retell unreachable) without needing live access to server logs
 *   3. Tie every external-system action (Drive upload, email send,
 *      Retell call trigger) back to a single submission via shared ID
 *
 * Two-channel strategy
 * --------------------
 *   1. Structured console.log — captured by Vercel's runtime logs
 *      (visible in the Vercel dashboard; retained for ~1 hour on
 *      Hobby, 30 days on Pro). Easy to grep by submissionId.
 *
 *   2. Admin email — every submission already triggers an admin mail
 *      via Resend. The submissionId now appears in the email subject
 *      and body, so Resend's "Logs" tab becomes a permanent record.
 *
 * Adding a third channel (Drive JSON or external observability) is
 * straightforward — just call logEvent() from a new sink.
 */

import { randomUUID } from "node:crypto";

export type SubmissionSource = "kontakt" | "sofia-callback";

export interface SubmissionContext {
  /** Stable per-submission UUID. Pass through every downstream call. */
  id: string;
  /** Which form. */
  source: SubmissionSource;
  /** ISO start time. */
  startedAt: string;
  /** Client IP if available (for abuse / debugging). */
  ip?: string;
  /** Browser user-agent if available. */
  userAgent?: string;
}

export function newSubmissionContext(source: SubmissionSource, request?: Request): SubmissionContext {
  // Prefer the platform's request id when present (Vercel injects
  // x-vercel-id) so server-side logs can be correlated with their CDN
  // hit. Otherwise fall back to a freshly-generated UUID — same shape
  // either way for the receiver.
  const platformId = request?.headers.get("x-vercel-id") ?? null;
  const id = platformId ? `sub_${platformId.replace(/[^a-zA-Z0-9_-]/g, "")}` : `sub_${randomUUID()}`;
  return {
    id,
    source,
    startedAt: new Date().toISOString(),
    ip:
      request?.headers.get("cf-connecting-ip") ??
      request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      undefined,
    userAgent: request?.headers.get("user-agent") ?? undefined,
  };
}

export type EventLevel = "info" | "warn" | "error";

export interface SubmissionEvent {
  /** Domain of the action — drive, email-customer, email-admin, retell,
   *  turnstile, validation, lifecycle. */
  area: string;
  /** Short status code: ok | failed | skipped | stub | invalid. */
  status: "ok" | "failed" | "skipped" | "stub" | "invalid";
  /** Free-form note. Avoid PII — phone/email get partially redacted by
   *  the caller before being passed in. */
  note?: string;
  /** Optional structured metadata (numbers, booleans). */
  meta?: Record<string, unknown>;
}

/**
 * Emit one structured event tied to a submission. Format is JSON on a
 * single line so Vercel's log viewer + downstream log-shippers can
 * parse it without any custom adapter.
 */
export function logEvent(ctx: SubmissionContext, event: SubmissionEvent, level: EventLevel = "info") {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    submissionId: ctx.id,
    source: ctx.source,
    level,
    ...event,
  });
  // Always include the [submission] tag so grep filters are easy.
  const tag = "[submission]";
  if (level === "error") console.error(tag, line);
  else if (level === "warn") console.warn(tag, line);
  else console.log(tag, line);
}

/** Format a duration for human reading in event metadata. */
export function ms(start: number): number {
  return Math.round(performance.now() - start);
}
