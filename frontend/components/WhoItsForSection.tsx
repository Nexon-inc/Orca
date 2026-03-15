'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const personas = [
  {
    title: 'Individual Founder',
    focus: 'Leverage',
    description: 'You handle every seat. Automate high-bandwidth tasks like outreach, documentation, and research so you can focus on building.',
    tag: 'Solo'
  },
  {
    title: 'Co-founding Team',
    focus: 'Alignment',
    description: 'Stop guessing what the other is doing. Unified agents coordinate across departments to keep the entire org in sync.',
    tag: 'Team'
  },
  {
    title: 'Indie Hacker',
    focus: 'Velocity',
    description: 'Speed is your only moate. Deploy marketing and sales agents instantly to test hypotheses and scale winning channels.',
    tag: 'Product'
  },
  {
    title: 'Early Stage Startup',
    focus: 'Efficiency',
    description: 'Scale from 3 to 10 without the hiring burn. Augment your human team with 24/7 autonomous agents.',
    tag: 'Scale'
  }
];

export default function WhoItsForSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.persona-card', {
            opacity: [0, 1],
            y: [20, 0],
            delay: stagger(150),
            duration: 800,
            ease: 'outQuad'
          });
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

  return (
    <section id="who-it-is-for" ref={sectionRef} className="py-24 px-4 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-4">
             Who is <span className="text-green">ORCA For?</span>
          </h2>
          <p className="font-dm-mono text-text-muted max-w-xl mx-auto">
            Optimized for those who value leverage over headcount.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona, idx) => (
            <div 
              key={idx} 
              className="persona-card opacity-0 p-8 rounded-2xl border border-white/5 bg-surface/30 hover:bg-surface/50 hover:border-green/20 transition-all group"
            >
              <span className="inline-block px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60 text-[8px] font-dm-mono uppercase tracking-widest mb-6 group-hover:text-green group-hover:border-green/30 transition-all">
                {persona.tag}
              </span>
              <h3 className="font-syne text-lg font-bold text-white mb-2 group-hover:text-green transition-colors">{persona.title}</h3>
              <p className="font-dm-mono text-[11px] text-green/60 uppercase tracking-tighter mb-4 opacity-70">Focus: {persona.focus}</p>
              <p className="font-dm-mono text-[13px] text-text-muted leading-relaxed">
                {persona.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
