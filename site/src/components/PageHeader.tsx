import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";

interface PageHeaderProps {
  eyebrow: string;
  // Accepts a ReactNode so consumers can embed <TitleMark> to highlight
  // a word inside the title — e.g. title={<>Skriv eller <TitleMark tone="light">ring</TitleMark></>}.
  title: ReactNode;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  bgImage?: string;
  tone?: "dark" | "light";
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  bgImage = "/images/shared/img_28.jpg",
  tone = "dark",
}: PageHeaderProps) {
  const isDark = tone === "dark";
  return (
    <section
      className={
        isDark
          ? "relative pt-40 pb-20 overflow-hidden text-white"
          : "relative pt-36 pb-16 overflow-hidden bg-cream-50"
      }
    >
      {isDark && (
        <>
          <div className="absolute inset-0">
            <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
            <div className="absolute inset-0 bg-charcoal-deep/80" />
          </div>
        </>
      )}
      <Container className="relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Brødkrumme" className={`flex items-center gap-2 text-xs mb-7 ${isDark ? "text-white/50" : "text-charcoal/55"}`}>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {b.href ? (
                  <Link href={b.href} className={isDark ? "hover:text-white" : "hover:text-charcoal"}>{b.label}</Link>
                ) : (
                  <span className={isDark ? "text-white/80" : "text-charcoal"}>{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden />}
              </span>
            ))}
          </nav>
        )}
        <Eyebrow tone={isDark ? "light" : "brand"}>{eyebrow}</Eyebrow>
        <h1 className={`font-serif mt-4 text-display-xl text-balance ${isDark ? "text-white" : ""}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-5 text-lg max-w-2xl leading-relaxed text-pretty ${isDark ? "text-white/65" : "text-charcoal/70"}`}>
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  );
}
