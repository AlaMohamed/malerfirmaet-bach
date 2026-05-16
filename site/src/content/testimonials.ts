/**
 * Customer testimonials / references.
 *
 * Source-of-truth for everything that renders on /referencer plus the
 * featured-quote section on the homepage. Replace the placeholder
 * entries below with real customer quotes as they come in — see
 * /projekt-info/customer-info-malerfirmaet-bach.md for the standard
 * intake template Adam asks each customer to fill out.
 *
 * Field guide
 * -----------
 *   id          stable kebab-case slug — used as React key + URL anchor
 *   quote       the testimonial text, written verbatim (no edits)
 *   author      full name or first-name only if anonymity preferred
 *   role        title + workplace, e.g. "Hotelchef, Hotel Mayfair"
 *   category    drives the filter chips on /referencer
 *   initials    1-3 letters for the avatar bubble (no photos needed)
 *   date        human-readable month + year — leave blank if unknown
 *   rating      1-5 stars — leave blank if customer didn't volunteer
 *   source      "Google", "Direkte", "Trustpilot", etc. — leave blank
 *               if just a written reference
 *   projectSlug optional link to a /projekter/<slug> case study
 *   featured    1 testimonial only — appears prominently at the top
 *               of /referencer AND replaces the homepage quote
 */

import type { ProjectCategory } from "./projects";

export type TestimonialCategory = ProjectCategory;

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  category: TestimonialCategory;
  initials: string;
  date?: string;
  rating?: number;
  source?: string;
  projectSlug?: string;
  featured?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: "hotel-mayfair-2025",
    quote:
      "Bach Maler leverede et fantastisk stykke arbejde på vores bagtrapper. Hotellet havde gæster i huset under hele renoveringen, og arbejdet blev udført uden klager — det er ikke noget, vi tager for givet. Klar kommunikation fra start til slut, og resultatet taler for sig selv.",
    author: "Sofia Bjerregaard",
    role: "Hotelchef, Hotel Mayfair",
    category: "erhverv",
    initials: "SB",
    date: "Juni 2025",
    rating: 5,
    projectSlug: "hotel-mayfair",
    featured: true,
  },
  {
    id: "vibevaenget-2024",
    quote:
      "Adam var meget serviceminded og resultatorienteret. De leverede et fremragende stykke kvalitetshåndværk og overholdt den aftalte tid og pris. Efter totalrenovationen kom kommunen på besøg og godkendte alt det udførte arbejde.",
    author: "Ingolf & Ghufran",
    role: "Børnehaveleder, Vibevænget",
    category: "institutioner",
    initials: "IG",
    date: "Maj 2024",
    rating: 5,
  },
  {
    id: "novo-lyngby-2026",
    quote:
      "Bach Maler tilpassede sig vores driftsplan og udførte arbejdet i etaper, så medarbejderne kunne arbejde uforstyrret. Resultatet er et arbejdsmiljø, vi er stolte af at vise frem. De er en partner, vi gerne bruger igen.",
    author: "Mette Holstein",
    role: "Facility Manager, Novo Nordisk Lyngby",
    category: "erhverv",
    initials: "MH",
    date: "Januar 2026",
    rating: 5,
    projectSlug: "novo-lyngby",
  },
  {
    id: "holmstrup-2025",
    quote:
      "Vi havde brug for at få vores nybyggede hus malet inden indflytning. Bach leverede præcis det, vi havde aftalt — til den aftalte tid. Alt var velorganiseret, og finishen er prikfri. Vi anbefaler dem til vores naboer.",
    author: "Lars & Christina",
    role: "Privatkunde, Jyderup",
    category: "privat",
    initials: "LC",
    date: "Oktober 2025",
    rating: 5,
    projectSlug: "holmstrup-jyderup",
  },
  {
    id: "kulturporten-2025",
    quote:
      "Et stort projekt med 120 boliger blev gennemført inden for tidsplanen. Bach Maler koordinerede tæt med os og de øvrige håndværkere, og kvaliteten er ensartet på tværs af alle enheder. Klar dialog hele vejen igennem.",
    author: "Peter Berg",
    role: "Bygherrerepræsentant, Kulturporten Farum",
    category: "institutioner",
    initials: "PB",
    date: "August 2025",
    rating: 5,
    projectSlug: "kulturporten",
  },
  {
    id: "mjolnerparken-2026",
    quote:
      "Bach Maler har leveret løbende renovering af cirka 100 flytteboliger over et helt år. Konsistent kvalitet, fleksibel planlægning og hurtig udførelse — præcis det, vi havde brug for til en operation af den størrelse.",
    author: "Driftschef",
    role: "Mjølnerparken Bolig",
    category: "erhverv",
    initials: "MP",
    date: "Januar 2026",
    rating: 5,
    projectSlug: "mjolnerparken",
  },
];

export const testimonialCategoryLabels: Record<TestimonialCategory, string> = {
  erhverv: "Erhverv",
  institutioner: "Institutioner",
  privat: "Privat",
};

export function getFeaturedTestimonial(): Testimonial | undefined {
  return testimonials.find((t) => t.featured);
}

export function getNonFeaturedTestimonials(): Testimonial[] {
  return testimonials.filter((t) => !t.featured);
}

/** Quick stats for the /referencer hero strip. */
export function getTestimonialStats() {
  const count = testimonials.length;
  const withRating = testimonials.filter((t) => typeof t.rating === "number");
  const avg =
    withRating.length > 0
      ? withRating.reduce((sum, t) => sum + (t.rating ?? 0), 0) / withRating.length
      : null;
  return {
    total: count,
    averageRating: avg,
    withRatings: withRating.length,
  };
}
