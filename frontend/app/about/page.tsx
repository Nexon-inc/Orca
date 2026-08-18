'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AboutPage() {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (document.querySelectorAll('.about-hero-text').length > 0) {
        animate('.about-hero-text', {
          opacity: [0, 1],
          y: [30, 0],
          delay: stagger(100),
          duration: 1000,
          ease: 'outExpo'
        });
      }
      if (document.querySelectorAll('.about-block-anim').length > 0) {
        animate('.about-block-anim', {
          opacity: [0, 1],
          y: [20, 0],
          delay: stagger(150, { start: 500 }),
          duration: 800,
          ease: 'outQuad'
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-bg text-text-body">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-bg pt-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="about-hero-text opacity-0 font-syne text-5xl sm:text-7xl lg:text-[80px] font-black text-white leading-tight mb-8 uppercase tracking-tighter">
             The <span className="text-green">Nexonic</span> Vision
          </h1>
          <p className="about-hero-text opacity-0 font-dm-mono text-base sm:text-lg text-white/40 max-w-3xl mx-auto mb-12 leading-relaxed uppercase tracking-tighter font-black">
            We're building the operating system for the next generation of companies.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-4 bg-bg">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="about-block-anim opacity-0 p-10 sm:p-16 rounded-[3rem] border border-white/5 bg-surface/50 hover:bg-surface/70 transition-all duration-500 group">
            <h2 className="font-syne text-3xl font-[800] text-white mb-6 group-hover:text-green transition-colors uppercase tracking-tight">The Mission</h2>
            <div className="space-y-6 font-dm-mono text-[15px] sm:text-[17px] text-white/50 leading-relaxed uppercase tracking-tighter font-black">
              <p>
                Nexonic Industries builds AI infrastructure for founders. Not tools — systems. ORCA is our flagship coordination engine, designed to give solofounders the capabilities of a 40-person organization.
              </p>
              <p>
                Most founders are drowning in tool sprawl while being understaffed. We fixed that by building an integrated ecosystem where specialized agents communicate, coordinate, and execute at the scale of an entire company.
              </p>
            </div>
          </div>

          <div className="about-block-anim opacity-0 p-10 sm:p-16 rounded-[3rem] border border-white/5 bg-surface/50 hover:bg-surface/70 transition-all duration-500 group">
            <h2 className="font-syne text-3xl font-[800] text-white mb-6 group-hover:text-green transition-colors uppercase tracking-tight">Governance & Locality</h2>
            <p className="font-dm-mono text-[15px] sm:text-[17px] text-white/50 leading-relaxed uppercase tracking-tighter font-black">
              Headquartered in Nairobi, Kenya 🇰🇪, Nexonic Industries is engineering the future of autonomous work. From CyberGuard security to Render.AI creative production, every layer of our stack is built for sovereignty and foundational performance.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-surface/30">
        <div className="max-w-4xl mx-auto text-center p-12 sm:p-20 rounded-[3rem] border border-white/5 bg-surface/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 rotate-12 group-hover:opacity-10 transition-opacity">▣</div>
          <h2 className="font-syne text-3xl sm:text-5xl font-extrabold text-white mb-6 relative z-10">
            Join the AI revolution
          </h2>
          <p className="font-dm-mono text-[15px] sm:text-[17px] text-text-muted mb-12 max-w-xl mx-auto relative z-10">
            Be part of a new generation of founders building with ORCA.
          </p>
          <button className="btn-primary px-12 py-5 relative z-10">
             Get Started Today →
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
      }
