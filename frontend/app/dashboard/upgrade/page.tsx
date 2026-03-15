'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const plans = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Your first AI team, operational in minutes.',
    monthlyPrice: 99,
    annualPrice: 83,
    features: [
      '3 AI Departments unlocked',
      '15 specialized agents',
      'Unlimited tasks',
      '3 team members + 1 Department Head',
      'CyberGuard security scanner included',
      'Email support'
    ],
    cta: 'Start Free Trial'
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'Your entire company, running on autopilot.',
    monthlyPrice: 199,
    annualPrice: 166,
    features: [
      'All 9 AI Departments',
      'All 45 specialized agents',
      'Unlimited tasks',
      '10 team members + 3 Department Heads',
      'Full Nexonic Ecosystem access',
      'Autopilot, Approve, or Suggest modes',
      'Priority support'
    ],
    cta: 'Current Plan',
    highlighted: true,
    current: true
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    tagline: 'Built for teams that operate at scale.',
    monthlyPrice: 399,
    annualPrice: 332,
    features: [
      'All 9 Departments',
      'All 45 agents + custom training',
      'Unlimited team members',
      'Full Nexonic Ecosystem access',
      'API access for integrations',
      'Dedicated infrastructure',
      '24/7 concierge support'
    ],
    cta: 'Start Free Trial'
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
    <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Resource Allocation</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-black uppercase tracking-widest">PRO ACTIVE</span>
            </div>
          </div>
          <p className="text-[11px] text-white/20 font-[900] uppercase tracking-widest hidden sm:block">Next Billing Cycle: <span className="text-white/60">Oct 12, 2024</span></p>
        </header>

        <div className="p-8 max-w-7xl overflow-y-auto no-scrollbar">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 up-anim opacity-0">
            <div>
              <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">System <span className="text-green">Scaling</span></h1>
              <p className="font-dm-mono text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Adjust autonomous capacity and compute priority.</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center gap-4 bg-surface/50 p-2 rounded-2xl border border-white/5">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${billingCycle === 'annual' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-green text-bg text-[7px] font-black px-1.5 py-0.5 rounded-full">SAVE</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 up-anim opacity-0">
             {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500 relative overflow-hidden group backdrop-blur-xl ${
                     plan.highlighted 
                     ? 'bg-green/[0.03] border-green shadow-[0_20px_50px_rgba(0,255,135,0.05)]' 
                     : 'bg-surface/30 border-white/5 hover:border-white/20'
                  }`}
                >
                   {plan.highlighted && (
                     <div className="absolute top-0 right-10 -translate-y-1/2 py-2 px-4 bg-green rounded-full shadow-[0_4px_20px_rgba(0,255,135,0.2)]">
                        <span className="font-dm-mono text-[9px] font-black text-bg uppercase tracking-widest">MOST POPULAR</span>
                     </div>
                   )}
                   
                   <div className="mb-8 text-left">
                      <h2 className={`font-syne text-2xl font-[800] uppercase tracking-tight mb-3 ${plan.highlighted ? 'text-white' : 'text-white/60'}`}>
                        {plan.name}
                        {plan.highlighted && <span className="text-green ml-2">⭐</span>}
                      </h2>
                      <p className="font-dm-mono text-[11px] text-white/40 leading-relaxed uppercase tracking-tighter mb-6">
                        {plan.tagline}
                      </p>
                       <div className="flex items-baseline gap-2">
                          <span className="font-syne text-[48px] font-[800] text-white tracking-tighter leading-none">
                            ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                          </span>
                          <span className="font-dm-mono text-white/20 text-[12px] font-black uppercase tracking-widest">/mo</span>
                       </div>
                       {billingCycle === 'annual' && (
                         <p className="mt-2 text-[9px] font-dm-mono text-green font-black uppercase tracking-widest">
                           Billed as ${plan.annualPrice * 12}/yr — Saves ${ (plan.monthlyPrice - plan.annualPrice) * 12 }
                         </p>
                       )}
                   </div>

                   <div className="h-[1px] w-full bg-white/5 mb-8" />

                    <ul className="flex flex-col gap-4 mb-10 flex-1">
                       {plan.features.map((f, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-4 text-[12px] font-dm-mono text-white/50 leading-snug group-hover:text-white transition-colors">
                             <span className="text-green text-[14px] shrink-0">✓</span>
                             {f}
                          </li>
                       ))}
                    </ul>
                   
                   <button className={`w-full py-5 rounded-2xl font-syne font-[800] text-[15px] uppercase tracking-widest transition-all duration-300 ${
                      plan.current 
                      ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed' 
                      : plan.highlighted
                        ? 'btn-primary shadow-[0_4px_25px_rgba(0,255,135,0.2)] hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95'
                   }`}>
                      {plan.current ? 'Current Plan' : plan.cta}
                   </button>
                </div>
             ))}
          </div>

          <div className="mt-16 p-10 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col lg:flex-row items-center justify-between gap-10 up-anim opacity-0">
             <div className="max-w-2xl text-left">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center text-green text-sm font-black">!</div>
                   <h3 className="font-syne text-xl font-black text-white uppercase tracking-tight">Need Sovereignty?</h3>
                </div>
                 <p className="font-dm-mono text-[13px] text-white/40 leading-relaxed font-black uppercase tracking-tighter">
                   For organizations requiring on-premise model execution, air-gapped security, or custom GPU cluster carving. Our Solutions Architects can architect a private ORCA node for your stack.
                </p>
             </div>
             <button className="whitespace-nowrap bg-white text-bg px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-green transition-all shadow-xl">Contact Engineering</button>
          </div>

          {/* Nexonic Ecosystem Section */}
          <div className="mt-24 up-anim opacity-0">
             <div className="text-left mb-12">
                <h2 className="font-syne text-3xl font-[800] text-white uppercase tracking-tight mb-2">Nexonic <span className="text-green">Ecosystem</span></h2>
                <p className="font-dm-mono text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Coordinated intelligence across every business layer.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[
                   { name: 'CyberGuard', icon: '🛡️', desc: 'Neural vulnerability scanning & autonomous fix PRs.', plan: 'Starter+' },
                   { name: 'Render.AI', icon: '🎬', desc: 'Generative video & creative production for marketing.', plan: 'Pro+' },
                   { name: 'Intuition', icon: '🧠', desc: 'HR truth-scoring for candidate verification.', plan: 'Pro+' },
                   { name: 'The Summit', icon: '🏔️', desc: 'Elite talent sourcing & headhunting network.', plan: 'Pro+' },
                   { name: 'Island of Relevancy', icon: '🌐', desc: 'Growth network for partnership coordination.', plan: 'Pro+' },
                ].map((item, idx) => (
                   <div key={idx} className="p-8 rounded-[2rem] border border-white/5 bg-surface/30 group hover:border-green/20 transition-all flex flex-col justify-between h-full">
                      <div>
                         <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                            {item.icon}
                         </div>
                         <h3 className="font-syne font-[800] text-white uppercase tracking-tight mb-2 leading-none">{item.name}</h3>
                         <p className="font-dm-mono text-[11px] text-white/40 leading-relaxed uppercase tracking-tighter mb-6">{item.desc}</p>
                      </div>
                      <span className="text-[9px] font-black text-green/60 uppercase tracking-widest px-2 py-1 bg-green/5 border border-green/10 rounded-full w-fit">
                         {item.plan}
                      </span>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
