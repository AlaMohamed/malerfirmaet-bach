import { Home, Search } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="min-h-[70vh] grid place-items-center bg-cream-200 pt-32 pb-20">
        <Container className="max-w-xl text-center">
          <p className="font-serif text-7xl text-brand-400 italic">404</p>
          <h1 className="font-serif text-display-md mt-4 mb-3">Siden findes ikke</h1>
          <p className="text-charcoal/65 leading-relaxed mb-10">
            Vi kunne ikke finde det du leder efter. Måske er linket flyttet, eller du har skrevet adressen forkert.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/" variant="secondary">
              <Home className="h-4 w-4" aria-hidden />
              Forsiden
            </Button>
            <Button href="/projekter" variant="outline">
              <Search className="h-4 w-4" aria-hidden />
              Se projekter
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
