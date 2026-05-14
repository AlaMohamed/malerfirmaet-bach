"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { usps } from "@/content/site";

export function WhyBach() {
  return (
    <section id="om-os" className="py-28 lg:py-32 bg-cream-50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          <div>
            <Eyebrow>Hvad du kan forvente</Eyebrow>
            <h2 className="font-serif text-display-lg mt-4 text-balance">
              Ordholdenhed er ikke et løfte.<br className="hidden md:block" /> Det er vores arbejdsmetode.
            </h2>
            <p className="mt-6 text-charcoal/70 leading-relaxed text-pretty">
              Vi er et malerfirma der tager aftaler alvorligt. Uanset om det er et hotelværelse eller en børnehave, leverer vi det vi lover — til aftalt tid og pris.
            </p>
            <ul className="mt-10 space-y-5">
              {usps.map((u, i) => (
                <motion.li
                  key={u.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-400 text-white mt-0.5">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-charcoal-dark">{u.title}</p>
                    <p className="text-charcoal/65 text-sm mt-1 leading-relaxed">{u.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="space-y-3">
              <div className="relative h-56 overflow-hidden rounded-md">
                <Image src="/images/shared/img_28.jpg" alt="Renoveret hotelværelse" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
              <div className="relative h-56 overflow-hidden rounded-md -mt-6 hidden sm:block">
                <Image src="/images/shared/img_14.jpg" alt="Malet legehus" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
            </div>
            <div className="space-y-3 mt-8 sm:mt-0">
              <div className="relative h-56 overflow-hidden rounded-md mt-6">
                <Image src="/images/shared/img_48.jpg" alt="Malede legepladsehuse" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
              <div className="relative h-56 overflow-hidden rounded-md hidden sm:block">
                <Image src="/images/shared/img_34.jpg" alt="Renoveret hotelgang" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
