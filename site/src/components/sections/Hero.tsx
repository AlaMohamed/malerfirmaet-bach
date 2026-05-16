"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { hero } from "@/content/site";

export function Hero() {
  return (
    <section
      className="relative min-h-[100vh] flex items-end overflow-hidden grain"
      aria-label="Hero"
    >
      {/* Cinematic Ken Burns background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-kenburns">
          <Image
            src="/images/shared/hero-novo-kalundborg.jpg"
            alt="Novo Nordisk Purification Plant 5 i Kalundborg – malerentreprise udført af Malerfirmaet Bach"
            fill
            priority
            quality={88}
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-fade-bottom" />
      </div>

      <Container className="relative z-10 pb-20 pt-40">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11px] font-semibold uppercase tracking-widest text-white/65 mb-7 flex items-center gap-3"
          >
            <span className="h-px w-8 bg-brand-300" aria-hidden="true" />
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-white text-display-xl text-balance"
          >
            {hero.titleA}
            <br />
            <em className="not-italic text-brand-200">{hero.titleB}</em>
            {" "}&
            <br />
            {hero.titleC}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-white/75 text-lg md:text-xl max-w-xl leading-relaxed text-pretty"
          >
            {hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button href={hero.ctaPrimary.href} variant="primary" size="lg" withArrow>
              {hero.ctaPrimary.label}
            </Button>
            <Button href={hero.ctaSecondary.href} variant="ghost" size="lg">
              {hero.ctaSecondary.label}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="mt-14 pt-8 border-t border-white/15 flex gap-10"
          >
            {hero.stats.map((s) => (
              <div key={s.label}>
                <p className="font-serif text-3xl md:text-4xl text-white tracking-tight">
                  {s.value.replace(/(\+|%)/, "")}
                  <span className="text-brand-300">{s.value.match(/(\+|%)/)?.[0]}</span>
                </p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </motion.div>
    </section>
  );
}
