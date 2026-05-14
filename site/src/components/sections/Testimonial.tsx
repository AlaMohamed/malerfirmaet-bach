"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Container } from "../ui/Container";
import { testimonial } from "@/content/site";

export function Testimonial() {
  return (
    <section className="py-24 bg-brand-50" aria-label="Kundeanmeldelse">
      <Container className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <Quote className="h-10 w-10 text-brand-400/40 mx-auto mb-6" aria-hidden />
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-charcoal-dark text-balance">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <footer className="mt-10">
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-brand-400 text-white font-serif text-lg">
              {testimonial.initials}
            </div>
            <p className="font-semibold text-sm text-charcoal-dark">{testimonial.author}</p>
            <p className="text-charcoal/65 text-sm mt-1">{testimonial.role}</p>
          </footer>
        </motion.div>
      </Container>
    </section>
  );
}
