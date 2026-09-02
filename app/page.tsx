import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { FleetSection } from "@/components/site/fleet-section";
import { HowItWorks } from "@/components/site/how-it-works";
import { Differentials } from "@/components/site/differentials";
import { TestimonialsCarousel } from "@/components/site/testimonials-carousel";
import { Faq } from "@/components/site/faq";
import { ContactFooter } from "@/components/site/contact-footer";
import { WhatsappFloatButton } from "@/components/site/whatsapp-float-button";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export default async function HomePage() {
  const [vehicles, testimonials] = await Promise.all([
    prisma.vehicle.findMany({
      where: { showOnSite: true, status: { not: "INATIVO" } },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { dailyRate: "asc" },
    }),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);

  const siteVehicles = vehicles.map((v) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    category: v.category,
    imageUrl: v.images[0]?.url,
  }));

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ScrollReveal>
          <FleetSection vehicles={siteVehicles} />
        </ScrollReveal>
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>
        <ScrollReveal>
          <Differentials />
        </ScrollReveal>
        <ScrollReveal>
          <TestimonialsCarousel testimonials={testimonials} />
        </ScrollReveal>
        <ScrollReveal>
          <Faq />
        </ScrollReveal>
      </main>
      <ContactFooter />
      <WhatsappFloatButton />
    </>
  );
}
