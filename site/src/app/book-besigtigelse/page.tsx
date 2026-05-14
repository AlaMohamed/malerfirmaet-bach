import type { Metadata } from "next";
import { Phone, Calendar, ShieldCheck, Clock, MapPin } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/PageHeader";
import { SofiaCallback } from "@/components/forms/SofiaCallback";
import { CalendlyEmbed } from "@/components/forms/CalendlyEmbed";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Book uforpligtende besigtigelse",
  description:
    "Vælg selv: Lad Sofia ringe dig op inden for 5 minutter, eller vælg en tid direkte i kalenderen. Gratis og uforpligtende.",
};

export default function BookPage() {
  return (
    <>
      <Nav />
      <main>
        <PageHeader
          eyebrow="Booking"
          title="Book uforpligtende besigtigelse"
          subtitle="Vælg den måde der passer dig — vi ringer dig op, eller du booker direkte i Adams kalender. Gratis og uden binding."
          breadcrumbs={[
            { label: "Forside", href: "/" },
            { label: "Book besigtigelse" },
          ]}
        />

        <section className="py-20 bg-cream-200">
          <Container>
            {/* Two flows side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Flow A — Sofia callback */}
              <article className="bg-cream-50 rounded-2xl border border-warm-light/70 p-8 lg:p-10 relative">
                <span className="absolute -top-3 left-8 inline-block rounded-full bg-brand-400 text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
                  Hurtigst
                </span>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-11 w-11 rounded-full bg-brand-50 grid place-items-center">
                    <Phone className="h-5 w-5 text-brand-500" aria-hidden />
                  </div>
                  <h2 className="font-serif text-2xl">Ring mig op</h2>
                </div>
                <p className="text-charcoal/65 text-sm mb-7 leading-relaxed">
                  Efterlad dit nummer — så ringer Sofia (vores AI-agent) dig op inden for 5 minutter
                  og finder en passende tid med dig. Perfekt hvis du er på farten eller udenfor åbningstid.
                </p>
                <SofiaCallback />
              </article>

              {/* Flow B — Calendly direct */}
              <article className="bg-cream-50 rounded-2xl border border-warm-light/70 p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-11 w-11 rounded-full bg-brand-50 grid place-items-center">
                    <Calendar className="h-5 w-5 text-brand-500" aria-hidden />
                  </div>
                  <h2 className="font-serif text-2xl">Vælg en tid selv</h2>
                </div>
                <p className="text-charcoal/65 text-sm mb-7 leading-relaxed">
                  Se Adams ledige tider og book direkte. Du modtager en bekræftelse med
                  tidspunkt og en påmindelse 24 timer før mødet.
                </p>
                <CalendlyEmbed />
              </article>
            </div>

            {/* Reassurance row */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, title: "Gratis og uforpligtende", desc: "Du forpligter dig ikke til noget ved at booke." },
                { icon: Clock, title: "Tilbud på 1–2 hverdage", desc: "Skriftligt tilbud efter besigtigelsen." },
                { icon: MapPin, title: "København & Sjælland", desc: "Vi kører ud og besigter på adressen." },
              ].map((b, i) => (
                <div key={i} className="bg-cream-50 rounded-lg border border-warm-light/60 p-5 flex items-start gap-4">
                  <div className="h-9 w-9 rounded-md bg-brand-50 grid place-items-center shrink-0">
                    <b.icon className="h-4 w-4 text-brand-500" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-charcoal-dark">{b.title}</p>
                    <p className="text-charcoal/60 text-sm mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct contact alt */}
            <p className="text-center text-sm text-charcoal/60 mt-12">
              Vil du hellere ringe selv?{" "}
              <a href={`tel:${company.phoneE164}`} className="text-brand-500 font-semibold hover:text-brand-600">
                Ring {company.phone}
              </a>
            </p>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
