/**
 * HMAC-signed cancellation tokens.
 *
 * Each booking gets a token embedded in the cancellation link in the
 * confirmation e-mail. The token holds the eventId + an expiry. We verify
 * with HMAC so links can't be forged.
 */
import crypto from "node:crypto";

interface TokenPayload {
  eventId: string;
  exp: number; // unix seconds
}

function secret() {
  const s = process.env.CANCEL_TOKEN_SECRET;
  if (!s) throw new Error("CANCEL_TOKEN_SECRET is not configured");
  return s;
}

export function signCancelToken(eventId: string, ttlDays = 365): string {
  const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60;
  const payload: TokenPayload = { eventId, exp };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyCancelToken(token: string): { eventId: string } | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(data).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as TokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { eventId: payload.eventId };
  } catch {
    return null;
  }
}
