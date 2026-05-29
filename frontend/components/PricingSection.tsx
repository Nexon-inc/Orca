'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { toast } from 'sonner';
import {
  ANNUAL_CHECKOUT_ENABLED,
  FOUNDING,
  ORCA_PLANS,
  formatUsd,
  getCheckoutBillingCycle,
  getCheckoutKesHint,
  getDisplayUsd,
  getFoundingCheckoutHint,
} from '@/lib/pricing/config';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [foundingStatus, setFoundingStatus] = useState({
    remaining: 50,
    available: true,
    total: 50,
  });
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

    fetch('/api/founding/status')
      .then((res) => res.json())
      .then((data) => setFoundingStatus(data))
      .catch(() => {});

    return () => observer.disconnect();
  }, []);

  const animatePricing = () => {
    animate('.pricing-card-anim', {
      opacity: [0, 1],
      y: [30, 0],
      delay: stagger(200),
      duration: 1000,
      ease: 'outExpo',
    });
  };

  const handleCheckout = async (plan: string) => {
    if (plan.toLowerCase() === 'free') {
      window.location.href = '/dashboard';
      return;
    }
    if (billingCycle === 'annual' && !ANNUAL_CHECKOUT_ENABLED && plan !== 'founding') {
      toast.error('Annual checkout is being enabled. Choose Monthly or try again shortly.');
      return;
    }
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.toLowerCase(),
          billing_cycle: getCheckoutBillingCycle(billingCycle),
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error(data.error || 'Could not start checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Checkout failed. Try again or contact support.');
    }
  };

  return (
    <section
      ref={sectionRef}
      id="pricing-section"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-bg overflow-hidden font-dm-mono"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] opacity-10 pointer-events-none">
        <div className="w-full h-full bg-green filter blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {foundingStatus.available && (
          <div className="max-w-3xl mx-auto mb-16 p-px rounded-[2rem] bg-gradient-to-r from-green/50 via-white/20 to-green/50 animate-pulse">
            <div className="bg-bg/90 backdrop-blur-xl rounded-[2rem] p-6 px-10 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🔥</span>
                <div className="text-left">
                  <h4 className="font-syne font-black text-white text-[16px] uppercase tracking-widest">
                    Founding Member Offer
                  </h4>
                  <p className="text-white/40 text-[10px] uppercase font-black tracking-widest leading-relaxed mt-1">
                    {formatUsd(FOUNDING.monthlyUsd)}/mo locked · {getFoundingCheckoutHint()} ·{' '}
                    {foundingStatus.remaining} spots left
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCheckout('founding')}
                className="whitespace-nowrap px-6 py-3 bg-green text-bg font-syne font-black text-[12px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)]"
              >
                Claim founding spot →
              </button>
            </div>
          </div>
        )}

        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-syne font-[800] leading-tight mb-4 text-white tracking-tight">
            Pricing that scales with <span className="text-green">your ambition.</span>
          </h2>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.25em] mb-8 max-w-lg mx-auto leading-relaxed">
            Prices shown in USD · Paystack checkout charges KES (card & M-Pesa)
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span
              className={`text-[11px] font-black tracking-widest uppercase transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/30'}`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-7 rounded-full bg-white/5 border border-white/10 p-1 flex items-center transition-all group hover:border-green/50"
            >
              <div
                className={`w-5 h-5 rounded-full bg-green shadow-[0_0_10px_rgba(0,255,135,0.4)] transition-all duration-300 ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'}`}
              />
            </button>
            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] font-black tracking-widest uppercase transition-colors ${billingCycle === 'annual' ? 'text-white' : 'text-white/30'}`}
              >
                Annual
              </span>
              <span className="text-[9px] text-bg bg-green px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                Save 2 months
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {ORCA_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card-anim opacity-0 p-10 rounded-[2.5rem] flex flex-col gap-8 transition-all duration-500 group relative overflow-visible backdrop-blur-xl border ${plan.highlighted ? 'border-green bg-green/[0.03] shadow-[0_0_40px_rgba(0,255,135,0.05)]' : 'border-white/5 bg-surface/40 hover:border-white/20'}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-10 -translate-y-1/2 py-2 px-4 bg-green rounded-full shadow-[0_4px_20px_rgba(0,255,135,0.2)]">
                  <span className="text-[9px] font-black text-bg uppercase tracking-widest">MOST POPULAR</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="font-syne font-[800] text-[28px] text-white tracking-tight uppercase">
                  {plan.name}
                </h3>
                <p className="text-[12px] text-white/50 leading-relaxed uppercase tracking-tighter">
                  {plan.tagline}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[40px] sm:text-[48px] font-syne font-[800] text-white leading-none tracking-tighter">
                    {formatUsd(getDisplayUsd(plan, billingCycle))}
                  </span>
                  {plan.monthlyUsd > 0 && (
                    <span className="text-[14px] text-white/30 font-black uppercase tracking-widest">/mo</span>
                  )}
                </div>
                {plan.monthlyUsd > 0 && (
                  <p className="text-[9px] text-white/35 font-black uppercase tracking-widest">
                    {getCheckoutKesHint(plan, billingCycle)}
                  </p>
                )}
                {billingCycle === 'annual' && plan.annualTotalUsd > 0 && (
                  <div className="mt-2 flex flex-col">
                    <p className="text-[10px] text-green font-black uppercase tracking-widest">
                      Billed as {formatUsd(plan.annualTotalUsd)}/yr
                    </p>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                      Saves {formatUsd(plan.annualSavingsUsd)}
                    </p>
                  </div>
                )}
              </div>

              <ul className="flex flex-col gap-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-[12px] text-white/70 leading-snug">
                    <span className="text-green text-[14px] shrink-0">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleCheckout(plan.id)}
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

        <div className="mt-16 text-center space-y-3">
          <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.2em]">
            No credit card required for the Free plan. Cancel paid subscriptions anytime.
          </p>
          <p className="text-[10px] text-white/15 font-black uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            Checkout is processed in Kenyan Shillings (KES) via Paystack — amount shown before you pay.
          </p>
        </div>
      </div>
    </section>
  );
}
