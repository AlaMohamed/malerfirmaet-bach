"use client";

import { motion } from "framer-motion";
import { Brush, Building2, Home, Layers, Sparkles, Palette, type LucideIcon } from "lucide-react";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { services } from "@/content/site";

const icons: Record<string, LucideIcon> = {
  "indvendig-maling": Home,
  "udvendig-maling": Building2,
  "erhverv-institutioner": Layers,
  "totalrenovering": Brush,
  "sproejtemaling": Sparkles,
  "farvekonsultation": Palette,
};

export function Services() {
  return (
    <section id="services" className="py-28 lg:py-32 bg-cream-200">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-5">
            <Eyebrow>Ydelser</Eyebrow>
            <h2 className="font-serif text-display-lg mt-4 text-balance">Hvad vi laver</h2>
          </div>
          <div className="lg:col-span-7 lg:pt-10">
            <p className="text-charcoal/75 text-lg leading-relaxed text-pretty">
              Fra enkle malerarbejder til totalrenoveringer af hoteller og institutioner — vi løser alle typer opgaver med samme omhu og ordholdenhed. Vi koordinerer alle håndværkere, så du kun har én kontaktperson.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = icons[s.slug] ?? Brush;
            return (
              <motion.article
                key={s.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="group bg-cream-50 rounded-xl border border-warm-light/70 p-8 hover:-translate-y-1 hover:shadow-2xl hover:shadow-charcoal/5 hover:border-brand-300/50 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-brand-50 grid place-items-center mb-5 transition-colors group-hover:bg-brand-100">
                  <Icon className="h-5 w-5 text-brand-500" aria-hidden />
                </div>
                <h3 className="font-serif text-xl mb-3">{s.title}</h3>
                <p className="text-charcoal/65 text-sm leading-relaxed">{s.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
