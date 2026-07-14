import { HeroSection } from '@/components/hero';
import { FeatureSection } from '@/components/feature-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { FaqsSection } from '@/components/faqs-section';
import { CtaSection } from '@/components/cta-section';

export default function Home() {
  return (
    <main className="relative">
      <HeroSection />
      <FeatureSection />
      <TestimonialsSection />
      <FaqsSection />
      <CtaSection />
    </main>
  );
}
