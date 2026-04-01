'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const plans = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Perfect for exploring the OS.',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      '2 executives from your team',
      'Unified Chat Console',
      'Daily Briefings',
      'Basic security'
    ],
    cta: 'Current Plan',
    current: true
  },
  {
    id: 'builder',
    name: 'BUILDER',
    tagline: 'Scale your operations with the full team.',
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      'Full executive team (CMO, CSO, CCO, CIO, CTO)',
      'Unlimited tasks',
      'Vercel & HubSpot Integrations',
      'Weekly Inngest Intelligence',
      'Priority support'
    ],
    cta: 'Upgrade to Builder',
    highlighted: true
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'Full autonomy for the elite founder.',
    monthlyPrice: 59,
    annualPrice: 49,
    features: [
      'Full executive team + AI CEO Mode (ATLAS)',
      'Fully Autonomous Mode',
      'Custom Workflow Creation',
      'Advanced Intelligence Reports',
      '24/7 Concierge'
    ],
    cta: 'Get Pro Access'
  }
];

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    animate('.up-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar active="upgrade" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Pricing</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-[800] uppercase tracking-widest">PRO ACTIVE</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl overflow-y-auto no-scrollbar">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 up-anim opacity-0">
            <div>
              <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">Scale Your <span className="text-green">Business</span></h1>
              <p className="font-syne text-[11px] text-white/40 uppercase tracking-widest font-[800]">Upgrade your agents and power up your organization.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 up-anim opacity-0">
             {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500 relative overflow-visible group backdrop-blur-xl ${
                     plan.highlighted 
                     ? 'bg-green/[0.03] border-green shadow-[0_20px_50px_rgba(0,255,135,0.05)]' 
                     : 'bg-surface/30 border-white/5 hover:border-white/20'
                  }`}
                >
                   {plan.highlighted && (
                     <div className="absolute top-0 right-10 -translate-y-1/2 py-2 px-4 bg-green rounded-full shadow-[0_4px_20px_rgba(0,255,135,0.2)]">
                        <span className="font-syne text-[9px] font-[800] text-bg uppercase tracking-widest">MOST POPULAR</span>
                     </div>
                   )}
                   
                   <div className="mb-8 text-left">
                      <h2 className={`font-syne text-2xl font-[800] uppercase tracking-tight mb-3 ${plan.highlighted ? 'text-white' : 'text-white/60'}`}>
                        {plan.name}
                        {plan.highlighted && <span className="text-green ml-2">â­</span>}
                      </h2>
                      <p className="font-syne text-[11px] text-white/40 leading-relaxed uppercase tracking-widest mb-6 font-[800]">
                        {plan.tagline}
                      </p>
                       <div className="flex items-baseline gap-2">
                          <span className="font-syne text-[48px] font-[800] text-white tracking-tighter leading-none">
                            ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                          </span>
                          <span className="font-syne text-white/20 text-[12px] font-[800] uppercase tracking-widest">/mo</span>
                       </div>
                       {billingCycle === 'annual' && (
                         <p className="mt-2 text-[9px] font-syne text-green font-[800] uppercase tracking-widest">
                           Billed as ${plan.annualPrice * 12}/yr â€” Saves ${ (plan.monthlyPrice - plan.annualPrice) * 12 }
                         </p>
                       )}
                   </div>

                   <div className="h-[1px] w-full bg-white/5 mb-8" />

                    <ul className="flex flex-col gap-4 mb-10 flex-1 font-[800] uppercase tracking-widest">
                       {plan.features.map((f, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-4 text-[10px] text-white/40 leading-snug group-hover:text-white transition-colors">
                             <span className="text-green text-[14px] shrink-0">âœ“</span>
                             {f}
                          </li>
                       ))}
                    </ul>
                   
                   <button className={`w-full py-5 rounded-2xl font-syne font-[800] text-[15px] uppercase tracking-widest transition-all duration-300 ${
                      plan.current 
                      ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed' 
                      : plan.highlighted
                        ? 'bg-green text-bg shadow-[0_4px_25px_rgba(0,255,135,0.2)] hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95'
                   }`}>
                      {plan.current ? 'Current Plan' : plan.cta}
                   </button>
                </div>
             ))}
          </div>

          <div className="mt-24 up-anim opacity-0">
             <div className="text-left mb-12">
                <h2 className="font-syne text-3xl font-[800] text-white uppercase tracking-tight mb-2">More <span className="text-green">Capabilities</span></h2>
                <p className="font-syne text-[11px] text-white/40 uppercase tracking-widest font-[800]">Coordinated intelligence across every business layer.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="col-span-full py-16 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                   <p className="font-syne text-[11px] text-white/10 font-[800] uppercase tracking-[0.2em]">Searching for upcoming features...</p>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
