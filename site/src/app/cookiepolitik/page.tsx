import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Cookiepolitik",
  description: "Vores brug af cookies på malerfirmaetbach.dk.",
  robots: { index: true, follow: false },
};

const cookies = [
  { name: "bach-cookie-consent", type: "Nødvendig", purpose: "Husker dit cookie-valg (localStorage)" },
  { name: "Google Analytics (_ga, _ga_*)", type: "Statistik", purpose: "Anonymiseret besøgsstatistik — kun ved samtykke" },
  { name: "Calendly cookies", type: "Funktionel", purpose: "Sættes når kalenderen indlæses — først ved aktiv brug af booking" },
];

export default function CookiePage() {
  return (
    <>
      <Nav />
      <main className="bg-cream-50 pt-32 pb-20">
        <Container className="max-w-3xl">
          <h1 className="font-serif text-display-md mb-2">Cookiepolitik</h1>
          <p className="text-warm-gray text-sm mb-12">Sidst opdateret: maj 2026</p>

          <div className="space-y-10 text-charcoal/75 leading-relaxed text-sm">
            <section>
              <h2 className="font-serif text-xl text-charcoal-dark mb-4">Hvad er cookies?</h2>
              <p>
                Cookies er små tekstfiler der gemmes på din enhed når du besøger en hjemmeside.
                De bruges til at huske dine præferencer og forbedre din oplevelse.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-charcoal-dark mb-4">Hvilke cookies bruger vi?</h2>
              <div className="overflow-x-auto rounded-lg border border-warm-light/70">
                <table className="w-full text-sm">
                  <thead className="bg-cream-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Navn</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Type</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Formål</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookies.map((c) => (
                      <tr key={c.name} className="border-t border-warm-light/60">
                        <td className="p-3 font-medium text-charcoal">{c.name}</td>
                        <td className="p-3">{c.type}</td>
                        <td className="p-3 text-charcoal/65">{c.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl text-charcoal-dark mb-4">Slet eller afvis cookies</h2>
              <p>
                Du kan til enhver tid slette cookies i din browsers indstillinger.
                Du kan også ændre dit valg ved at slette cookien <code className="px-1.5 py-0.5 rounded bg-charcoal/10">bach-cookie-consent</code> i din browser — så vises banneret igen.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl text-charcoal-dark mb-4">Kontakt</h2>
              <p>
                Spørgsmål? Skriv til <a href={`mailto:${company.email}`} className="text-brand-500 underline">{company.email}</a>.
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
