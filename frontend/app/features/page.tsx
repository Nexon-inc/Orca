'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function FeaturesPage() {
  const heroRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Hero Animation
    animate('.feature-hero-text', {
      opacity: [0, 1],
      y: [30, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });

    // Cards Animation
    animate('.feature-card-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100, { start: 500 }),
      duration: 800,
      ease: 'outQuad'
    });
  }, []);

  const features = [
    {
      icon: '⬡',
      title: '6 AI Executives',
      description: 'Atlas · Aria · Rex · Purity · Roman · Ghost. Your complete C-suite, activated across 5 departments and ready to work in seconds.',
    },
    {
      icon: '⇄',
      title: 'Coordinated Handoffs',
      description: 'Agents communicate and hand off work across departments automatically. No siloed tools or manual bridging.',
    },
    {
      icon: '👁',
      title: 'Total Governance',
      description: 'You stay in control with 3 operating modes: Autopilot, Approve First, or Suggest Only. Your sign-off is final.',
    },
    {
      icon: '🔐',
      title: 'CyberGuard Built-in',
      description: 'Every bit of code generated is scanned for vulnerabilities and compliance automatically before deployment.',
    },
    {
      icon: '🧠',
      title: 'Nexonic Intuition',
      description: 'Leverage our behavioral truth-scoring for hiring and sourcing the top 0.1% of global talent through agents.',
    },
    {
      icon: '📈',
      title: 'Revenue Distribution',
      description: 'Track the direct dollar-impact of every agent action and see exactly how your AI workforce scales.',
    },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-bg text-text-body">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-bg pt-40">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="feature-hero-text opacity-0 font-syne text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8">
            Coordinated <span className="text-green">Capabilities</span>
          </h1>
          <p className="feature-hero-text opacity-0 font-dm-mono text-[16px] sm:text-[18px] text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            6 AI executives across 5 departments, working 24/7 to automate your entire business — fully coordinated.
          </p>
          <div className="feature-hero-text opacity-0">
            <button className="btn-primary px-10 py-4">
              Start Your Onboarding →
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-bg border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="feature-card-anim opacity-0 p-10 rounded-3xl border border-white/5 bg-surface/50 hover:bg-green-dim hover:border-green/20 transition-all duration-500 group card-clickable"
              >
                <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 origin-left inline-block">
                  {feature.icon}
                </div>
                <h3 className="font-syne text-2xl font-bold text-white mb-4 group-hover:text-green transition-colors">
                  {feature.title}
                </h3>
                <p className="font-dm-mono text-[14px] text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-surface/30">
        <div className="max-w-4xl mx-auto text-center p-12 sm:p-20 rounded-[3rem] border border-white/5 bg-surface/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 rotate-12 group-hover:opacity-10 transition-opacity">▣</div>
          <h2 className="font-syne text-3xl sm:text-5xl font-extrabold text-white mb-6 relative z-10">
            Ready to automate your company?
          </h2>
          <p className="font-dm-mono text-[15px] sm:text-[17px] text-text-muted mb-12 max-w-xl mx-auto relative z-10">
            Join hundreds of founders building their AI workforce today.
          </p>
          <button className="btn-primary px-12 py-5 relative z-10">
            Deploy Your Org Chart →
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
