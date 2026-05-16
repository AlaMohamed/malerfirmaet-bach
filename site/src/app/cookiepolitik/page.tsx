import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Cookiepolitik",
  description:
    "Sådan bruger Malerfirmaet Bach ApS cookies og lignende teknologier på malerfirmaetbach.dk. Komplet oversigt over kategorier, formål, leverandører, varighed og dit samtykke.",
  robots: { index: true, follow: false },
};

const LAST_UPDATED = "16. maj 2026";
const VERSION = "2.0";

export default function CookiePage() {
  return (
    <>
      <Nav />
      <main className="bg-cream-50 pt-32 pb-20">
        <Container className="max-w-3xl">
          <h1 className="font-serif text-display-md mb-2">Cookiepolitik</h1>
          <p className="text-warm-gray text-sm mb-12">
            Version {VERSION} · sidst opdateret {LAST_UPDATED}
          </p>

          <article className="space-y-10 text-charcoal/80 leading-relaxed">
            <Section title="1. Indledning">
              <p>
                Denne cookiepolitik beskriver, hvordan {company.name} (&quot;vi&quot;,
                &quot;os&quot; eller &quot;virksomheden&quot;) anvender cookies og
                lignende teknologier på malerfirmaetbach.dk. Politikken er et
                supplement til vores{" "}
                <Link href="/privatlivspolitik" className="text-brand-500 underline">
                  privatlivspolitik
                </Link>
                , som beskriver den øvrige behandling af personoplysninger.
              </p>
              <p className="mt-3">
                Brugen af cookies er reguleret af cookiebekendtgørelsen
                (bekendtgørelse nr. 1148 af 9. december 2011) samt EU&apos;s
                databeskyttelsesforordning (GDPR — forordning 2016/679), når
                cookien indebærer behandling af personoplysninger.
              </p>
            </Section>

            <Section title="2. Hvad er cookies?">
              <p>
                En cookie er en lille tekstfil, der gemmes på din enhed (computer,
                tablet eller mobil), når du besøger en hjemmeside. Cookies kan
                ikke indeholde virus eller skadelige programmer og kan ikke i sig
                selv identificere dig som person — men de kan indeholde
                informationer, der sammenholdt med andre data udgør
                personoplysninger.
              </p>
              <p className="mt-3">
                Vi anvender også beslægtede teknologier såsom{" "}
                <strong>localStorage</strong> (et lokalt lager i din browser, der
                fungerer som en cookie men ikke sendes til serveren med hver
                forespørgsel). I denne politik bruger vi for enkelthedens skyld
                udtrykket &quot;cookies&quot; om begge dele.
              </p>
            </Section>

            <Section title="3. Vores princip om dataminimering">
              <p>
                Vi anvender så få cookies som muligt og indhenter dit samtykke,
                inden vi sætter cookies, der ikke er strengt nødvendige for at
                levere den tjeneste, du har anmodet om. Vores løsning er bygget
                med privacy by design — vi anvender hverken reklame-cookies,
                tracking pixels, sociale medie-knapper med tracking eller andre
                tredjeparts marketingværktøjer.
              </p>
            </Section>

            <Section title="4. Kategorier af cookies vi anvender">
              <p>
                Cookies på malerfirmaetbach.dk inddeles i tre kategorier:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>
                  <strong>Strengt nødvendige cookies</strong> — påkrævet for
                  at hjemmesiden fungerer (samtykkeregistrering, botbeskyttelse).
                  Disse sættes uden samtykke jf. cookiebekendtgørelsens § 3, stk. 2.
                </li>
                <li>
                  <strong>Statistik-cookies</strong> — hjælper os med at forstå,
                  hvordan besøgende anvender hjemmesiden, så vi kan forbedre
                  brugeroplevelsen. Sættes kun ved aktivt samtykke.
                </li>
                <li>
                  <strong>Funktionelle tredjepartscookies</strong> — sættes kun,
                  hvis du aktivt interagerer med et indlejret tredjepartsværktøj
                  (fx Calendly-bookingvælger).
                </li>
              </ul>
              <p className="mt-4">
                Vi anvender <strong>ingen</strong> markedsførings-, reklame- eller
                profileringscookies.
              </p>
            </Section>

            <Section title="5. Oversigt over cookies">
              <h3 className="font-semibold text-charcoal-dark mt-2 mb-3">
                5.1 Strengt nødvendige
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-cream-200 border-b border-warm-light">
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Navn</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Leverandør</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Formål</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Varighed</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 font-mono text-xs">bach-cookie-consent</td>
                      <td className="p-3">Malerfirmaet Bach (1.-part, localStorage)</td>
                      <td className="p-3">Husker dit valg fra cookie-banneret, så du ikke spørges igen ved hvert besøg</td>
                      <td className="p-3">12 måneder</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 font-mono text-xs">cf_clearance</td>
                      <td className="p-3">Cloudflare (3.-part)</td>
                      <td className="p-3">Bekræfter at en bestået bot-udfordring (Cloudflare Turnstile) ikke skal gentages, så formularer kan indsendes</td>
                      <td className="p-3">30 minutter – 1 år</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">__cf_bm</td>
                      <td className="p-3">Cloudflare (3.-part)</td>
                      <td className="p-3">Bot Management — adskiller mennesker fra automatiserede besøg på serverniveau</td>
                      <td className="p-3">30 minutter</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-semibold text-charcoal-dark mt-6 mb-3">
                5.2 Statistik (sættes kun ved samtykke)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-cream-200 border-b border-warm-light">
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Navn</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Leverandør</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Formål</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Varighed</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 font-mono text-xs">_ga</td>
                      <td className="p-3">Google Analytics 4 (3.-part)</td>
                      <td className="p-3">Tildeler en anonym ID til besøgende og opretholder session</td>
                      <td className="p-3">2 år</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 font-mono text-xs">_ga_&lt;ID&gt;</td>
                      <td className="p-3">Google Analytics 4 (3.-part)</td>
                      <td className="p-3">Måler engagement og besøgsmønstre for vores property</td>
                      <td className="p-3">2 år</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">_gid</td>
                      <td className="p-3">Google Analytics 4 (3.-part)</td>
                      <td className="p-3">Skelner unikke besøgende pr. 24 timer</td>
                      <td className="p-3">24 timer</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-charcoal/60 mt-3">
                IP-anonymisering er aktiveret (<code className="px-1 py-0.5 rounded bg-charcoal/8">anonymize_ip: true</code>),
                så Google trunkerer den sidste oktet af din IP-adresse inden
                lagring. Vi har deaktiveret reklame-personalisering.
              </p>

              <h3 className="font-semibold text-charcoal-dark mt-6 mb-3">
                5.3 Funktionelle (sættes ved aktiv brug)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-cream-200 border-b border-warm-light">
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Navn</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Leverandør</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Formål</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Varighed</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr>
                      <td className="p-3 font-mono text-xs">_calendly_session m.fl.</td>
                      <td className="p-3">Calendly (3.-part)</td>
                      <td className="p-3">Bevarer din booking-tilstand under tidsvalg på /book-besigtigelse. Sættes først, når du åbner booking-vælgeren.</td>
                      <td className="p-3">Session – 21 dage</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-semibold text-charcoal-dark mt-6 mb-3">
                5.4 Cookieløs måling
              </h3>
              <p>
                Vercel Analytics anvendes til aggregeret sidevisningsstatistik
                <strong> uden cookies eller persistent ID</strong>. Tjenesten
                kræver derfor ikke samtykke under cookiebekendtgørelsen.
              </p>
            </Section>

            <Section title="6. Retsgrundlag">
              <p>
                Vores brug af cookies har følgende retsgrundlag:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>
                  <strong>Strengt nødvendige cookies:</strong> Sættes uden samtykke
                  i medfør af cookiebekendtgørelsens § 3, stk. 2, da de er
                  nødvendige for at levere den tjeneste, du anmoder om
                  (formularindsendelse, samtykkeregistrering).
                </li>
                <li>
                  <strong>Statistik-cookies:</strong> Sættes kun efter dit aktive
                  samtykke jf. cookiebekendtgørelsens § 3, stk. 1 og GDPR
                  artikel 6, stk. 1, litra a.
                </li>
                <li>
                  <strong>Funktionelle tredjepartscookies:</strong> Sættes kun,
                  hvis du aktivt vælger at anvende det pågældende værktøj
                  (samtykke ved adfærd, GDPR art. 6, stk. 1, litra a).
                </li>
              </ul>
            </Section>

            <Section title="7. Sådan administrerer du dit samtykke">
              <p>
                Når du besøger hjemmesiden første gang, vises et samtykkebanner,
                hvor du kan vælge mellem:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>
                  <strong>&quot;Accepter alle&quot;</strong> — aktiverer statistik-cookies
                  (Google Analytics 4) ud over de strengt nødvendige.
                </li>
                <li>
                  <strong>&quot;Kun nødvendige&quot;</strong> — kun strengt nødvendige
                  cookies sættes; ingen statistik indsamles.
                </li>
              </ul>
              <p className="mt-4">
                Dit valg gemmes i <code className="px-1.5 py-0.5 rounded bg-charcoal/8">bach-cookie-consent</code>{" "}
                i din browsers localStorage i 12 måneder. Herefter spørges du igen.
              </p>

              <h3 className="font-semibold text-charcoal-dark mt-5 mb-2">
                Trække samtykke tilbage
              </h3>
              <p>
                Du kan til enhver tid trække dit samtykke tilbage eller ændre dit
                valg. Det gør du ved at:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 mt-3">
                <li>
                  Åbne din browsers udviklerværktøjer (typisk F12 eller højreklik → Inspicér).
                </li>
                <li>
                  Gå til fanen <strong>Application</strong> (Chrome/Edge) eller{" "}
                  <strong>Storage</strong> (Firefox/Safari).
                </li>
                <li>
                  Vælg <strong>Local Storage</strong> → malerfirmaetbach.dk.
                </li>
                <li>
                  Slet nøglen <code className="px-1.5 py-0.5 rounded bg-charcoal/8">bach-cookie-consent</code>.
                </li>
                <li>
                  Genindlæs siden — cookie-banneret vises igen, og du kan træffe et nyt valg.
                </li>
              </ol>
              <p className="mt-4">
                Du kan også slette alle cookies via din browsers indstillinger.
                Vejledninger findes hos browserudbyderen:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/da/kb/cookies-information-websites-store-on-your-computer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/da-dk/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 underline"
                  >
                    Apple Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/da-dk/microsoft-edge/slet-cookies-i-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>

              <p className="mt-4 text-xs text-charcoal/60">
                Bemærk at sletning af alle cookies vil betyde, at samtykkebanneret
                vises igen ved næste besøg, og at funktioner som botbeskyttelse
                kan kræve at du gennemfører en ny verifikation.
              </p>
            </Section>

            <Section title="8. Tredjelandeoverførsel">
              <p>
                Google Analytics og Cloudflare drives af amerikanske udbydere
                (Google LLC og Cloudflare, Inc.). Når statistikdata behandles,
                kan oplysninger blive overført til USA. Overførslen sker på
                grundlag af:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li>EU-Kommissionens standardkontraktbestemmelser (SCC)</li>
                <li>EU-US Data Privacy Framework (DPF)</li>
                <li>Supplerende tekniske foranstaltninger (IP-anonymisering)</li>
              </ul>
              <p className="mt-3">
                Calendly LLC er ligeledes baseret i USA og er omfattet af de samme
                overførselsgrundlag. Bookingdata behandles af Calendly på vegne
                af Malerfirmaet Bach ApS under en databehandleraftale jf. GDPR
                artikel 28.
              </p>
            </Section>

            <Section title="9. Cookies, der ikke længere sættes">
              <p>
                Vi gennemgår med jævne mellemrum vores brug af cookies. Hvis vi
                ophører med at anvende en cookie, fjernes den fra denne oversigt
                ved næste opdatering. Cookies, der måtte ligge tilbage fra
                tidligere versioner af hjemmesiden, kan slettes manuelt via
                browseren (se punkt 7).
              </p>
            </Section>

            <Section title="10. Yderligere information og kontakt">
              <p>
                For yderligere oplysninger om vores behandling af
                personoplysninger, herunder dine rettigheder efter GDPR (indsigt,
                berigtigelse, sletning, dataportabilitet m.v.), henvises til
                vores{" "}
                <Link href="/privatlivspolitik" className="text-brand-500 underline">
                  privatlivspolitik
                </Link>
                .
              </p>
              <p className="mt-3">
                Spørgsmål til denne cookiepolitik kan rettes til:
              </p>
              <div className="mt-3 bg-cream-200 rounded-lg p-5">
                <p className="font-semibold text-charcoal-dark">{company.name}</p>
                <p className="text-sm mt-1">
                  CVR-nr.: {company.cvrFormatted}<br />
                  {company.address.street}<br />
                  {company.address.postal} {company.address.city}<br />
                  Danmark
                </p>
                <p className="text-sm mt-3">
                  E-mail:{" "}
                  <a
                    href={`mailto:${company.email}`}
                    className="text-brand-500 underline"
                  >
                    {company.email}
                  </a>
                </p>
              </div>
              <p className="text-sm mt-4">
                Du kan også klage til{" "}
                <a
                  href="https://www.datatilsynet.dk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-500 underline"
                >
                  Datatilsynet
                </a>
                , hvis du mener, at vores behandling af personoplysninger ikke
                overholder GDPR.
              </p>
            </Section>

            <Section title="11. Ændringer af cookiepolitikken">
              <p>
                Vi kan ændre denne cookiepolitik for at afspejle ændringer i vores
                praksis eller retskrav. Den seneste version vil altid være
                tilgængelig på{" "}
                <Link href="/cookiepolitik" className="text-brand-500 underline">
                  malerfirmaetbach.dk/cookiepolitik
                </Link>
                . Ved væsentlige ændringer i kategorier eller leverandører vil vi
                bede dig om nyt samtykke via banneret.
              </p>
              <p className="mt-3 text-sm text-charcoal/60">
                Denne version: {VERSION} — {LAST_UPDATED}
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
