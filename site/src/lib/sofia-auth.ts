/**
 * Verifies Retell-bound endpoints by a shared secret in HTTP header.
 *
 * Retell sends:   X-Sofia-Secret: <SOFIA_API_SECRET>
 * We compare against env.
 */

export function authorizeSofia(request: Request): { ok: true } | { ok: false; status: number; error: string } {
  const expected = process.env.SOFIA_API_SECRET;
  if (!expected) {
    // Local dev convenience: if no secret set, allow (logged warning)
    console.warn("[sofia-auth] SOFIA_API_SECRET not set — allowing all requests (dev mode)");
    return { ok: true };
  }
  const provided = request.headers.get("x-sofia-secret") ?? "";
  if (provided !== expected) {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  return { ok: true };
}
