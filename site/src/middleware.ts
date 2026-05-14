import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware — rate limiting + bot defense for public API endpoints.
 *
 * Strategy
 * --------
 * The site has two classes of API surface:
 *
 *   1. PUBLIC (form-facing): /api/contact, /api/sofia (the callback form),
 *      /api/cancel — anyone on the internet can hit these. Protected by
 *      Turnstile + Zod validation, but we still want a rate-limit so a
 *      bot that solves Turnstile once can't hammer us.
 *
 *   2. AUTHENTICATED (Sofia-internal): /api/sofia/availability,
 *      /api/sofia/book, /api/sofia/business-hours — called server-to-server
 *      by Retell with X-Sofia-Secret. We DO NOT rate-limit those at IP
 *      level: legitimate traffic during a call burst can exceed any
 *      reasonable per-IP threshold, and the secret already gates them.
 *
 *   3. RETELL WEBHOOK: /api/retell/webhook — verified via SDK signature.
 *      Also skipped (signature is the gate).
 *
 * Bucket implementation
 * ---------------------
 * In-memory Map keyed by IP. Each Vercel function instance has its own
 * bucket, so the effective limit is `MAX_REQ_PER_WINDOW × num_instances`.
 * For a low-traffic Danish painting company this is more than enough.
 * If we later need cluster-wide accuracy, swap for @upstash/ratelimit
 * backed by Vercel KV — the call shape here stays the same.
 *
 * IP source
 * ---------
 * Vercel injects the real client IP into x-forwarded-for. We also accept
 * cf-connecting-ip when the request transits Cloudflare. Falling back to
 * "anon" buckets all unknown clients together, which is intentionally
 * pessimistic for spoofed traffic.
 */

const WINDOW_MS = 60_000; // 1 minute sliding-ish window (fixed-window approximation)
const MAX_REQ_PER_WINDOW = 12; // 12 requests / minute / IP on form endpoints

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic GC so the map doesn't grow unbounded across long-lived instances.
// We prune lazily on each call instead of using setInterval (which doesn't
// work in Edge runtime).
let lastGc = 0;
function gc(now: number) {
  if (now - lastGc < 60_000) return;
  lastGc = now;
  // forEach instead of for...of so we don't depend on downlevelIteration
  // (tsconfig target is ES2017).
  const toDelete: string[] = [];
  buckets.forEach((b, key) => {
    if (b.resetAt < now) toDelete.push(key);
  });
  toDelete.forEach((k) => buckets.delete(k));
}

function rateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  gc(now);
  let bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQ_PER_WINDOW) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}

function getClientIp(request: NextRequest): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "anon";
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip authenticated Sofia-internal endpoints — the X-Sofia-Secret header
  // is the gate, and Retell's legitimate per-call traffic can spike higher
  // than the public form limit.
  if (
    path.startsWith("/api/sofia/availability") ||
    path.startsWith("/api/sofia/book") ||
    path.startsWith("/api/sofia/business-hours")
  ) {
    return NextResponse.next();
  }

  // Skip the Retell webhook — verified via SDK signature.
  if (path.startsWith("/api/retell/")) {
    return NextResponse.next();
  }

  // Only rate-limit POST/PUT/PATCH/DELETE — GET/HEAD on these routes is
  // harmless and skipping reduces false positives for prefetchers.
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    return NextResponse.next();
  }

  const ip = getClientIp(request);
  const { ok, retryAfterSec } = rateLimit(ip);
  if (!ok) {
    console.warn("[ratelimit] blocked", { ip, path, method: request.method });
    return new NextResponse(
      JSON.stringify({
        ok: false,
        error: "rate-limited",
        message: "For mange forsøg på kort tid. Prøv igen om lidt.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(MAX_REQ_PER_WINDOW),
          "X-RateLimit-Window-Sec": String(WINDOW_MS / 1000),
        },
      },
    );
  }

  return NextResponse.next();
}

// Matcher: only run middleware on the routes we care about. Skipping the
// rest avoids per-request overhead on static pages, images, etc.
export const config = {
  matcher: [
    "/api/contact/:path*",
    "/api/sofia/:path*",
    "/api/cancel/:path*",
    "/api/retell/:path*",
  ],
};
