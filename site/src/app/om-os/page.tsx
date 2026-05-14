import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/PageHeader";
import { Testimonial } from "@/components/sections/Testimonial";
import { ContactCta } from "@/components/sections/ContactCta";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { usps, processSteps } from "@/content/site";

export const metadata: Metadata = {
  title: "Om os",
  description:
    "Malerfirmaet Bach ApS er drevet af malermester Adam — med fokus på ordholdenhed, kvalitet og klar dialog. Mød firmaet bag Radisson, Scandic og Carlsberg Byen.",
};

export default function OmOsPage() {
  return (
    <>
      <Nav />
      <main>
        <PageHeader
          eyebrow="Om os"
          title="Et ord er et ord."
          subtitle="Malerfirmaet Bach ApS er drevet af malermester Adam — med fokus på ordholdenhed, kvalitet og klar dialog. Vi tager aftaler alvorligt."
          breadcrumbs={[{ label: "Forside", href: "/" }, { label: "Om os" }]}
        />

        <section className="py-24 bg-cream-50">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              <div>
                <Eyebrow>Vores historie</Eyebrow>
                <h2 className="font-serif text-display-md mt-4 mb-6 text-balance">
                  Bygget på håndværk og ordholdenhed
                </h2>
                <div className="space-y-5 text-charcoal/75 leading-relaxed text-pretty">
                  <p>
                    Malerfirmaet Bach ApS startede med ét princip: <em>at gøre præcis hvad vi har aftalt, til den aftalte tid og pris.</em> Det lyder simpelt — men det er det der gør forskellen for vores kunder.
                  </p>
                  <p>
                    I dag har vi malet for Radisson Blu, Scandic Hvidovre, Hotel Sanders, Carlsberg Byen, Novo Nordisk, kommunens børnehaver og hundredvis af private hjem på Sjælland.
                  </p>
                  <p>
                    Adam, vores indehaver og malermester, står selv for den første besigtigelse — så du ved hvem du har med at gøre fra dag ét.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative h-72 rounded-xl overflow-hidden">
                  <Image src="/images/shared/img_28.jpg" alt="Renoveret hotelværelse" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                </div>
                <div className="relative h-72 rounded-xl overflow-hidden mt-8">
                  <Image src="/images/shared/img_48.jpg" alt="Malede legepladsehuse" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-24 bg-cream-200">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">
              <div>
                <Eyebrow>Værdier</Eyebrow>
                <h2 className="font-serif text-display-md mt-4 mb-8 text-balance">
                  Hvad du kan forvente
                </h2>
              </div>
              <div>
                <ul className="space-y-6">
                  {usps.map((u) => (
                    <li key={u.title} className="flex items-start gap-4">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-400 text-white mt-0.5">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-semibold text-charcoal-dark">{u.title}</p>
                        <p className="text-charcoal/65 mt-1 leading-relaxed">{u.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-24 bg-cream-50">
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="flex justify-center"><Eyebrow>Vores proces</Eyebrow></div>
              <h2 className="font-serif text-display-md mt-4 text-balance">Fra første samtale til afsluttet projekt</h2>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((s) => (
                <li key={s.n} className="bg-cream-200 rounded-xl p-7 border border-warm-light/60">
                  <span className="font-serif text-4xl italic text-brand-400">{String(s.n).padStart(2, "0")}</span>
                  <h3 className="font-serif text-lg mt-3 mb-2">{s.title}</h3>
                  <p className="text-sm text-charcoal/65 leading-relaxed">{s.desc}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <Testimonial />

        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
