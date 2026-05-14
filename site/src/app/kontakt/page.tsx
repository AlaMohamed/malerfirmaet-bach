import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Skriv til os og få et gratis, uforpligtende tilbud. Vi svarer typisk inden for 24 timer på hverdage.",
};

export default function KontaktPage() {
  return (
    <>
      <Nav />
      <main>
        <PageHeader
          eyebrow="Kontakt os"
          title="Skriv eller ring"
          subtitle="Beskriv din opgave så vender vi tilbage hurtigst muligt — typisk inden for 24 timer på hverdage."
          breadcrumbs={[{ label: "Forside", href: "/" }, { label: "Kontakt" }]}
        />
        <section className="py-20 bg-cream-200">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
              <aside className="lg:col-span-2 space-y-3">
                <ContactBlock icon={Phone} label="Telefon" value={company.phone} href={`tel:${company.phoneE164}`} />
                <ContactBlock icon={Mail} label="E-mail" value={company.email} href={`mailto:${company.email}`} />
                <ContactBlock
                  icon={MapPin}
                  label="Adresse"
                  value={`${company.address.street}, ${company.address.postal} ${company.address.city}`}
                />
                <ContactBlock
                  icon={Clock}
                  label="Åbningstider"
                  value={company.hours.weekdays}
                  sub={company.hours.weekend}
                />
                <div className="rounded-xl bg-brand-50 border border-brand-100 p-5 mt-6">
                  <p className="font-medium text-charcoal-dark mb-1">Hellere booke en tid?</p>
                  <p className="text-sm text-charcoal/70 leading-relaxed mb-3">
                    Lad Sofia ringe dig op inden for 5 min — eller book direkte i kalenderen.
                  </p>
                  <Link
                    href="/book-besigtigelse"
                    className="text-sm font-semibold text-brand-500 hover:text-brand-600"
                  >
                    Gå til booking →
                  </Link>
                </div>
              </aside>
              <div className="lg:col-span-3">
                <ContactForm />
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ContactBlock({ icon: Icon, label, value, href, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string; sub?: string }) {
  const inner = (
    <div className="flex items-center gap-4 bg-cream-50 rounded-xl border border-warm-light/60 p-5 hover:border-brand-300 transition-colors">
      <div className="h-10 w-10 rounded-md bg-brand-50 grid place-items-center shrink-0">
        <Icon className="h-4 w-4 text-brand-500" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-0.5">{label}</p>
        <p className="font-medium text-charcoal-dark text-sm">{value}</p>
        {sub && <p className="text-xs text-warm-gray mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
