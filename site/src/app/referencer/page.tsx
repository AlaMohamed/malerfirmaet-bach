/**
 * /referencer — customer testimonials hub.
 *
 * Server-rendered: PageHeader, stats strip, featured card, and a
 * fixed 2x2 grid of 4 non-featured testimonials. No client filter
 * (we trimmed the filter UI per Adam's request — at our current
 * volume of 5 visible testimonials, segmenting by category isn't
 * worth the interaction cost). Stats strip uses three credibility
 * signals: total customers, years in business, hotels renovated.
 *
 * Schema.org/Review JSON-LD is emitted once at the page level so
 * Google sees a structured "list of reviews about this Organization"
 * — Google does NOT show star snippets for first-party org reviews
 * (only third-party platforms do), so this is for crawler hygiene
 * rather than rich-result expectations.
 */

import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TitleMark } from "@/components/ui/TitleMark";
import { TestimonialCard } from "@/components/sections/TestimonialCard";
import { ContactCta } from "@/components/sections/ContactCta";
import {
  testimonials,
  getFeaturedTestimonial,
  getNonFeaturedTestimonials,
} from "@/content/testimonials";
import { company } from "@/content/site";

// Years Malerfirmaet Bach has been in business (per Adam, 19+ år).
const YEARS_IN_BUSINESS = 19;
// Hard-coded grid size — we render exactly this many cards under the
// featured testimonial. Excess testimonials in the data file just
// don't appear on the page; they're still available for editorial
// rotation.
const GRID_SIZE = 4;

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
  const rest = getNonFeaturedTestimonials().slice(0, GRID_SIZE);

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

        {/* Stats strip — three credibility signals.
            Reads naturally: tilfredse kunder · år i branchen · hoteller renoveret. */}
        <section className="bg-cream-50 border-b border-warm-light/60">
          <Container className="py-10">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-2">
                  Tilfredse kunder
                </dt>
                <dd className="font-serif text-3xl text-charcoal-dark">
                  {testimonials.length}+
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-2">
                  År i branchen
                </dt>
                <dd className="font-serif text-3xl text-charcoal-dark">
                  {YEARS_IN_BUSINESS}+
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

        {/* Fixed grid of 4 non-featured testimonials.
            2 columns on desktop, 1 column on mobile. No filter — at
            five visible cards the segmenting cost outweighs the
            navigation benefit. */}
        <section className="py-20 bg-cream-50">
          <Container className="max-w-6xl">
            <div className="text-center mb-12">
              <Eyebrow>Flere udtalelser</Eyebrow>
              <h2 className="font-serif text-display-md mt-4 text-balance">
                Læs hvad vores <TitleMark>kunder</TitleMark> siger
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {rest.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
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
