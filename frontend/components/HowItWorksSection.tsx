'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const steps = [
  {
    number: '00',
    title: 'Pick a Template',
    description: "Choose from OrcaHub's pre-built company templates. Your departments, agent modes, and Day 1 briefs are configured automatically.",
    icon: '🏪'
  },
  {
    number: '01',
    title: 'Brief Your Agent',
    description: 'Provide a goal, a document, or a simple instruction. Your department agents understand context instantly.',
    icon: '◈'
  },
  {
    number: '02',
    title: 'Autonomous Execution',
    description: 'Agents research, draft, code, or analyze. They coordinate with other departments to ensure consistency.',
    icon: '◇'
  },
  {
    number: '03',
    title: 'Real-time Coordination',
    description: 'Watch the Coordination Feed as agents hand off tasks and align on the company mission.',
    icon: '⬡'
  },
  {
    number: '04',
    title: 'Human Control',
    description: 'Review results, approve actions, or pivot. You stay in the driver’s seat while the work gets done.',
    icon: '◆'
  }
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCards();
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

  const animateCards = () => {
    animate('.how-it-works-card', {
      opacity: [0, 1],
      y: [40, 0],
      delay: stagger(200),
      duration: 1000,
      ease: 'outExpo'
    });

    animate('.how-it-works-line', {
      width: ['0%', '100%'],
      duration: 2000,
      delay: 500,
      ease: 'inOutSine'
    });
  };

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 px-4 bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-4">
            How ORCA <span className="text-green">Operates</span>
          </h2>
          <p className="font-dm-mono text-text-muted max-w-2xl mx-auto">
            A seamless bridge between founder vision and autonomous execution.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[2.5rem] left-0 w-full h-px bg-white/5 z-0">
             <div className="how-it-works-line absolute top-0 left-0 h-full bg-green/30 w-full" style={{ width: '0%' }} />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="how-it-works-card opacity-0 group p-8 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm card-clickable"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-dm-mono text-[10px] text-green tracking-widest uppercase opacity-60">Step {step.number}</span>
                  <span className="text-xl text-green/40 group-hover:text-green transition-colors">{step.icon}</span>
                </div>
                <h3 className="font-syne text-xl font-bold text-white mb-4 group-hover:text-green transition-colors">
                  {step.title}
                </h3>
                <p className="font-dm-mono text-[13px] text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
