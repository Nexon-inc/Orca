'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const painPoints = [
  {
    title: 'THE DISCONNECT',
    description: 'Manual handoffs between departments are where vision goes to die. Context is lost, deadlines slip, and momentum stalls.',
    icon: 'link_off'
  },
  {
    title: 'THE ADMINISTRATIVE VOID',
    description: 'Founders spend 60% of their time on "work about work"—scheduling, syncing, and summarizing—instead of actually building.',
    icon: 'history'
  },
  {
    title: 'THE SCALING BURN',
    description: 'Hiring is a high-risk gamble. Management overhead often grows faster than revenue, leading to the "Scaling Trap".',
    icon: 'trending_down'
  }
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.pain-point-card', {
            opacity: [0, 1],
            y: [30, 0],
            delay: stagger(200),
            duration: 1000,
            ease: 'outExpo'
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
    <section id="problem" ref={sectionRef} className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-surface/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left: Content */}
          <div className="flex-1 lg:sticky lg:top-32">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-syne font-black text-white leading-tight mb-8 uppercase tracking-tighter">
              The solo founder <br />
              <span className="text-green">ceiling exists.</span>
            </h2>
            <p className="font-dm-mono text-[14px] sm:text-[16px] text-text-muted leading-relaxed max-w-xl">
              Building a company alone isn't just hard—it's inefficient. You are the bottleneck for every decision, every email, and every line of code. 
              <br /><br />
              Until now, your only choices were to stay small or endure the massive overhead of hiring a human team before you were ready.
            </p>
            
            <div className="mt-12 p-6 rounded-2xl border border-green/20 bg-green/5 flex items-center gap-4 group hover:bg-green/10 transition-colors">
               <span className="material-symbols-outlined text-green text-3xl">info</span>
               <p className="font-dm-mono text-[11px] text-green/60 uppercase tracking-widest font-bold">
                 ORCA was built to shatter this ceiling by providing a fully autonomous workforce.
               </p>
            </div>
          </div>

          {/* Right: Pain Points */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            {painPoints.map((point) => (
              <div 
                key={point.title} 
                className="pain-point-card opacity-0 p-8 rounded-3xl border border-white/5 bg-surface/50 backdrop-blur-sm group hover:border-white/10 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <span className="material-symbols-outlined text-white/20 group-hover:text-green transition-colors text-3xl">
                    {point.icon}
                  </span>
                  <div>
                    <h3 className="font-syne font-bold text-lg text-white mb-3 tracking-wide">{point.title}</h3>
                    <p className="font-dm-mono text-[13px] text-text-muted leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
