'use client';

import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import EcosystemSection from '@/components/EcosystemSection';
import IntegrationsSection from '@/components/IntegrationsSection';
import CostSection from '@/components/CostSection';
import DepartmentsSection from '@/components/DepartmentsSection';
import OnboardingPreview from '@/components/OnboardingPreview';
import WhoItsForSection from '@/components/WhoItsForSection';

import PricingSection from '@/components/PricingSection';
import FinalCTASection from '@/components/FinalCTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-bg text-text-body">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <EcosystemSection />
      <IntegrationsSection />
      <CostSection />
      <DepartmentsSection />
      <OnboardingPreview />
      <WhoItsForSection />

      <PricingSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}

