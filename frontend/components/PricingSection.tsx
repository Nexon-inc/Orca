'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';

interface Plan {
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animatePricing();
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

  const animatePricing = () => {
    animate('.pricing-card-anim', {
      opacity: [0, 1],
      y: [30, 0],
      delay: stagger(200),
      duration: 1000,
      ease: 'outExpo'
    });
  };

  const plans: Plan[] = [
    {
      name: 'STARTER',
      tagline: 'Your first AI team, operational in minutes.',
      monthlyPrice: 99,
      annualPrice: 83,
      features: [
        'Pick any 3 departments',
        '15 specialized agents',
        'Unlimited tasks',
        '3 team members + 1 Department Head',
        'CyberGuard security scanner',
        'ORCA-powered AI',
        'Connect your own external AI models',
        'OrcaHub free templates',
        '30-day audit log',
        'Email support'
      ],
      cta: 'Start Free Trial'
    },
    {
      name: 'PRO',
      tagline: 'Your entire operation, running on autopilot.',
      monthlyPrice: 199,
      annualPrice: 166,
      features: [
        'All 9 departments (Full Access)',
        'All 45 specialized agents',
        'Unlimited tasks',
        '10 team members + 2 Department Heads',
        'Full Nexonic Ecosystem (CyberGuard, Render.AI, Intuition)',
        'Bring your own LLM (OpenAI, Anthropic, Mistral, and more)',
        'Per-department and per-agent model assignment',
        'Full OrcaHub marketplace',
        'Video generation for marketing agents',
        'Code generation for tech agents',
        'Web intelligence (500 pages/mo)',
        '3-hop agent coordination chains',
        '6-month audit log',
        'Priority support'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'ENTERPRISE',
      tagline: 'Built for teams that operate at full scale.',
      monthlyPrice: 399,
      annualPrice: 332,
      features: [
        'All 9 departments + Custom Setup',
        'All 45 specialized agents',
        'Unlimited tasks',
        'Unlimited team members + Department Heads',
        'Full Nexonic Ecosystem + The Summit + Island of Relevancy',
        'All LLMs including Ollama self-hosted',
        'Per-department and per-agent model assignment',
        'Full OrcaHub marketplace + publish your own templates',
        'Unlimited video generation',
        'Unlimited code generation + private repo access',
        'Web intelligence (5,000 pages/mo)',
        '5-hop coordination chains + custom triggers',
        'Full API access for custom integrations',
        'Custom agent training',
        'Dedicated infrastructure',
        '12-month audit log + CSV export',
        '99.9% uptime SLA',
        '24/7 concierge support + dedicated onboarding call'
      ],
      cta: 'Start Free Trial'
    }
  ];

  const handleCheckout = async (plan: string) => {
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.toLowerCase(),
          billing_cycle: billingCycle
        })
      });
      const data = await res.json();
      if (data.authorization_url) window.location.href = data.authorization_url;
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <section ref={sectionRef} id="pricing-section" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-bg overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] opacity-10 pointer-events-none">
        <div className="w-full h-full bg-green filter blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-syne font-[800] leading-tight mb-8 text-white tracking-tight">
            Pricing that scales with <span className="text-green">your ambition.</span>
          </h2>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`font-dm-mono text-[11px] font-black tracking-widest uppercase transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/30'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-7 rounded-full bg-white/5 border border-white/10 p-1 flex items-center transition-all group hover:border-green/50"
            >
              <div className={`w-5 h-5 rounded-full bg-green shadow-[0_0_10px_rgba(0,255,135,0.4)] transition-all duration-300 ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-3">
               <span className={`font-dm-mono text-[11px] font-black tracking-widest uppercase transition-colors ${billingCycle === 'annual' ? 'text-white' : 'text-white/30'}`}>Annual</span>
               <span className="font-dm-mono text-[9px] text-bg bg-green px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Save 2 months</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card-anim opacity-0 p-10 rounded-[2.5rem] flex flex-col gap-8 transition-all duration-500 group relative overflow-hidden backdrop-blur-xl border ${plan.highlighted ? 'border-green bg-green/[0.03] shadow-[0_0_40px_rgba(0,255,135,0.05)]' : 'border-white/5 bg-surface/40 hover:border-white/20'}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-10 -translate-y-1/2 py-2 px-4 bg-green rounded-full shadow-[0_4px_20px_rgba(0,255,135,0.2)]">
                  <span className="font-dm-mono text-[9px] font-black text-bg uppercase tracking-widest">MOST POPULAR</span>
                </div>
              )}

              {/* Plan Header */}
              <div className="flex flex-col gap-3">
                 <h3 className="font-syne font-[800] text-[28px] text-white tracking-tight uppercase">
                   {plan.name}
                   {plan.highlighted && <span className="text-green ml-2">⭐</span>}
                 </h3>
                 <p className="font-dm-mono text-[12px] text-white/50 leading-relaxed uppercase tracking-tighter">
                   {plan.tagline}
                 </p>
              </div>

              {/* Price */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-[54px] font-syne font-[800] text-white leading-none tracking-tighter">
                    ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                  </span>
                  <span className="font-dm-mono text-[14px] text-white/30 font-black uppercase tracking-widest">
                    /mo
                  </span>
                </div>
                {billingCycle === 'annual' && (
                   <div className="mt-2 flex flex-col">
                      <p className="text-[10px] font-dm-mono text-green font-black uppercase tracking-widest">
                        Billed as ${plan.name === 'STARTER' ? '996' : plan.name === 'PRO' ? '1,992' : '3,984'}/yr
                      </p>
                      <p className="text-[10px] font-dm-mono text-white/40 font-black uppercase tracking-widest">
                        Saves ${plan.name === 'STARTER' ? '216' : plan.name === 'PRO' ? '432' : '864'}
                      </p>
                   </div>
                )}
              </div>

              {/* Feature List */}
              <ul className="flex flex-col gap-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 font-dm-mono text-[12px] text-white/70 leading-snug">
                    <span className="text-green text-[14px] shrink-0">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button 
                onClick={() => handleCheckout(plan.name)}
                className={`w-full py-5 px-6 rounded-2xl font-syne font-[800] text-[15px] transition-all duration-300 uppercase tracking-widest ${
                  plan.highlighted 
                    ? 'btn-primary shadow-[0_4px_20px_rgba(0,255,135,0.2)]' 
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trial Notice */}
        <div className="mt-16 text-center space-y-4">
            <p className="font-dm-mono text-[11px] text-white/20 font-black uppercase tracking-[0.2em]">
               All plans include a 14-day free trial. No credit card required. Cancel anytime.
            </p>
        </div>
      </div>
    </section>
  );
}
