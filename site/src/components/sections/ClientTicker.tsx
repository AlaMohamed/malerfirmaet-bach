"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container } from "../ui/Container";
import { trustedBy } from "@/content/site";

/**
 * Trusted-by ticker — professional client logo carousel with pause-on-hover.
 *
 * Design choices:
 *  - Mixed logos + elegant typography (graceful when logo unavailable)
 *  - Greyscale logos that colorize on hover
 *  - Each item lifts slightly on hover, shows a subtle category tag
 *  - Smooth global pause when cursor enters the marquee
 *  - Long fade-out masks at both edges (no jarring cuts)
 *  - Animation is duration-aware: scales with number of items so feel
 *    stays the same as catalogue grows
 */

const PIXELS_PER_SECOND = 80; // marquee scroll speed — consistent feel

export function ClientTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(40);

  // Recalculate animation duration based on the actual rendered track width,
  // so adding/removing clients keeps the perceived speed constant.
  useEffect(() => {
    function updateDuration() {
      const track = trackRef.current;
      if (!track) return;
      const single = track.scrollWidth / 2;
      setDuration(Math.max(20, Math.round(single / PIXELS_PER_SECOND)));
    }
    updateDuration();
    window.addEventListener("resize", updateDuration);
    return () => window.removeEventListener("resize", updateDuration);
  }, []);

  // Render the items twice so the loop is seamless.
  const doubled = [...trustedBy, ...trustedBy];

  return (
    <section
      className="relative bg-cream-50 border-y border-warm-light/60 py-14 overflow-hidden"
      aria-label="Udvalgte kunder"
    >
      <Container>
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="h-px w-14 bg-brand-300/55" aria-hidden />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-500">
            Udvalgte kunder
          </p>
          <span className="h-px w-14 bg-brand-300/55" aria-hidden />
        </div>
      </Container>

      <div
        className="relative group"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max items-center will-change-transform [animation:ticker_var(--duration)_linear_infinite] group-hover:[animation-play-state:paused]"
          style={{ ["--duration" as string]: `${duration}s` }}
        >
          {doubled.map((c, i) => (
            <TickerItem
              key={`${c.name}-${i}`}
              name={c.name}
              category={c.category}
              logo={c.logo}
              ariaHidden={i >= trustedBy.length}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}

function TickerItem({
  name,
  category,
  logo,
  ariaHidden,
}: {
  name: string;
  category: string;
  logo?: string;
  ariaHidden: boolean;
}) {
  return (
    <div
      className="group/item relative flex shrink-0 items-center justify-center px-8 lg:px-12 transition-all duration-300"
      role={ariaHidden ? "presentation" : "listitem"}
      aria-hidden={ariaHidden}
      title={`${name} · ${category}`}
    >
      <div className="flex items-center gap-3 transition-transform duration-300 group-hover/item:-translate-y-0.5">
        {logo ? (
          <div className="relative h-9 w-32 grayscale opacity-65 transition-all duration-300 group-hover/item:grayscale-0 group-hover/item:opacity-100">
            <Image
              src={logo}
              alt={`${name} logo`}
              fill
              sizes="160px"
              className="object-contain object-center"
            />
          </div>
        ) : (
          <span className="font-serif italic text-xl text-charcoal/55 transition-colors duration-300 group-hover/item:text-charcoal-dark whitespace-nowrap">
            {name}
          </span>
        )}
      </div>

      {/* Category tag — fades in on hover */}
      <span
        className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[10px] uppercase tracking-widest text-brand-500 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none"
        aria-hidden
      >
        {category}
      </span>
    </div>
  );
}
