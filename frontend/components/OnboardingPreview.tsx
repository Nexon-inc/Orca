'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const steps = [
  { id: 'brief', label: 'Brief', title: 'The Mission', detail: 'Agent briefing' },
  { id: 'org', label: 'Org', title: 'Department Setup', detail: 'Org chart mapping' },
  { id: 'mode', label: 'Mode', title: 'Operating State', detail: 'Autopilot vs Approve' },
  { id: 'stack', label: 'Stack', title: 'Tool Integration', detail: 'Composio connection' },
  { id: 'launch', label: 'Launch', title: 'The First Task', detail: 'Initial execution' },
];

export default function OnboardingPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateProcess();
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

  const animateProcess = () => {
    animate('.onboarding-step', {
      opacity: [0, 1],
      x: [20, 0],
      delay: stagger(100),
      duration: 800,
      ease: 'outQuad'
    });

    animate('.onboarding-progress-bar', {
      width: ['0%', '100%'],
      duration: 3000,
      ease: 'inOutSine'
    });
  };

  return (
    <section id="onboarding-preview" ref={sectionRef} className="py-24 px-4 bg-bg border-y border-white/5">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="font-syne text-2xl sm:text-3xl font-bold text-white mb-4">
          The Onboarding <span className="text-green">Protocol</span>
        </h2>
        <p className="font-dm-mono text-text-muted text-[14px] mb-16 max-w-xl mx-auto">
          From zero to autonomous in 5 minutes. Experience the setup flow designed for scale.
        </p>

        <div className="relative pt-12">
            {/* Progress Track */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
                <div className="onboarding-progress-bar absolute top-0 left-0 h-full bg-green" style={{ width: '0%' }} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-8 items-start">
               {steps.map((step, idx) => (
                 <div key={idx} className="onboarding-step opacity-0 flex-1 flex flex-col items-center sm:items-start group">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-dm-mono text-[10px] text-white/40 group-hover:border-green group-hover:text-green transition-all">
                            0{idx + 1}
                        </div>
                        <span className="font-dm-mono text-[11px] text-green tracking-widest uppercase">{step.label}</span>
                    </div>
                    <h3 className="font-syne text-[16px] font-bold text-white mb-2 group-hover:text-green transition-colors">{step.title}</h3>
                    <p className="font-dm-mono text-[12px] text-text-muted text-center sm:text-left">{step.detail}</p>
                 </div>
               ))}
            </div>
            
            <div className="mt-20 p-12 rounded-2xl border border-white/5 bg-surface/50 relative overflow-hidden group hover:border-green/10 transition-colors">
                <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12">▣</div>
                <div className="text-left relative z-10">
                    <p className="font-dm-mono text-[14px] text-white leading-relaxed italic mb-6">
                        "Your company architecture is your competitive advantage. Most founders build houses. We build skyscrapers with automated elevators."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-dim border border-green-border flex items-center justify-center text-green font-bold">O</div>
                        <div>
                            <p className="font-syne text-[13px] font-bold text-white">ORCA Protocol</p>
                            <p className="font-dm-mono text-[10px] text-green/60 uppercase">Deployment standard v4.2</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
