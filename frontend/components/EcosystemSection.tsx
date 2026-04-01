'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const products = [
  {
    name: 'CyberGuard',
    subtitle: 'Autonomous Code Security',
    description: 'AI-powered vulnerability detection and automatic PR fixes.',
    plan: 'Starter+',
    icon: 'ðŸ›¡ï¸'
  },
  {
    name: 'Render.AI',
    subtitle: 'Neural Creative Production',
    description: 'Generative video and marketing assets for ads and social.',
    plan: 'Pro+',
    icon: 'ðŸŽ¥'
  }
];

const providers = [
  { name: 'ORCA Intelligence', label: 'Bring your own key', plan: 'All plans' },
  { name: 'OpenAI GPT-4o', label: 'Bring your own key', plan: 'All plans' },
  { name: 'Anthropic Claude', label: 'Bring your own key', plan: 'All plans' },
  { name: 'Google Gemini', label: 'Bring your own key', plan: 'All plans' },
  { name: 'DeepSeek', label: 'Bring your own key', plan: 'All plans' },
  { name: 'Mistral AI', label: 'Bring your own key', plan: 'All plans' },
  { name: 'Groq Cloud', label: 'Bring your own key', plan: 'All plans' },
  { name: 'xAI Grok', label: 'Bring your own key', plan: 'All plans' },
  { name: 'Ollama', label: 'Bring your own key', plan: 'All plans' }
];

export default function EcosystemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.ecosystem-card', {
            opacity: [0, 1],
            scale: [0.95, 1],
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
    <section id="ecosystem" ref={sectionRef} className="py-32 px-4 bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              The Nexonic <span className="text-green">Ecosystem</span>
            </h2>
            <p className="font-dm-mono text-text-muted text-[15px] leading-relaxed">
              ORCA integrates with our specialized AI products to unlock department-specific superpowers.
            </p>
          </div>
          <div className="font-dm-mono text-[11px] text-green/60 uppercase tracking-widest border-l border-green/20 pl-6 h-fit">
            Built by Nexonic Industries
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 mb-32">
          {products.map((product, idx) => (
            <div 
              key={idx} 
              className="ecosystem-card opacity-0 group relative p-8 rounded-3xl border border-white/5 bg-surface hover:border-green/20 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-4xl grayscale group-hover:grayscale-0">
                {product.icon}
              </div>
              
              <div className="relative z-10">
                <span className="inline-block px-2 py-1 rounded bg-green-dim border border-green-border text-green text-[9px] font-dm-mono mb-4">
                  {product.plan}
                </span>
                <h3 className="font-syne text-2xl font-bold text-white mb-1 group-hover:text-green transition-colors">
                  {product.name}
                </h3>
                <p className="font-dm-mono text-[12px] text-green/60 mb-6 uppercase tracking-tight">
                  {product.subtitle}
                </p>
                <p className="font-dm-mono text-[14px] text-text-muted leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
          ))}
        </div>

        {/* LLM Provider Grid */}
        <div className="mt-40 border-t border-white/5 pt-32">
          <div className="text-center mb-20">
            <h3 className="font-syne text-3xl font-bold text-white mb-4">Your models. Your rules.</h3>
            <p className="font-dm-mono text-text-muted max-w-2xl mx-auto">ORCA works with the LLM you already use.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-surface/50 hover:bg-surface transition-all flex flex-col items-center justify-center text-center">
                <div className="font-syne text-lg font-bold text-white mb-2">{p.name}</div>
                <div className="font-dm-mono text-[11px] text-green/60 uppercase mb-4">{p.label}</div>
                <span className="px-2 py-1 rounded-full bg-white/5 text-text-muted text-[9px] uppercase tracking-wider">{p.plan}</span>
              </div>
            ))}
          </div>
          
          <p className="mt-12 text-center font-dm-mono text-[13px] text-text-muted max-w-2xl mx-auto leading-relaxed">
            Connect your own API keys for your preferred LLM to power your 6 executives. Assign different models to different departments, or standardise across your entire company. Secure, private, and completely in your control.
          </p>
        </div>
      </div>
    </section>
  );
}


