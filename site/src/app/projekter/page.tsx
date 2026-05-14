import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { ContactCta } from "@/components/sections/ContactCta";

export const metadata: Metadata = {
  title: "Projekter",
  description:
    "Udvalgte projekter — fra hotelrenoveringer til børnehaver og industri. Se hvad Malerfirmaet Bach har skabt i København og på Sjælland.",
};

export default function ProjekterPage() {
  return (
    <>
      <Nav />
      <main>
        <PageHeader
          eyebrow="Vores arbejde"
          title="Vores projekter"
          subtitle="Fra hotelrenoveringer til børnehaver — se resultater fra vores seneste opgaver i København og på Sjælland."
          breadcrumbs={[
            { label: "Forside", href: "/" },
            { label: "Projekter" },
          ]}
        />
        <section className="py-20 bg-cream-200">
          <Container>
            <ProjectsGrid />
          </Container>
        </section>
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
