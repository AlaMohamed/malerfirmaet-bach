"use client";

/**
 * TestimonialGrid — filterable grid for /referencer.
 *
 * Server component renders the page chrome and feeds in the
 * non-featured testimonials; this client component manages the
 * "Alle / Erhverv / Institutioner / Privat" filter state locally.
 * Keeping the filter UI client-side means the page itself stays
 * statically rendered (better TTFB + cache) and only this leaf needs
 * the React runtime.
 */

import { useState } from "react";
import { cn } from "@/lib/cn";
import { TestimonialCard } from "./TestimonialCard";
import {
  type Testimonial,
  type TestimonialCategory,
  testimonialCategoryLabels,
} from "@/content/testimonials";

type Filter = TestimonialCategory | "alle";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "erhverv", label: testimonialCategoryLabels.erhverv },
  { value: "institutioner", label: testimonialCategoryLabels.institutioner },
  { value: "privat", label: testimonialCategoryLabels.privat },
];

export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  const [filter, setFilter] = useState<Filter>("alle");

  const filtered =
    filter === "alle" ? testimonials : testimonials.filter((t) => t.category === filter);

  // Count per category to display in disabled state when 0
  const counts = FILTERS.reduce<Record<Filter, number>>(
    (acc, f) => {
      acc[f.value] =
        f.value === "alle"
          ? testimonials.length
          : testimonials.filter((t) => t.category === f.value).length;
      return acc;
    },
    { alle: 0, erhverv: 0, institutioner: 0, privat: 0 },
  );

  return (
    <>
      <div
        role="tablist"
        aria-label="Filtrér referencer"
        className="flex flex-wrap gap-2 justify-center mb-12"
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count = counts[f.value];
          return (
            <button
              key={f.value}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.value)}
              disabled={count === 0}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border inline-flex items-center gap-2",
                active
                  ? "bg-charcoal-dark text-white border-charcoal-dark"
                  : "bg-cream-50 text-charcoal/70 border-warm-light hover:border-brand-300",
                count === 0 && "opacity-40 cursor-not-allowed",
              )}
            >
              <span>{f.label}</span>
              <span
                className={cn(
                  "text-[10px] tabular-nums px-1.5 py-0.5 rounded",
                  active ? "bg-white/15" : "bg-warm-light/50",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-charcoal/55 py-12">
          Ingen referencer i denne kategori endnu.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filtered.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      )}
    </>
  );
}
