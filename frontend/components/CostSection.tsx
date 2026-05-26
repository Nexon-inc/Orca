'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function CostSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateAcross();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateAcross = () => {
    animate('.cost-content-anim', {
      opacity: [0, 1],
      x: [-30, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });

    animate('.cost-card-anim', {
      opacity: [0, 1],
      x: [40, 0],
      scale: [0.98, 1],
      duration: 1200,
      ease: 'outExpo'
    });
  };

  return (
    <section ref={sectionRef} id="cost-section" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-bg overflow-hidden">
      {/* Background bioluminescence */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full bg-green filter blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Content */}
          <div className="flex flex-col gap-8 cost-content-anim opacity-0">
            <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-syne font-bold leading-[1.1] text-white tracking-tight">
              Scaling shouldn't mean <br />
              <span className="text-green">burning cash.</span>
            </h2>
            <p className="font-dm-mono text-[15px] text-text-muted leading-relaxed max-w-lg">
              The "Old Way" relies on endless hiring, management overhead, and human error. 
              The "ORCA Way" is lean, automated, and infinitely scalable.
            </p>
            
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center text-green shrink-0">
                  <span className="text-[20px]">📈</span>
                </div>
                <div>
                  <h4 className="font-syne font-bold text-white text-[16px]">92% Lower Overhead</h4>
                  <p className="font-dm-mono text-[12px] text-text-muted">Eliminate the middle-management layer entirely.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center text-green shrink-0">
                  <span className="text-[20px]">⚡</span>
                </div>
                <div>
                  <h4 className="font-syne font-bold text-white text-[16px]">Zero Onboarding Time</h4>
                  <p className="font-dm-mono text-[12px] text-text-muted">Agents are trained and ready to deploy in seconds.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Comparison Card */}
          <div className="relative cost-card-anim opacity-0">
            <div className="card-clickable p-8 sm:p-10 rounded-2xl flex flex-col gap-10">
              <h3 className="font-dm-mono text-[12px] text-green uppercase tracking-widest text-center">
                The ROI Comparison
              </h3>
              
              <div className="grid grid-cols-2 gap-8 relative">
                {/* Vertical Divider */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-r border-white/5" />
                
                {/* Trad Corp */}
                <div className="flex flex-col gap-6 text-center">
                   <div className="flex flex-col gap-1">
                      <span className="font-syne font-bold text-[18px] text-white opacity-50">Traditional</span>
                      <span className="font-dm-mono text-[10px] text-text-muted">6 MONTHS TO BUILD</span>
                   </div>
                   <div className="flex flex-col gap-4">
                      <div className="flex flex-col">
                        <span className="font-dm-mono text-[11px] text-text-muted">$45k/mo</span>
                        <span className="font-syne font-bold text-warn/80 text-[14px]">HEADCOUNT</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-dm-mono text-[11px] text-text-muted">$8k/mo</span>
                        <span className="font-syne font-bold text-warn/80 text-[14px]">MANAGEMENT</span>
                      </div>
                   </div>
                   <div className="pt-6 border-t border-white/5">
                      <span className="font-syne font-bold text-white text-[24px] opacity-40">$600k+</span>
                      <p className="font-dm-mono text-[9px] text-text-muted mt-1 uppercase">ANNUAL RECURRING COST</p>
                   </div>
                </div>

                {/* ORCA */}
                <div className="flex flex-col gap-6 text-center">
                   <div className="flex flex-col gap-1">
                      <span className="font-syne font-bold text-[18px] text-green">ORCA OS</span>
                      <span className="font-dm-mono text-[10px] text-green shadow-green-dim">INSTANT DEPLOY</span>
                   </div>
                   <div className="flex flex-col gap-4">
                      <div className="flex flex-col">
                        <span className="font-dm-mono text-[11px] text-text-muted">$249/mo</span>
                        <span className="font-syne font-bold text-green text-[14px]">GROWTH (PRO) PLAN</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-dm-mono text-[11px] text-text-muted">$0/mo</span>
                        <span className="font-syne font-bold text-green text-[14px]">EQUITY DILUTION</span>
                      </div>
                   </div>
                   <div className="pt-6 border-t border-white/5">
                      <span className="font-syne font-bold text-green text-[24px]">$2,988</span>
                      <p className="font-dm-mono text-[9px] text-text-muted mt-1 uppercase">ANNUAL RECURRING COST</p>
                   </div>
                </div>
              </div>

              {/* Bottom line */}
              <div className="p-4 rounded-xl bg-green/5 border border-green/10 text-center">
                <p className="font-dm-mono text-[12px] text-green">
                   SAVINGS: $597,012 PER YEAR
                </p>
              </div>
            </div>

            {/* Float visual element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green/20 blur-[40px] rounded-full pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

