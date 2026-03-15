'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function FinalCTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateIn();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateIn = () => {
    animate('.cta-animate', {
      opacity: [0, 1],
      y: [30, 0],
      delay: stagger(150),
      duration: 1000,
      ease: 'outExpo'
    });
  };

  return (
    <section id="cta" ref={sectionRef} className="py-32 px-4 bg-bg relative overflow-hidden">
      {/* Background visual element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none opacity-5">
         <div className="w-full h-full bg-radial from-green/20 via-transparent to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <div ref={contentRef} className="flex flex-col items-center">
          <span className="cta-animate opacity-0 inline-block px-3 py-1.5 rounded-full border border-green/20 bg-green-dim text-green font-dm-mono text-[10px] uppercase tracking-widest mb-8">
            Build Better. Hire Smarter.
          </span>
          
          <h2 className="cta-animate opacity-0 font-syne text-4xl sm:text-5xl lg:text-7xl font-[800] text-white tracking-tight leading-[1.05] mb-8">
            Your competitors have teams. <br />
            <span className="text-green">You have ORCA.</span>
          </h2>

          <p className="cta-animate opacity-0 font-dm-mono text-text-muted text-[15px] sm:text-[17px] mb-12 max-w-2xl leading-relaxed">
            Stop being the bottleneck in your own company. Deploy your AI workforce today and reclaim your vision.
          </p>

          <div className="cta-animate opacity-0 flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <button className="btn-primary sm:px-12 sm:py-5 text-[16px]">
              Deploy Your Org Chart →
            </button>
            <button className="btn-secondary sm:px-12 sm:py-5 text-[16px]">
              Speak to Nexonic Industries
            </button>
          </div>

          <p className="cta-animate opacity-0 mt-8 font-dm-mono text-[11px] text-text-muted/60 uppercase tracking-widest">
            Early Access Pricing Ending Soon
          </p>
        </div>
      </div>
    </section>
  );
}
