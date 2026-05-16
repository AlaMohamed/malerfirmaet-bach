"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { TitleMark } from "../ui/TitleMark";
import { faq } from "@/content/site";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-28 lg:py-32 bg-cream-50" aria-labelledby="faq-heading">
      <Container className="max-w-3xl">
        <div className="text-center mb-16">
          <div className="flex justify-center"><Eyebrow>Spørgsmål og svar</Eyebrow></div>
          <h2 id="faq-heading" className="font-serif text-display-lg mt-4 text-balance">
            Ofte stillede <TitleMark>spørgsmål</TitleMark>
          </h2>
        </div>
        <ul className="divide-y divide-warm-light/70">
          {faq.map((item, i) => {
            const expanded = open === i;
            return (
              <li key={item.q} className="py-2">
                <button
                  className="w-full flex items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : i)}
                >
                  <span className="font-medium text-charcoal-dark text-base">{item.q}</span>
                  <Plus
                    className={cn(
                      "h-5 w-5 text-brand-500 shrink-0 transition-transform duration-300",
                      expanded && "rotate-45",
                    )}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-charcoal/70 text-sm leading-relaxed pb-5 pr-10">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
