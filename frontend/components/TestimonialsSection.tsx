'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const testimonials = [
  {
    quote: "I've replaced 3 agency retainers with ORCA. The agents don't get tired and they actually follow the mission.",
    author: "James K.",
    role: "Founding CEO, Nexa",
    initials: "JK"
  },
  {
    quote: "The coordination feed is addictive. Seeing tech and marketing agents align in real-time is the future of work.",
    author: "Amara L.",
    role: "Head of Product",
    initials: "AL"
  },
  {
    quote: "Finally, an AI tool that isn't just a chatbot. It's a workforce that actually executes tasks end-to-end.",
    author: "David R.",
    role: "Indie Founder",
    initials: "DR"
  }
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.testimonial-card', {
            opacity: [0, 1],
            scale: [0.98, 1],
            delay: stagger(200),
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
    <section id="testimonials" ref={sectionRef} className="py-24 px-4 bg-bg border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-4">
             The <span className="text-green">Founder Consensus</span>
          </h2>
          <p className="font-dm-mono text-text-muted text-[14px]">
            Direct reports from those building with ORCA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className="testimonial-card opacity-0 p-10 rounded-3xl border border-white/5 bg-surface/20 flex flex-col justify-between group hover:border-green/10 transition-colors"
            >
              <div className="mb-8 relative">
                <span className="absolute -top-4 -left-4 text-4xl text-green/10 opacity-40 italic">“</span>
                <p className="font-dm-mono text-[14px] text-white leading-relaxed relative z-10">
                  {t.quote}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-dim border border-green-border flex items-center justify-center font-bold text-green text-[12px]">
                   {t.initials}
                </div>
                <div>
                   <p className="font-syne text-[14px] font-bold text-white group-hover:text-green transition-colors">{t.author}</p>
                   <p className="font-dm-mono text-[11px] text-text-muted uppercase tracking-tight">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
