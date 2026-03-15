'use client';

import Navigation from '@/components/Navigation';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';

export default function PricingPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 pt-40">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-syne text-5xl sm:text-7xl lg:text-[120px] font-[800] text-white leading-tight mb-8 uppercase tracking-tighter">
            System <span className="text-green">Scaling</span>
          </h1>
          <p className="font-dm-mono text-[14px] text-white/40 max-w-2xl mx-auto mb-12 uppercase tracking-widest font-black">
             Direct access to the ORCA Tiered Infrastructure. Choose your deployment scale.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      <Footer />
    </main>
  );
}
