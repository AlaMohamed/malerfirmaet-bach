/**
 * Server-side Cloudflare Turnstile verification.
 *
 * In production this is mandatory. In dev (when TURNSTILE_SECRET_KEY is unset)
 * verification is skipped so local testing works.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, ip?: string): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Dev convenience: no secret → skip verification (UI shows a placeholder)
  if (!secret) return { ok: true, reason: "turnstile-not-configured" };

  if (!token) return { ok: false, reason: "missing-token" };

  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);

    const r = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const data = (await r.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) return { ok: false, reason: (data["error-codes"] ?? ["invalid"]).join(",") };
    return { ok: true };
  } catch (err) {
    console.error("[turnstile] verify failed", err);
    return { ok: false, reason: "network-error" };
  }
}
