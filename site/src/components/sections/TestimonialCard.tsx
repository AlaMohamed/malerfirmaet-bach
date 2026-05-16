/**
 * TestimonialCard — reusable card for /referencer + homepage section.
 *
 * Two visual variants:
 *   - "default" (grid): compact card, fits 2-up on desktop
 *   - "featured": larger card with extra padding, brand-tinted bg,
 *     used at the top of the references page and as the home page
 *     quote section.
 *
 * Card markup is intentionally a plain <article> + <blockquote> so
 * search engines (and screen readers) can parse the structure even
 * without aria. Schema.org/Review markup is emitted at the page
 * level rather than per-card to avoid duplicating the @id.
 */

import Link from "next/link";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type Testimonial,
  testimonialCategoryLabels,
} from "@/content/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: "default" | "featured";
}

export function TestimonialCard({
  testimonial: t,
  variant = "default",
}: TestimonialCardProps) {
  const featured = variant === "featured";
  return (
    <article
      className={cn(
        "relative rounded-2xl border transition-colors",
        featured
          ? "bg-brand-50 border-brand-100 p-9 lg:p-14"
          : "bg-cream-50 border-warm-light/60 p-7 hover:border-brand-300",
      )}
    >
      <Quote
        className={cn(
          "text-brand-400/40",
          featured ? "h-11 w-11 mb-6" : "h-7 w-7 mb-4",
        )}
        aria-hidden
      />

      <blockquote
        className={cn(
          "font-serif text-charcoal-dark leading-relaxed text-pretty",
          featured ? "text-2xl md:text-[1.65rem] mb-10 text-balance" : "text-lg mb-6",
        )}
      >
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      <footer
        className={cn(
          "flex items-center gap-4",
          !featured && "pt-5 border-t border-warm-light/50",
        )}
      >
        <div
          className={cn(
            "grid place-items-center rounded-full bg-brand-400 text-white font-serif shrink-0",
            featured ? "h-14 w-14 text-xl" : "h-11 w-11 text-base",
          )}
          aria-hidden
        >
          {t.initials}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-semibold text-charcoal-dark truncate",
              featured ? "text-base" : "text-sm",
            )}
          >
            {t.author}
          </p>
          <p
            className={cn(
              "text-charcoal/65 truncate",
              featured ? "text-sm mt-0.5" : "text-xs mt-0.5",
            )}
          >
            {t.role}
          </p>
          {(t.date || t.rating) && (
            <div className="flex items-center gap-3 mt-1.5 text-xs text-charcoal/45">
              {t.rating && (
                <span className="flex items-center gap-0.5" aria-label={`${t.rating} ud af 5 stjerner`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < (t.rating ?? 0) ? "fill-brand-400 text-brand-400" : "text-charcoal/15",
                      )}
                      aria-hidden
                    />
                  ))}
                </span>
              )}
              {t.date && <span>{t.date}</span>}
            </div>
          )}
        </div>

        {t.projectSlug && (
          <Link
            href={`/projekter/${t.projectSlug}`}
            className={cn(
              "ml-2 shrink-0 text-[10px] uppercase tracking-widest font-semibold rounded px-2 py-1 transition-colors",
              "bg-cream-200 text-brand-600 hover:bg-brand-100",
            )}
            aria-label={`Se projektet ${testimonialCategoryLabels[t.category]}`}
          >
            {testimonialCategoryLabels[t.category]}
          </Link>
        )}
        {!t.projectSlug && (
          <span
            className={cn(
              "ml-2 shrink-0 text-[10px] uppercase tracking-widest font-semibold rounded px-2 py-1",
              "bg-cream-200 text-brand-600",
            )}
          >
            {testimonialCategoryLabels[t.category]}
          </span>
        )}
      </footer>
    </article>
  );
}
