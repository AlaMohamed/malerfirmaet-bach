"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const KEY = "bach-cookie-consent";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(KEY);
    if (!stored) setShow(true);
  }, []);

  const consent = (val: "all" | "necessary") => {
    window.localStorage.setItem(KEY, val);
    setShow(false);
    if (val === "all") {
      // Hook for GA4 init once measurement ID is configured.
      window.dispatchEvent(new Event("bach-consent-granted"));
    }
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Cookie-samtykke"
      className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal-dark/97 backdrop-blur border-t border-white/8 text-white shadow-2xl animate-fade-up"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-12 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex-1">
            <p className="font-medium text-sm mb-1">Vi respekterer dit privatliv</p>
            <p className="text-white/55 text-xs leading-relaxed">
              Vi bruger kun nødvendige cookies — og statistik-cookies kun hvis du accepterer.{" "}
              <Link href="/cookiepolitik" className="underline hover:text-white transition-colors">
                Læs cookiepolitik
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => consent("all")}
              className="bg-brand-400 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-brand-500 transition-colors"
            >
              Accepter alle
            </button>
            <button
              onClick={() => consent("necessary")}
              className="border border-white/25 text-white/80 text-sm font-medium px-4 py-2.5 rounded-md hover:bg-white/10 transition-colors"
            >
              Kun nødvendige
            </button>
            <button
              onClick={() => consent("necessary")}
              aria-label="Luk"
              className="text-white/40 hover:text-white sm:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
