import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Quote } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { projects, getProject } from "@/content/projects";
import { ContactCta } from "@/components/sections/ContactCta";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata(
  { params }: { params: { slug: string } },
): Metadata {
  const p = getProject(params.slug);
  if (!p) return { title: "Projekt ikke fundet" };
  return {
    title: `${p.title} — ${p.categoryLabel}`,
    description: p.summary,
    openGraph: {
      title: p.title,
      description: p.summary,
      images: [{ url: p.hero, width: 1200, height: 800, alt: p.title }],
    },
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();

  return (
    <>
      <Nav overlayMode />
      <main>
        {/* Cinematic hero with fixed background */}
        <section className="relative h-[80vh] min-h-[600px] overflow-hidden text-white">
          <Image
            src={project.hero}
            alt={project.gallery[0]?.alt ?? project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/95 via-charcoal-deep/50 to-charcoal-deep/30" />
          <Container className="relative z-10 h-full flex flex-col justify-end pb-20">
            <nav aria-label="Brødkrumme" className="flex items-center gap-2 text-xs text-white/55 mb-8">
              <Link href="/" className="hover:text-white">Forside</Link>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <Link href="/projekter" className="hover:text-white">Projekter</Link>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <span className="text-white/85">{project.title}</span>
            </nav>
            <Eyebrow tone="light">{project.categoryLabel} · {project.service}</Eyebrow>
            <h1 className="font-serif text-display-xl mt-4 text-white text-balance">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-white/70 text-lg leading-relaxed text-pretty">
              {project.summary}
            </p>
          </Container>
        </section>

        {/* Project metadata bar.
            Five fact strips (Bygherre, Kategori, Ydelse, Lokation, Periode).
            Periode is conditional on the project having a `period` field
            — older entries without one will collapse the column away. We
            switch to a 5-column grid only at md+ so mobile gets a clean
            2-up stack. */}
        <section className="bg-cream-50 border-b border-warm-light/60">
          <Container className="py-8">
            <dl
              className={`grid grid-cols-2 gap-6 ${
                project.period ? "md:grid-cols-5" : "md:grid-cols-4"
              }`}
            >
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-1.5">Bygherre</dt>
                <dd className="font-medium text-charcoal">{project.client}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-1.5">Kategori</dt>
                <dd className="font-medium text-charcoal">{project.categoryLabel}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-1.5">Ydelse</dt>
                <dd className="font-medium text-charcoal">{project.service}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-1.5">Beliggenhed</dt>
                <dd className="font-medium text-charcoal">{project.location}</dd>
              </div>
              {project.period && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-warm-gray font-semibold mb-1.5">Periode</dt>
                  <dd className="font-medium text-charcoal">{project.period}</dd>
                </div>
              )}
            </dl>
          </Container>
        </section>

        {/* Story.
            First paragraph rendered as a slightly larger lead so the
            opening sentence has visual weight — a common print-design
            move that makes long-form copy more inviting. Subsequent
            paragraphs use the standard body size. */}
        <section className="py-24 bg-cream-200">
          <Container className="max-w-3xl">
            <Eyebrow>Om projektet</Eyebrow>
            <h2 className="font-serif text-display-md mt-4 mb-8 text-balance">
              Projektbeskrivelse
            </h2>
            <div className="text-charcoal/80 text-pretty">
              {project.description.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "text-lg leading-relaxed mb-6 text-charcoal-dark"
                      : "leading-relaxed mb-5 last:mb-0"
                  }
                >
                  {p}
                </p>
              ))}
            </div>

            {project.quote && (
              <blockquote className="mt-12 pl-6 border-l-2 border-brand-400 italic font-serif text-xl text-charcoal-dark">
                <Quote className="h-7 w-7 text-brand-400/50 mb-3" aria-hidden />
                &ldquo;{project.quote.text}&rdquo;
                <footer className="mt-4 text-sm text-warm-gray not-italic font-sans">— {project.quote.author}</footer>
              </blockquote>
            )}
          </Container>
        </section>

        {/* Gallery */}
        {project.gallery.length > 0 && (
          <section className="py-20 bg-cream-50">
            <Container>
              <Eyebrow>Galleri</Eyebrow>
              <h2 className="font-serif text-display-md mt-4 mb-12">Resultatet</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.gallery.map((g, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg group">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {g.tag && (
                      <span
                        className={`absolute top-2 left-2 rounded text-white text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 ${
                          g.tag === "efter" ? "bg-brand-400/85" : "bg-charcoal-deep/75"
                        }`}
                      >
                        {g.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Back + next */}
        <section className="py-16 bg-cream-200">
          <Container className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link
              href="/projekter"
              className="group inline-flex items-center gap-2 text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Tilbage til alle projekter
            </Link>
            <Button href="/book-besigtigelse" withArrow>
              Få et tilbud på dit projekt
            </Button>
          </Container>
        </section>

        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
