"use client";

import { motion } from "framer-motion";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { Button } from "../ui/Button";
import { company } from "@/content/site";

export function ContactCta() {
  return (
    <section className="py-28 bg-charcoal-dark text-white" aria-label="Kontakt CTA">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="flex justify-center"><Eyebrow tone="light">Næste projekt</Eyebrow></div>
          <h2 className="font-serif text-display-lg mt-5 text-white text-balance">
            Skal dit projekt være det næste?
          </h2>
          <p className="mt-6 text-white/70 leading-relaxed text-pretty">
            Kontakt os for et gratis og uforpligtende tilbud. Vi besigter opgaven og sender et skriftligt tilbud inden for 1–2 hverdage.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/book-besigtigelse" size="lg" withArrow>
              Book uforpligtende besigtigelse
            </Button>
            <Button href={`tel:${company.phoneE164}`} variant="ghost" size="lg">
              Ring {company.phone}
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
