"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { projects, categoryFilters, type ProjectCategory } from "@/content/projects";

export function ProjectsGrid() {
  const [filter, setFilter] = useState<ProjectCategory | "alle">("alle");
  const visible = useMemo(
    () => projects.filter((p) => filter === "alle" || p.category === filter),
    [filter],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3" role="group" aria-label="Filtrér projekter">
        {categoryFilters.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                active
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-warm-light text-warm-gray hover:border-brand-400 hover:text-charcoal",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <p className="text-charcoal/55 text-sm mb-10">
        Viser {visible.length} {visible.length === 1 ? "projekt" : "projekter"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((p, i) => (
          <motion.article
            key={p.slug}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="group"
          >
            <Link href={`/projekter/${p.slug}`} className="block">
              <div className="relative h-64 overflow-hidden rounded-xl">
                <Image
                  src={p.thumbnail}
                  alt={p.gallery[0]?.alt ?? p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 inline-block rounded bg-charcoal-deep/85 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1">
                  {p.categoryLabel}
                </span>
              </div>
              <div className="pt-5">
                <h2 className="font-serif text-xl mb-1.5 group-hover:text-brand-500 transition-colors">{p.title}</h2>
                <p className="text-warm-gray text-sm mb-3">{p.service} · {p.location}</p>
                <span className="inline-flex items-center gap-1.5 text-brand-500 text-sm font-medium">
                  Se projekt
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-20 text-warm-gray">
          <p className="font-serif text-2xl mb-2">Ingen projekter fundet</p>
          <p className="text-sm">Prøv en anden kategori.</p>
        </div>
      )}
    </div>
  );
}
