/**
 * /referencer — customer testimonials hub.
 *
 * Server component handles the page chrome (PageHeader, stats strip,
 * featured testimonial, CTA, ContactCta) so it stays statically
 * rendered and SEO-indexable. The filterable grid below is the only
 * interactive part, isolated in <TestimonialGrid> as a client island.
 *
 * Schema.org/Review JSON-LD is emitted once for the whole page so
 * Google sees a structured "list of reviews about this Organization"
 * — note that Google does NOT surface star snippets for first-party
 * org reviews (only third-party platforms like Trustpilot do), so
 * this is for crawler hygiene rather than rich-result expectations.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TitleMark } from "@/components/ui/TitleMark";
import { TestimonialCard } from "@/components/sections/TestimonialCard";
import { TestimonialGrid } from "@/components/sections/TestimonialGrid";
import { ContactCta } from "@/components/sections/ContactCta";
import {
  testimonials,
  getFeaturedTestimonial,
  getNonFeaturedTestimonials,
  getTestimonialStats,
} from "@/content/testimonials";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Referencer",
  description:
    "Tilbagemeldinger fra hoteller, institutioner og privatkunder. Læs hvad vores kunder siger om Malerfirmaet Bach.",
  openGraph: {
    title: "Referencer · Malerfirmaet Bach",
    description: "Tilbagemeldinger fra hoteller, institutioner og privatkunder.",
  },
};

export default function ReferencerPage() {
  const featured = getFeaturedTestimonial();
  const rest = getNonFeaturedTestimonials();
  const stats = getTestimonialStats();

  // Schema.org/Review markup — one Review object per testimonial,
  // grouped under the Organization. Avoids per-card duplication.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.url,
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.author },
      reviewBody: t.quote,
      datePublished: t.date,
      ...(t.rating
        ? {
            reviewRating: {
              "@type": "Rating",
              ratingValue: t.rating,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
    })),
    ...(stats.averageRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: stats.averageRating.toFixed(1),
            reviewCount: stats.withRatings,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <>
      <Nav />
      <main>
        <PageHeader
          eyebrow="Referencer"
          title={<>Hvad vores kunder <TitleMark tone="light">siger</TitleMark></>}
          subtitle="Tilbagemeldinger fra hoteller, institutioner og privatkunder vi har samarbejdet med — på tværs af København og Sjælland."
          breadcrumbs={[{ label: "Forside", href: "/" }, { label: "Referencer" }]}
        />

        {/* Stats strip — three quick credibility signals.
            Reads naturally as "X tilfredse kunder · gennemsnit · 12+ hoteller".
            Numbers come from the data layer where possible. */}
        <section className="bg-cream-50 border-b border-warm-light/60">
          <Container className="py-10">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-2">
                  Tilfredse kunder
                </dt>
                <dd className="font-serif text-3xl text-charcoal-dark">
                  {stats.total}+
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-2">
                  Gennemsnitlig vurdering
                </dt>
                <dd className="font-serif text-3xl text-charcoal-dark">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : "—"}
                  <span className="text-brand-400">/5</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-2">
                  Hoteller renoveret
                </dt>
                <dd className="font-serif text-3xl text-charcoal-dark">12+</dd>
              </div>
            </dl>
          </Container>
        </section>

        {/* Featured testimonial — biggest visual moment on the page. */}
        {featured && (
          <section className="py-20 bg-cream-200">
            <Container className="max-w-4xl">
              <div className="flex justify-center mb-8">
                <Eyebrow>Udvalgt</Eyebrow>
              </div>
              <TestimonialCard testimonial={featured} variant="featured" />
            </Container>
          </section>
        )}

        {/* Filterable grid of remaining testimonials.
            Client component handles the chip state in isolation. */}
        <section className="py-20 bg-cream-50">
          <Container className="max-w-6xl">
            <div className="text-center mb-12">
              <Eyebrow>Flere udtalelser</Eyebrow>
              <h2 className="font-serif text-display-md mt-4 text-balance">
                Læs hvad vores <TitleMark>kunder</TitleMark> siger
              </h2>
            </div>
            <TestimonialGrid testimonials={rest} />
          </Container>
        </section>

        {/* Mid-page CTA — converts engaged readers into leads.
            Visually distinct from the footer CTA so it doesn't feel
            like a duplicate. */}
        <section className="py-20 bg-cream-200">
          <Container className="max-w-3xl text-center">
            <Eyebrow>Næste skridt</Eyebrow>
            <h2 className="font-serif text-display-md mt-4 mb-5 text-balance">
              Vil du være vores næste <TitleMark>tilfredse kunde</TitleMark>?
            </h2>
            <p className="text-charcoal/70 leading-relaxed mb-9 text-pretty">
              Send os din opgave — vi besigter gratis og uforpligtende, og sender et skriftligt tilbud inden for 1-2 hverdage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/book-besigtigelse" size="lg" withArrow>
                Book besigtigelse
              </Button>
              <Link
                href="/projekter"
                className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-dark hover:text-brand-500 transition-colors"
              >
                Se vores projekter
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Container>
        </section>

        <ContactCta />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        // Schema-org review data — see comment at top of file
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
