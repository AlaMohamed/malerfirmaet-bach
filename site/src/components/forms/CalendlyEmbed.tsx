"use client";

import { useEffect, useState } from "react";
import { Calendar, ShieldCheck } from "lucide-react";
import { TurnstileBox } from "./TurnstileBox";
import { booking } from "@/content/site";

interface Props {
  url?: string;
}

/**
 * Calendly embed gated behind Cloudflare Turnstile.
 *
 * Why gate it? Calendly itself has anti-spam, but it's a public URL — bots can
 * spam bookings if our embed is open. Requiring Turnstile before we render the
 * iframe blocks automated traffic going through our site.
 *
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured we skip the gate so dev
 * can still use the booking flow.
 */
export function CalendlyEmbed({ url }: Props) {
  const calendlyUrl = url ?? process.env.NEXT_PUBLIC_CALENDLY_URL ?? booking.calendlyUrl;
  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const [verified, setVerified] = useState(!turnstileRequired);

  useEffect(() => {
    if (!verified || !calendlyUrl) return;
    const id = "calendly-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(link);
  }, [verified, calendlyUrl]);

  if (!calendlyUrl) {
    return (
      <div className="rounded-lg border-2 border-dashed border-warm-light bg-cream-200 p-8 text-center">
        <Calendar className="h-10 w-10 text-brand-400 mx-auto mb-4" aria-hidden />
        <p className="font-serif text-lg text-charcoal-dark mb-2">Kalender-integration mangler URL</p>
        <p className="text-charcoal/65 text-sm leading-relaxed max-w-md mx-auto">
          Sæt <code className="mx-1 px-1.5 py-0.5 bg-charcoal/10 rounded text-charcoal-dark text-xs">NEXT_PUBLIC_CALENDLY_URL</code>.
        </p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="rounded-xl border border-warm-light bg-cream-200 p-6 text-center">
        <div className="mx-auto h-11 w-11 rounded-full bg-brand-50 grid place-items-center mb-4">
          <ShieldCheck className="h-5 w-5 text-brand-500" aria-hidden />
        </div>
        <p className="font-serif text-lg text-charcoal-dark mb-1">Bekræft først at du er menneske</p>
        <p className="text-charcoal/65 text-sm mb-5 leading-relaxed max-w-sm mx-auto">
          Vi beder om en hurtig verifikation før kalenderen åbnes, så bots ikke optager Adams tid.
        </p>
        <div className="max-w-xs mx-auto">
          <TurnstileBox onSuccess={() => setVerified(true)} onError={() => setVerified(false)} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="calendly-inline-widget rounded-lg overflow-hidden border border-warm-light"
      data-url={calendlyUrl}
      style={{ minWidth: "320px", height: "720px" }}
    />
  );
}
