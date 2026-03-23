'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import { X } from 'lucide-react';

interface Plan {
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLocked?: boolean;
  currentPlan?: string;
}

export default function PricingModal({ isOpen, onClose, isLocked, currentPlan }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    if (isOpen) {
      animate('.pricing-modal-overlay', {
        opacity: [0, 1],
        duration: 500,
        ease: 'outExpo'
      });
      animate('.pricing-modal-content', {
        scale: [0.95, 1],
        opacity: [0, 1],
        duration: 800,
        ease: 'outExpo'
      });
      animate('.pricing-card-anim', {
        opacity: [0, 1],
        y: [30, 0],
        delay: stagger(100),
        duration: 800,
        ease: 'outExpo'
      });
    }
  }, [isOpen]);

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
        'Full Nexonic Ecosystem',
        'Bring your own LLM',
        'Per-department model assignment',
        'Video generation (Marketing)',
        'Code generation (Tech)',
        'Web intelligence (500 pages/mo)',
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
        'Unlimited team members',
        'Full Nexonic Ecosystem + The Summit',
        'All LLMs including Ollama self-hosted',
        'Unlimited video & code generation',
        'Web intelligence (5,000 pages/mo)',
        'Full API access',
        '12-month audit log + CSV export',
        '24/7 concierge support'
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

  const handleStartTrial = async (plan: string) => {
    try {
      const res = await fetch('/api/billing/start-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.toLowerCase(),
          billing_cycle: billingCycle
        })
      });
      
      if (res.ok) {
        // Success! Reload or just close and update local state
        onClose();
        window.location.reload(); // Quickest way to update dashboard state
      }
    } catch (err) {
      console.error('Trial start error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 pricing-modal-overlay bg-bg/80 backdrop-blur-md opacity-0">
      
      <div className="absolute inset-0 z-0 bg-green/5 blur-[120px] rounded-full scale-150 opacity-20" />

      <div className="relative z-10 w-full max-w-7xl bg-bg border border-white/5 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh] no-scrollbar pricing-modal-content opacity-0 border-t-white/10">
        
        {/* Close Button - Hidden if locked */}
        {!isLocked && (
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all z-20"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-12 sm:p-20">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-syne font-[800] text-white tracking-tight mb-6">
              {isLocked 
                ? <>Your trial has ended. <span className="text-green">Select a plan to continue.</span></>
                : <>Pricing that scales with <span className="text-green">your ambition.</span></>
              }
            </h2>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
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

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card-anim opacity-0 p-8 sm:p-10 rounded-[2.5rem] flex flex-col gap-6 sm:gap-8 transition-all duration-500 group relative overflow-hidden backdrop-blur-xl border ${plan.highlighted || (currentPlan?.toUpperCase() === plan.name) ? 'border-green bg-green/[0.03] shadow-[0_0_40px_rgba(0,255,135,0.05)]' : 'border-white/5 bg-surface/40 hover:border-white/20'}`}
              >
                {(plan.highlighted || (currentPlan?.toUpperCase() === plan.name)) && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 py-2 px-4 bg-green rounded-full shadow-[0_4px_20px_rgba(0,255,135,0.2)]">
                    <span className="font-dm-mono text-[9px] font-black text-bg uppercase tracking-widest">
                      {currentPlan?.toUpperCase() === plan.name ? 'YOUR PLAN' : 'MOST POPULAR'}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                   <h3 className="font-syne font-[800] text-[24px] sm:text-[28px] text-white tracking-tight uppercase">
                     {plan.name}
                     {plan.highlighted && <span className="text-green ml-2">⭐</span>}
                   </h3>
                   <p className="font-dm-mono text-[11px] sm:text-[12px] text-white/50 leading-relaxed uppercase tracking-tighter">
                     {plan.tagline}
                   </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-[44px] sm:text-[54px] font-syne font-[800] text-white leading-none tracking-tighter">
                    ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                  </span>
                  <span className="font-dm-mono text-[12px] sm:text-[14px] text-white/30 font-black uppercase tracking-widest">
                    /mo
                  </span>
                </div>

                <ul className="flex flex-col gap-3 font-dm-mono text-[11px] sm:text-[12px]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-white/70 leading-snug">
                      <span className="text-green shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => isLocked ? handleCheckout(plan.name) : handleStartTrial(plan.name)}
                  className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-syne font-[800] text-[13px] sm:text-[15px] transition-all duration-300 uppercase tracking-widest ${
                    plan.highlighted 
                      ? 'btn-primary shadow-[0_4px_20px_rgba(0,255,135,0.2)]' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95'
                  }`}
                >
                  {isLocked && currentPlan?.toUpperCase() === plan.name ? 'Renew & Complete Setup' : plan.cta} →
                </button>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center font-dm-mono text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
             All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
