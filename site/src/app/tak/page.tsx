import type { Metadata } from "next";
import { CheckCircle2, Phone, ArrowLeft } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Tak for din henvendelse",
  robots: { index: false, follow: true },
};

export default function TakPage() {
  return (
    <>
      <Nav />
      <main className="min-h-[80vh] bg-cream-200 grid place-items-center py-32">
        <Container className="max-w-2xl text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-brand-50 grid place-items-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-brand-500" aria-hidden />
          </div>
          <h1 className="font-serif text-display-md text-balance">Tak for din henvendelse</h1>
          <p className="mt-5 text-charcoal/70 leading-relaxed text-pretty">
            Vi har modtaget din forespørgsel og vender tilbage hurtigst muligt — typisk inden for 24 timer på hverdage.
          </p>

          <div className="mt-10 bg-cream-50 rounded-2xl border border-warm-light/70 p-7 text-left">
            <p className="text-sm font-semibold text-charcoal-dark mb-4">Hvad sker der nu?</p>
            <ol className="space-y-3">
              {[
                "Vi gennemgår din forespørgsel og kontakter dig for eventuelle spørgsmål.",
                "Vi aftaler et besigtigelsestidspunkt, der passer dig.",
                "Du modtager et skriftligt tilbud inden for 1–2 hverdage efter besigtigelsen.",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-400 text-white text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-charcoal/70 text-sm leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/" variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Tilbage til forsiden
            </Button>
            <Button href={`tel:${company.phoneE164}`} variant="outline">
              <Phone className="h-4 w-4" aria-hidden />
              Ring {company.phone}
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
