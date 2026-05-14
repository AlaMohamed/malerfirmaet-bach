"use client";

import { motion } from "framer-motion";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { processSteps } from "@/content/site";

export function Process() {
  return (
    <section id="proces" className="py-28 lg:py-32 bg-cream-200">
      <Container>
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="flex justify-center"><Eyebrow>Vores tilgang</Eyebrow></div>
          <h2 className="font-serif text-display-lg mt-4 text-balance">
            Fra første opkald til færdigt arbejde
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {processSteps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative text-center"
            >
              <div className="relative inline-flex">
                <div
                  className={
                    s.n === processSteps.length
                      ? "h-14 w-14 rounded-full bg-brand-400 grid place-items-center mb-5 mx-auto"
                      : "h-14 w-14 rounded-full border-2 border-brand-400 bg-cream-50 grid place-items-center mb-5 mx-auto"
                  }
                >
                  <span
                    className={
                      s.n === processSteps.length
                        ? "font-serif text-xl text-white"
                        : "font-serif text-xl text-brand-500"
                    }
                  >
                    {s.n}
                  </span>
                </div>
                {i < processSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden lg:block absolute top-7 left-[calc(50%+28px)] h-px w-[calc(100%-28px)] bg-gradient-to-r from-brand-400 to-warm-light"
                  />
                )}
              </div>
              <h3 className="font-serif text-lg mb-3">{s.title}</h3>
              <p className="text-charcoal/65 text-sm leading-relaxed max-w-[260px] mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
