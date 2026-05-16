import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Privatlivspolitik",
  description:
    "Sådan behandler Malerfirmaet Bach ApS dine personoplysninger. Komplet GDPR-konform information om dataansvarlig, formål, retsgrundlag, databehandlere, opbevaring og dine rettigheder.",
  robots: { index: true, follow: false },
};

const LAST_UPDATED = "16. maj 2026";
const VERSION = "2.0";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="bg-cream-50 pt-32 pb-20">
        <Container className="max-w-3xl">
          <h1 className="font-serif text-display-md mb-2">Privatlivspolitik</h1>
          <p className="text-warm-gray text-sm mb-12">
            Version {VERSION} · sidst opdateret {LAST_UPDATED}
          </p>

          <article className="space-y-10 text-charcoal/80 leading-relaxed">
            <Section title="1. Indledning">
              <p>
                Denne privatlivspolitik beskriver, hvordan {company.name} (&quot;vi&quot;,
                &quot;os&quot; eller &quot;virksomheden&quot;) behandler personoplysninger
                om dig, når du besøger malerfirmaetbach.dk, kontakter os via vores
                formularer, modtager opkald fra vores AI-assistent Sofia, eller på
                anden måde interagerer med vores tjenester.
              </p>
              <p className="mt-3">
                Vi tager dit privatliv alvorligt og behandler dine oplysninger i
                overensstemmelse med EU&apos;s databeskyttelsesforordning
                (GDPR — forordning 2016/679) og den danske databeskyttelseslov.
              </p>
            </Section>

            <Section title="2. Dataansvarlig">
              <p>
                Den dataansvarlige for behandlingen af dine personoplysninger er:
              </p>
              <div className="mt-3 bg-cream-200 rounded-lg p-5 not-italic">
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
                  <br />
                  Telefon:{" "}
                  <a
                    href={`tel:${company.phoneE164}`}
                    className="text-brand-500 underline"
                  >
                    {company.phone}
                  </a>
                </p>
              </div>
              <p className="text-sm mt-3 text-charcoal/65">
                Henvendelser om behandling af personoplysninger skal sendes til
                ovenstående e-mail og besvares som udgangspunkt inden for 14 dage.
              </p>
            </Section>

            <Section title="3. Hvilke personoplysninger indsamler vi?">
              <p>Vi indsamler følgende kategorier af personoplysninger:</p>

              <h3 className="font-semibold text-charcoal-dark mt-5 mb-2">
                3.1 Identifikations- og kontaktoplysninger
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Fulde navn</li>
                <li>Telefonnummer</li>
                <li>E-mailadresse</li>
                <li>Adresse på opgaven (vejnavn, postnummer, by)</li>
              </ul>

              <h3 className="font-semibold text-charcoal-dark mt-5 mb-2">
                3.2 Opgaveoplysninger
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Beskrivelse af maleropgaven</li>
                <li>Type af opgave (indvendig/udvendig, erhverv/privat osv.)</li>
                <li>Op til 10 billeder af opgaven (maks. 20 MB samlet) i formaterne JPG, PNG, HEIC eller HEIF</li>
                <li>Foretrukne tidspunkter for besigtigelse</li>
                <li>Eventuelle særlige ønsker eller bemærkninger</li>
              </ul>

              <h3 className="font-semibold text-charcoal-dark mt-5 mb-2">
                3.3 Lydoptagelser
              </h3>
              <p>
                Når du anvender vores &quot;Ring mig op&quot;-funktion, og giver dit
                eksplicitte samtykke hertil, kan samtalen med vores AI-assistent
                Sofia optages og transskriberes til kvalitetssikring og forbedring
                af vores service.
              </p>

              <h3 className="font-semibold text-charcoal-dark mt-5 mb-2">
                3.4 Tekniske oplysninger
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>IP-adresse (anonymiseret i Google Analytics 4)</li>
                <li>Browsertype og -version, operativsystem</li>
                <li>Henvisende URL og besøgte sider</li>
                <li>Tidsstempel for besøg</li>
                <li>Token fra Cloudflare Turnstile (botbeskyttelse — ingen personlig identifikation)</li>
              </ul>

              <h3 className="font-semibold text-charcoal-dark mt-5 mb-2">
                3.5 Aflysningsdata
              </h3>
              <p>
                Hvis du aflyser en besigtigelse via aflysningslinket i vores
                bekræftelsesmail, kan vi modtage en valgfri begrundelse, som du
                selv vælger at skrive.
              </p>

              <p className="mt-5">
                Vi indsamler <strong>ikke</strong> følsomme personoplysninger
                (helbredsoplysninger, etnisk oprindelse, politiske holdninger
                m.v.), og vi opfordrer dig til ikke at oplyse sådanne
                informationer i vores formularer.
              </p>
            </Section>

            <Section title="4. Formål og retsgrundlag">
              <p>
                Vi behandler dine personoplysninger til følgende formål med følgende
                retsgrundlag i GDPR artikel 6, stk. 1:
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-cream-200 border-b border-warm-light">
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Formål</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Retsgrundlag</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 align-top">Besvare henvendelser og udarbejde tilbud</td>
                      <td className="p-3 align-top">Art. 6(1)(b) — foranstaltninger forud for indgåelse af kontrakt</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 align-top">Planlægge og gennemføre besigtigelser</td>
                      <td className="p-3 align-top">Art. 6(1)(b) — kontraktopfyldelse</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 align-top">Sende bekræftelser og påmindelser via e-mail</td>
                      <td className="p-3 align-top">Art. 6(1)(b) — kontraktopfyldelse</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 align-top">Optage og transskribere AI-opkald</td>
                      <td className="p-3 align-top">Art. 6(1)(a) — samtykke (afgives på &quot;Ring mig op&quot;-formularen)</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 align-top">Statistik via Google Analytics 4</td>
                      <td className="p-3 align-top">Art. 6(1)(a) — samtykke (afgives via cookie-banner)</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 align-top">Botbeskyttelse og sikkerhed</td>
                      <td className="p-3 align-top">Art. 6(1)(f) — vores legitime interesse i at forhindre misbrug</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3 align-top">Bogføring og overholdelse af skatteforpligtelser</td>
                      <td className="p-3 align-top">Art. 6(1)(c) — retlig forpligtelse (bogføringsloven)</td>
                    </tr>
                    <tr>
                      <td className="p-3 align-top">Fejlovervågning af hjemmesiden</td>
                      <td className="p-3 align-top">Art. 6(1)(f) — legitim interesse i drift af tjenesten</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="5. Databehandlere og modtagere">
              <p>
                Vi anvender følgende databehandlere til at levere vores tjeneste.
                Med alle parter er der indgået databehandleraftaler i henhold til
                GDPR artikel 28, og der er foretaget overførselsvurderinger for
                modtagere uden for EU/EØS:
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-cream-200 border-b border-warm-light">
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Leverandør</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Formål</th>
                      <th className="text-left p-3 font-semibold text-charcoal-dark">Lokation</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Vercel Inc.</strong></td>
                      <td className="p-3">Hosting af hjemmeside og API</td>
                      <td className="p-3">EU (Frankfurt)</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Cloudflare, Inc.</strong></td>
                      <td className="p-3">Turnstile-botbeskyttelse på formularer</td>
                      <td className="p-3">USA · SCC + DPF</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Resend Inc.</strong></td>
                      <td className="p-3">Udsendelse af transaktionel e-mail (bekræftelser, notifikationer)</td>
                      <td className="p-3">EU (Dublin)</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Calendly LLC</strong></td>
                      <td className="p-3">Online booking af besigtigelser</td>
                      <td className="p-3">USA · SCC + DPF</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Retell AI Inc.</strong></td>
                      <td className="p-3">AI-stemme-agent (Sofia)</td>
                      <td className="p-3">EU (Frankfurt) + USA · SCC + DPF</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Twilio Inc.</strong></td>
                      <td className="p-3">Telefoniinfrastruktur til AI-opkald (+45 91 30 95 35)</td>
                      <td className="p-3">USA · SCC + DPF</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Google LLC</strong></td>
                      <td className="p-3">Google Workspace (Calendar, Drive, Gmail), Analytics 4, Search Console</td>
                      <td className="p-3">EU + USA · SCC + DPF</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Functional Software Inc. (Sentry)</strong></td>
                      <td className="p-3">Fejlovervågning af hjemmesiden</td>
                      <td className="p-3">EU (Frankfurt)</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Vercel Analytics</strong></td>
                      <td className="p-3">Anonym besøgsstatistik (uden cookies)</td>
                      <td className="p-3">EU</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Better Stack Inc.</strong></td>
                      <td className="p-3">Oppetids-overvågning (Better Uptime)</td>
                      <td className="p-3">EU</td>
                    </tr>
                    <tr className="border-b border-warm-light/60">
                      <td className="p-3"><strong>Make AG</strong></td>
                      <td className="p-3">Workflowautomatisering (når aktiveret)</td>
                      <td className="p-3">EU (Prag)</td>
                    </tr>
                    <tr>
                      <td className="p-3"><strong>One.com A/S</strong></td>
                      <td className="p-3">Domænehåndtering for malerfirmaetbach.dk</td>
                      <td className="p-3">EU (Danmark)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4">
                <strong>Overførsel til tredjelande:</strong> Når personoplysninger
                overføres til lande uden for EU/EØS (primært USA), sker det på
                grundlag af EU-Kommissionens standardkontraktbestemmelser
                (SCC — Standard Contractual Clauses) eller, hvor relevant, EU-US
                Data Privacy Framework (DPF). Vi har vurderet at modtagerne
                opretholder et passende beskyttelsesniveau.
              </p>

              <p className="mt-4">
                Vi videregiver ikke dine personoplysninger til tredjeparter for
                markedsføringsformål.
              </p>
            </Section>

            <Section title="6. Opbevaringsperioder">
              <p>
                Vi opbevarer dine personoplysninger så længe det er nødvendigt for
                de formål, de blev indsamlet til:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>
                  <strong>Lead-data (henvendelser uden indgået aftale):</strong> op
                  til 6 måneder efter seneste kontakt, hvorefter de slettes eller
                  anonymiseres.
                </li>
                <li>
                  <strong>Kundedata (med indgået aftale):</strong> op til 3 år
                  efter projektets afslutning, så vi kan håndtere reklamation,
                  garanti og gentagne henvendelser.
                </li>
                <li>
                  <strong>Bogføringsmateriale:</strong> 5 år fra udløbet af det
                  regnskabsår, materialet vedrører, jf. bogføringsloven § 12.
                </li>
                <li>
                  <strong>Lydoptagelser af AI-samtaler:</strong> slettes automatisk
                  efter 90 dage. Transskriptioner kan opbevares længere som del
                  af lead-historikken (op til 6 måneder).
                </li>
                <li>
                  <strong>Billeder uploaded i kontaktformular:</strong> opbevares
                  i den sagsmappe i Google Drive der oprettes pr. henvendelse.
                  Sagen slettes sammen med øvrige lead-data efter ovenstående
                  perioder.
                </li>
                <li>
                  <strong>Statistik-data (Google Analytics):</strong> 14 måneder
                  (standardperiode), aggregeret data er anonymt og opbevares ikke
                  som personoplysninger.
                </li>
                <li>
                  <strong>Cookie-samtykke (localStorage):</strong> 12 måneder fra
                  afgivelse, hvorefter du bliver bedt om at forny dit valg.
                </li>
              </ul>
            </Section>

            <Section title="7. Dine rettigheder">
              <p>
                Du har følgende rettigheder i medfør af GDPR artikel 15–22:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>
                  <strong>Ret til indsigt (art. 15):</strong> Du kan få oplyst
                  hvilke personoplysninger vi behandler om dig.
                </li>
                <li>
                  <strong>Ret til berigtigelse (art. 16):</strong> Du kan få
                  rettet urigtige eller ufuldstændige oplysninger.
                </li>
                <li>
                  <strong>Ret til sletning (art. 17):</strong> Du kan kræve
                  oplysninger slettet, medmindre opbevaring er nødvendig for
                  retskrav eller en retlig forpligtelse.
                </li>
                <li>
                  <strong>Ret til begrænsning (art. 18):</strong> Du kan kræve
                  behandlingen begrænset, fx under tvist om datas korrekthed.
                </li>
                <li>
                  <strong>Ret til dataportabilitet (art. 20):</strong> Du kan få
                  udleveret dine oplysninger i et struktureret, almindeligt
                  anvendt og maskinlæsbart format.
                </li>
                <li>
                  <strong>Ret til indsigelse (art. 21):</strong> Du kan gøre
                  indsigelse mod behandling baseret på vores legitime interesse.
                </li>
                <li>
                  <strong>Ret til at trække samtykke tilbage (art. 7):</strong> Du
                  kan til enhver tid trække et samtykke tilbage. Det påvirker ikke
                  lovligheden af behandlinger udført før tilbagetrækningen.
                </li>
              </ul>
              <p className="mt-4">
                For at udøve dine rettigheder, kontakt os på{" "}
                <a
                  href={`mailto:${company.email}`}
                  className="text-brand-500 underline"
                >
                  {company.email}
                </a>
                . Vi besvarer henvendelser inden for én måned i overensstemmelse
                med GDPR artikel 12.
              </p>
              <p className="mt-3">
                Du har også ret til at klage til{" "}
                <a
                  href="https://www.datatilsynet.dk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-500 underline"
                >
                  Datatilsynet
                </a>{" "}
                (Carl Jacobsens Vej 35, 2500 Valby, telefon 33 19 32 00).
              </p>
            </Section>

            <Section title="8. Sikkerhed">
              <p>
                Vi har implementeret passende tekniske og organisatoriske
                foranstaltninger for at beskytte dine personoplysninger mod
                hændelig eller ulovlig sletning, tab, ændring, uautoriseret
                udbredelse og adgang, herunder:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-3">
                <li>TLS-kryptering (HTTPS) på al kommunikation</li>
                <li>Sikkerhedsheaders (CSP, HSTS, X-Frame-Options m.fl.)</li>
                <li>Rate-limiting på formularer for at forhindre misbrug</li>
                <li>Cloudflare Turnstile-botbeskyttelse</li>
                <li>HMAC-signerede aflysningslinks (kan ikke forfalskes)</li>
                <li>Kryptering af miljøvariabler og hemmeligheder</li>
                <li>Adgangskontrol med Google Workspace + service-konto med mindste nødvendige rettigheder</li>
                <li>Automatisk overvågning af afhængigheder for sikkerhedssårbarheder (Dependabot)</li>
                <li>Sentry-fejlovervågning med PII-redaktion før transmission</li>
                <li>RFC 9116 security.txt for ansvarlig sikkerhedsforskning</li>
              </ul>
              <p className="mt-3">
                I tilfælde af et sikkerhedsbrud, der medfører en risiko for dine
                rettigheder og frihedsrettigheder, vil vi underrette Datatilsynet
                inden for 72 timer og — hvis det er nødvendigt — også underrette
                dig direkte.
              </p>
            </Section>

            <Section title="9. Børns persondata">
              <p>
                Vores tjenester er rettet mod voksne. Vi indsamler ikke bevidst
                personoplysninger om personer under 16 år. Hvis du er forælder
                eller værge og bliver opmærksom på, at dit barn har afgivet
                oplysninger til os, bedes du kontakte os, så vi kan slette dem.
              </p>
            </Section>

            <Section title="10. Automatiserede afgørelser og profilering">
              <p>
                Vores AI-assistent Sofia foretager <strong>ikke</strong>{" "}
                automatiserede afgørelser med retsvirkning over for dig i henhold
                til GDPR artikel 22. Sofia er udelukkende et samtale-værktøj til
                booking af besigtigelse — selve tilbuddet og aftaleindgåelsen
                varetages af en fysisk person (malermester Adam Bach).
              </p>
            </Section>

            <Section title="11. Cookies">
              <p>
                Vores brug af cookies og lignende teknologier er beskrevet i vores{" "}
                <Link href="/cookiepolitik" className="text-brand-500 underline">
                  cookiepolitik
                </Link>
                .
              </p>
            </Section>

            <Section title="12. Ændringer af politikken">
              <p>
                Vi kan ændre denne privatlivspolitik for at afspejle ændringer i
                vores praksis eller retskrav. Den seneste version vil altid være
                tilgængelig på malerfirmaetbach.dk/privatlivspolitik. Væsentlige
                ændringer kommunikeres til kunder med aktive aftaler via e-mail.
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
