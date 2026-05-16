import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Privatlivspolitik",
  description: "Hvordan Malerfirmaet Bach ApS behandler dine personoplysninger.",
  robots: { index: true, follow: false },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="bg-cream-50 pt-32 pb-20">
        <Container className="max-w-3xl">
          <h1 className="font-serif text-display-md mb-2">Privatlivspolitik</h1>
          <p className="text-warm-gray text-sm mb-12">Sidst opdateret: maj 2026</p>

          <article className="space-y-10 text-charcoal/75 leading-relaxed">
            <Section title="1. Dataansvarlig">
              <p>
                {company.name}, CVR {company.cvrFormatted}, {company.address.street}, {company.address.postal} {company.address.city} er dataansvarlig for behandlingen af dine personoplysninger.
                Kontakt: <a href={`mailto:${company.email}`} className="text-brand-500 underline">{company.email}</a> eller{" "}
                <a href={`tel:${company.phoneE164}`} className="text-brand-500 underline">{company.phone}</a>.
              </p>
            </Section>

            <Section title="2. Hvilke oplysninger indsamler vi?">
              <p>Vi indsamler de oplysninger du giver os via:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li>Kontaktformular: navn, telefon, e-mail, adresse, opgavebeskrivelse og eventuelle billeder af opgaven (max 5 filer, 20 MB i alt). Billeder uploades til en sagsmappe i Google Drive, som kun Adam har adgang til.</li>
                <li>Booking-flow &quot;Ring mig op&quot;: navn, telefon. Samtalen med vores AI-agent Sofia kan optages til kvalitetssikring (med dit forudgående samtykke).</li>
                <li>Calendly: tidspunkt for besigtigelse, dine kontaktoplysninger til kalenderbegivenheden.</li>
                <li>Spam-beskyttelse: Cloudflare Turnstile foretager en kortvarig browser-test for at verificere at du ikke er en bot. Der sættes ikke cookies med persondata.</li>
                <li>Google Analytics 4: anonymiseret besøgsstatistik (kun ved aktivt samtykke).</li>
              </ul>
            </Section>

            <Section title="3. Formål og retsgrundlag">
              <p>
                Vi behandler dine oplysninger for at kunne besvare din henvendelse, planlægge besigtigelse og sende dig et tilbud.
                Retsgrundlaget er dit samtykke (GDPR art. 6, stk. 1, litra a) og vores legitime interesse i at drive virksomhed (art. 6, stk. 1, litra f).
              </p>
            </Section>

            <Section title="4. Databehandlere">
              <p>Vi anvender følgende underleverandører — alle med databehandleraftaler og GDPR-compliance:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li><strong>Vercel</strong> (hosting, EU-region) — leverer hjemmesiden</li>
                <li><strong>Cloudflare Turnstile</strong> (spam-beskyttelse, USA — SCC) — verificerer at indsendere ikke er bots; ingen persondata sættes i cookies</li>
                <li><strong>Resend</strong> (e-mail-leverance, EU) — afsendelse af bekræftelser</li>
                <li><strong>Calendly</strong> (booking-kalender, USA — SCC) — planlægning af møder</li>
                <li><strong>Retell AI / Twilio</strong> (AI-opkald + telefonnummer, USA — SCC) — Sofia ringer dig op fra <strong>+45 91 30 95 35</strong></li>
                <li><strong>Make.com</strong> (automatisering, EU) — flytter data mellem systemer</li>
                <li><strong>Airtable</strong> (CRM, USA — SCC) — opbevarer leads</li>
                <li><strong>Google Drive</strong> (filopbevaring, EU) — opbevarer billeder du uploader i kontakt- eller booking-formularen; vi opretter en mappe pr. sag</li>
                <li><strong>Google Analytics 4</strong> (statistik, USA — SCC) — anonymiseret trafikdata, kun ved samtykke</li>
              </ul>
            </Section>

            <Section title="5. Opbevaring og sletning">
              <p>
                Vi opbevarer dine oplysninger så længe det er nødvendigt for at opfylde formålet, dog maksimalt
                3 år efter seneste kontakt, medmindre lovgivning kræver længere opbevaring (fx bogføringsloven).
                Lyd-optagelser fra Sofia slettes efter 90 dage.
              </p>
            </Section>

            <Section title="6. Dine rettigheder">
              <p>
                Du har til enhver tid ret til indsigt, berigtigelse, sletning, begrænsning og dataportabilitet.
                Du kan trække dit samtykke tilbage ved at kontakte os på{" "}
                <a href={`mailto:${company.email}`} className="text-brand-500 underline">{company.email}</a>.
                Du kan også klage til Datatilsynet på{" "}
                <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener" className="text-brand-500 underline">datatilsynet.dk</a>.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                Vi bruger kun teknisk nødvendige cookies som standard. Google Analytics 4 aktiveres først ved aktivt samtykke.
                Læs mere i vores <Link href="/cookiepolitik" className="text-brand-500 underline">cookiepolitik</Link>.
              </p>
            </Section>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl text-charcoal-dark mb-4">{title}</h2>
      <div className="text-sm">{children}</div>
    </section>
  );
}
