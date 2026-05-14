"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface Props {
  onSuccess: (token: string) => void;
  onError?: () => void;
}

/**
 * Cloudflare Turnstile wrapper.
 *
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured we show an inline
 * placeholder explaining the missing setup, AND emit a placeholder token
 * so dev/test environments can still submit. The server validates the
 * token strictly — placeholder tokens are rejected when a real key is set.
 */
export function TurnstileBox({ onSuccess, onError }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return (
      <div className="rounded-lg border border-warm-light bg-cream-200 p-4">
        <div className="flex items-start gap-3 text-charcoal/70">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold text-charcoal">Captcha endnu ikke aktiveret.</span>{" "}
            Cloudflare Turnstile aktiveres ved at sætte{" "}
            <code className="px-1.5 py-0.5 bg-white rounded text-[10px]">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code>
            {" "}og <code className="px-1.5 py-0.5 bg-white rounded text-[10px]">TURNSTILE_SECRET_KEY</code> i .env.local
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={() => onError?.()}
        options={{
          theme: "light",
          size: "flexible",
          language: "da",
          appearance: "always",
        }}
      />
      <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-charcoal/40">
        <ShieldCheck className="h-3 w-3" aria-hidden />
        Beskyttet af Cloudflare Turnstile
      </p>
    </div>
  );
}
