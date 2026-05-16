"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { TitleMark } from "../ui/TitleMark";
import { getFeaturedProjects } from "@/content/projects";

export function ProjectsPreview() {
  const featured = getFeaturedProjects();
  const [primary, secondary, tertiary] = featured;

  return (
    <section className="py-28 lg:py-32 bg-charcoal-dark text-white">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <Eyebrow tone="light">Vores arbejde</Eyebrow>
            <h2 className="font-serif text-display-lg mt-4 text-white text-balance">
              Resultater der taler<br className="hidden md:block" /> <TitleMark tone="light">for sig selv</TitleMark>
            </h2>
          </div>
          <Link
            href="/projekter"
            className="group inline-flex items-center gap-2 self-start sm:self-end rounded-md border border-white/20 px-6 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            Se alle projekter
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large feature */}
          {primary && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-2 md:row-span-2"
            >
              <Link
                href={`/projekter/${primary.slug}`}
                className="group block relative overflow-hidden rounded-xl h-full min-h-[420px]"
              >
                <Image
                  src={primary.hero}
                  alt={primary.gallery[0]?.alt ?? primary.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/85 via-charcoal-deep/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <span className="inline-block rounded bg-brand-400/90 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 mb-3">
                    {primary.categoryLabel}
                  </span>
                  <p className="font-serif text-2xl md:text-3xl text-white text-balance">{primary.title}</p>
                  <p className="text-white/65 text-sm mt-1.5">{primary.service} · {primary.location}</p>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Right column */}
          {[secondary, tertiary].filter(Boolean).map((p, i) => (
            <motion.div
              key={p!.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/projekter/${p!.slug}`}
                className="group block relative overflow-hidden rounded-xl h-48 md:h-[207px]"
              >
                <Image
                  src={p!.hero}
                  alt={p!.gallery[0]?.alt ?? p!.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/85 via-charcoal-deep/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-block rounded bg-brand-400/85 text-white text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 mb-2">
                    {p!.categoryLabel}
                  </span>
                  <p className="font-serif text-lg text-white">{p!.title}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
