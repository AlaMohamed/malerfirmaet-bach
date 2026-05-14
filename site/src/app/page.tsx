import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { ClientTicker } from "@/components/sections/ClientTicker";
import { Services } from "@/components/sections/Services";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";
import { Process } from "@/components/sections/Process";
import { WhyBach } from "@/components/sections/WhyBach";
import { Testimonial } from "@/components/sections/Testimonial";
import { Faq } from "@/components/sections/Faq";
import { ContactCta } from "@/components/sections/ContactCta";

export default function HomePage() {
  return (
    <>
      <Nav overlayMode />
      <main>
        <Hero />
        <ClientTicker />
        <Services />
        <ProjectsPreview />
        <Process />
        <WhyBach />
        <Testimonial />
        <Faq />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
