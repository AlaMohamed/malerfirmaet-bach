"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { Container } from "./ui/Container";
import { nav, company } from "@/content/site";

export function Nav({ overlayMode = false }: { overlayMode?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const useOverlayStyle = overlayMode && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-colors duration-500 border-b",
        useOverlayStyle ? "nav-transparent" : "nav-solid",
      )}
    >
      <Container>
        <nav
          aria-label="Primær navigation"
          className="flex h-20 items-center justify-between"
        >
          <Link
            href="/"
            className="flex items-center group"
            aria-label={`${company.name} – forside`}
          >
            <Image
              src="/logo.png"
              alt={company.name}
              width={220}
              height={56}
              priority
              className={cn(
                "h-10 md:h-12 w-auto transition-all",
                useOverlayStyle && "brightness-0 invert opacity-90",
              )}
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {nav.primary.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium tracking-wide transition-colors",
                    useOverlayStyle
                      ? "text-white/80 hover:text-white"
                      : active
                      ? "text-charcoal-dark"
                      : "text-warm-gray hover:text-charcoal",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={`tel:${company.phone.replace(/\s/g, "")}`}
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors",
                useOverlayStyle ? "text-brand-200 hover:text-white" : "text-brand-500 hover:text-brand-600",
              )}
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {company.phone}
            </Link>
            <Link
              href={nav.cta.href}
              className={cn(
                "rounded-md px-5 py-2.5 text-sm font-medium tracking-wide transition-all",
                useOverlayStyle
                  ? "bg-brand-400 text-white hover:bg-brand-500"
                  : "bg-charcoal text-white hover:bg-charcoal-dark",
              )}
            >
              {nav.cta.label}
            </Link>
          </div>

          <button
            className={cn(
              "md:hidden inline-flex items-center justify-center p-2 rounded-md transition-colors",
              useOverlayStyle ? "text-white" : "text-charcoal",
            )}
            aria-label={open ? "Luk menu" : "Åbn menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </Container>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden border-t border-warm-light overflow-hidden transition-all duration-300 bg-cream-100/98 backdrop-blur",
          open ? "max-h-[480px]" : "max-h-0",
        )}
      >
        <Container className="py-4">
          <div className="flex flex-col">
            {nav.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 text-sm font-medium text-charcoal hover:text-brand-500 border-b border-warm-light/60"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`tel:${company.phone.replace(/\s/g, "")}`}
              className="py-3 text-sm font-semibold text-brand-500 border-b border-warm-light/60"
            >
              <Phone className="inline h-3.5 w-3.5 mr-1.5" />
              {company.phone}
            </Link>
            <Link
              href={nav.cta.href}
              className="mt-4 inline-flex justify-center rounded-md bg-charcoal px-5 py-3 text-sm font-medium text-white"
            >
              {nav.cta.label}
            </Link>
          </div>
        </Container>
      </div>
    </header>
  );
}
