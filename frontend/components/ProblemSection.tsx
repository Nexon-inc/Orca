'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.problem-card', {
            opacity: [0, 1],
            y: [30, 0],
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

  const problems = [
    {
      title: 'Context Switching',
      desc: 'Jumping between marketing, sales, and code kills your focus and velocity.'
    },
    {
      title: 'The Solo Trap',
      desc: 'If you stop, everything stops. No growth, just endless maintenance.'
    },
    {
      title: 'The Talent Gap',
      desc: 'You need a world-class team, but you don\'t have the runway to hire 5 experts.'
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-24 px-4 sm:px-6 lg:px-8 bg-bg">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <span className="font-dm-mono text-[12px] text-green uppercase tracking-[0.2em] mb-4 block">
          The Problem
        </span>
        <h2 className="text-3xl sm:text-4xl font-syne font-bold text-white mb-6 tracking-tight">
          Building a company shouldn't <br />
          <span className="opacity-50 italic">feel like a solo fight.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {problems.map((prob, i) => (
          <div key={i} className="problem-card opacity-0 p-8 rounded-2xl bg-surface border border-white/5 flex flex-col gap-4">
            <div className="w-8 h-8 rounded bg-warn/10 flex items-center justify-center text-warn font-bold font-syne text-[14px]">
              0{i + 1}
            </div>
            <h3 className="font-syne font-bold text-white text-[18px]">
              {prob.title}
            </h3>
            <p className="font-dm-mono text-[13px] text-text-muted leading-relaxed">
              {prob.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
