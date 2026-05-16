"use client";

/**
 * Homepage testimonial section.
 *
 * Replaces the previous static-quote layout with a stronger CTA frame:
 *   - Headline "Skal dit projekt være det næste?" (highlighted)
 *   - Eyebrow + descriptive subtitle
 *   - Featured testimonial card from the testimonials data
 *   - Button to /referencer for the full set
 *
 * This is the main conversion-oriented social-proof section on the
 * homepage. The same featured testimonial appears at the top of
 * /referencer, so the visitor gets continuity when they click
 * through.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { TitleMark } from "../ui/TitleMark";
import { TestimonialCard } from "./TestimonialCard";
import { getFeaturedTestimonial } from "@/content/testimonials";

export function Testimonial() {
  const featured = getFeaturedTestimonial();
  if (!featured) return null;

  return (
    <section className="py-24 bg-brand-50" aria-label="Referencer">
      <Container className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex justify-center mb-5">
            <Eyebrow>Referencer</Eyebrow>
          </div>
          <h2 className="font-serif text-display-lg text-center text-charcoal-dark text-balance mb-5">
            Skal <TitleMark>dit projekt</TitleMark> være det næste?
          </h2>
          <p className="text-center text-charcoal/65 leading-relaxed max-w-2xl mx-auto mb-12 text-pretty">
            Tilbagemeldinger fra hoteller, institutioner og privatkunder vi har samarbejdet med.
          </p>

          <TestimonialCard testimonial={featured} variant="featured" />

          <div className="mt-10 text-center">
            <Link
              href="/referencer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-dark hover:text-brand-500 transition-colors"
            >
              Læs alle referencer
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
