import { Suspense } from "react";
import type { Metadata } from "next";
import { verifyCancelToken } from "@/lib/cancel-token";
import { getBooking } from "@/lib/google-calendar";
import { formatHumanDateTime } from "@/lib/dk-date";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { CancelConfirmButton } from "./CancelConfirmButton";
import { AlertCircle, CalendarX2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Aflys besigtigelse",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface SearchParams {
  searchParams: { token?: string };
}

export default async function AflysPage({ searchParams }: SearchParams) {
  const token = searchParams?.token ?? "";
  const payload = token ? verifyCancelToken(token) : null;

  if (!payload) {
    return (
      <>
        <Nav />
        <main className="min-h-[70vh] bg-cream-200 pt-40 pb-20">
          <Container className="max-w-xl text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-50 grid place-items-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" aria-hidden />
            </div>
            <h1 className="font-serif text-display-md mb-3">Linket virker ikke</h1>
            <p className="text-charcoal/65 leading-relaxed">
              Aflysnings-linket er ugyldigt eller udløbet. Hvis du har brug for at flytte din besigtigelse,
              ring venligst direkte til Adam — så finder vi en ny tid.
            </p>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  // Try to fetch booking details. If gone (already cancelled), show friendly fallback.
  let booking;
  try {
    booking = await getBooking(payload.eventId);
  } catch {
    booking = null;
  }

  if (!booking || booking.status === "cancelled") {
    return (
      <>
        <Nav />
        <main className="min-h-[70vh] bg-cream-200 pt-40 pb-20">
          <Container className="max-w-xl text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-brand-50 grid place-items-center mb-6">
              <CalendarX2 className="h-8 w-8 text-brand-500" aria-hidden />
            </div>
            <h1 className="font-serif text-display-md mb-3">Allerede aflyst</h1>
            <p className="text-charcoal/65 leading-relaxed">
              Denne besigtigelse er allerede aflyst eller findes ikke længere. Hvis du vil booke en ny tid kan du gøre det på
              {" "}<a href="/book-besigtigelse" className="underline text-brand-500">/book-besigtigelse</a>.
            </p>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const when = booking.start?.dateTime ? formatHumanDateTime(booking.start.dateTime) : "—";
  const address = booking.location ?? "—";

  return (
    <>
      <Nav />
      <main className="min-h-[70vh] bg-cream-200 pt-40 pb-20">
        <Container className="max-w-xl">
          <h1 className="font-serif text-display-md mb-3">Aflys besigtigelse</h1>
          <p className="text-charcoal/70 leading-relaxed mb-8">
            Bekræft venligst at du vil aflyse denne besigtigelse. Du kan altid booke en ny tid bagefter.
          </p>

          <div className="bg-cream-50 rounded-xl border border-warm-light p-6 mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-1">Tidspunkt</p>
            <p className="font-serif text-lg text-charcoal-dark mb-4">{when}</p>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray mb-1">Adresse</p>
            <p className="text-sm text-charcoal mb-0">{address}</p>
          </div>

          <Suspense>
            <CancelConfirmButton token={token} />
          </Suspense>

          <p className="mt-6 text-xs text-charcoal/55">
            Foretrækker du at ringe? Du kan altid kontakte Adam direkte — vi kan flytte eller aflyse over telefon.
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
