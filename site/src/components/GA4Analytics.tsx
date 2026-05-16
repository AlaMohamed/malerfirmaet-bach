"use client";

/**
 * Google Analytics 4 — consent-gated loader.
 *
 * Architecture
 * ------------
 * GA4 sets cookies and ships data to Google in the US, so under GDPR we
 * cannot load it before the visitor opts in. CookieBanner.tsx already
 * handles the UI; this component subscribes to its decisions:
 *
 *   - On mount, read localStorage `bach-cookie-consent` to honour a
 *     returning visitor's earlier choice (so reload/SPA-navigation
 *     doesn't show the banner again).
 *   - Listen for the `bach-consent-granted` window event dispatched
 *     when the user clicks "Accepter alle" — flip enabled → true.
 *   - Only then render the gtag scripts, which causes Next/Script to
 *     inject them once.
 *
 * Page views
 * ----------
 * Next.js App Router doesn't fire GA4's automatic page_view on client-
 * side route changes (gtag only sees the initial page load). We watch
 * pathname + searchParams and emit a `config` call per change.
 *
 * Privacy
 * -------
 * `anonymize_ip: true` truncates the last IP octet inside Google's
 * infrastructure before logging — Datatilsynet-friendly. Marketing-ad
 * personalization is left disabled (the default for a config call
 * without `ads_data_redaction` toggles), so this is "analytics only".
 */

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CONSENT_KEY = "bach-cookie-consent";
const CONSENT_EVENT = "bach-consent-granted";

function GA4Inner() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Wire up consent listener once on mount. Reading localStorage here is
  // safe because the parent only renders this on the client side.
  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(CONSENT_KEY) === "all") {
      setEnabled(true);
    }
    const handler = () => setEnabled(true);
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  // Emit a page_view-equivalent on every App Router navigation. We use
  // `config` rather than a manual `event` so GA4 still ties it to the
  // correct stream and applies its own session/engagement logic.
  useEffect(() => {
    if (!enabled || !MEASUREMENT_ID) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const qs = searchParams?.toString();
    const url = pathname + (qs ? `?${qs}` : "");
    window.gtag("config", MEASUREMENT_ID, { page_path: url });
  }, [pathname, searchParams, enabled]);

  if (!enabled || !MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', { anonymize_ip: true, send_page_view: true });
        `}
      </Script>
    </>
  );
}

// useSearchParams() requires a Suspense boundary in App Router during
// static generation — wrap the inner component so the build doesn't
// opt out of static rendering for every page that uses analytics.
export function GA4Analytics() {
  return (
    <Suspense fallback={null}>
      <GA4Inner />
    </Suspense>
  );
}
