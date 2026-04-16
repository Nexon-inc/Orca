'use client';

import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function UpgradePage() {
  
  const featuresFree = [
    'Test your first executives',
    '3 Departments max',
    '8 Agents limit',
    'Community support',
    'Standard execution speed'
  ];

  const featuresBuilder = [
    'FULL_EXECUTIVE_TEAM',
    'UNLIMITED_DEPARTMENTS',
    'UNLIMITED_AGENTS',
    'ATLAS_AI_CEO_MODE',
    'PRIORITY_EXECUTION',
    'CUSTOM_LLM_INTEGRATION'
  ];

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="upgrade" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-12 no-scrollbar">
          
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase inline-block border-b-2 border-primary-container pb-1">
              LICENSE_UPGRADE
            </h1>
            <p className="font-body text-sm text-on-secondary-container mt-4">
              Scale your autonomous workforce.
            </p>
          </div>

          {/* Founding Member Banner */}
          <div className="flex items-center justify-between px-6 py-5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg mb-12 shadow-[0_4px_24px_rgba(245,158,11,0.05)] mx-auto max-w-4xl">
            <div>
              <div className="text-[11px] font-black font-mono text-[#F59E0B] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <span>🔥</span> FOUNDING_MEMBER_OFFER
              </div>
              <div className="text-[12px] font-body text-on-secondary-container leading-relaxed">
                First 50 founders get Builder at <span className="text-on-surface font-black">$19/mo</span> locked forever. 
                <span className="text-[#F59E0B] font-black ml-1">14 spots remaining.</span>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-[#F59E0B] text-[#2d1a00] text-[9px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 hover:scale-105 transition-all whitespace-nowrap shadow-[0_4px_16px_rgba(245,158,11,0.2)]">
              CLAIM_SPOT →
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center gap-4 justify-center mb-12">
            <span className="text-[10px] font-mono text-on-surface/40 uppercase tracking-widest font-black">MONTHLY</span>
            <div className="relative">
              <input type="checkbox" id="billing-toggle" className="sr-only peer" defaultChecked />
              <label 
                htmlFor="billing-toggle" 
                className="w-11 h-6 bg-surface-container-high border border-primary-container/30 rounded-sm cursor-pointer peer-checked:bg-primary-container/20 block transition-all relative"
              >
                <span className="absolute top-1 left-1 w-4 h-4 bg-on-surface/30 peer-checked:bg-primary-container rounded-sm transition-all pointer-events-none peer-checked:translate-x-5"></span>
              </label>
            </div>
            <span className="text-[10px] font-mono text-primary-container uppercase tracking-widest font-black">ANNUAL</span>
            <span className="px-2 py-0.5 bg-primary-container/10 border border-primary-container/30 text-[8px] font-black text-primary-container uppercase tracking-widest rounded-sm inline-block shadow-[0_0_8px_rgba(0,255,135,0.2)]">
              SAVE 15%
            </span>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* FREE TIER */}
            <div className="bg-surface-container p-8 rounded-lg border border-outline-variant/10 flex flex-col h-full hover:border-outline-variant/30 transition-all">
              <div className="text-[10px] font-black font-mono text-on-surface/40 uppercase tracking-widest mb-3">
                FREE
              </div>
              <div className="text-[40px] leading-none font-black font-headline text-on-surface mb-2">
                $0
              </div>
              <div className="text-[10px] font-mono text-on-surface/30 uppercase tracking-widest mb-6">
                FOREVER
              </div>
              <div className="text-[11px] font-body text-on-secondary-container mb-8 leading-relaxed max-w-[200px]">
                Test your first executives and build foundational workflows.
              </div>
              
              <div className="space-y-4 mb-10 flex-1">
                {featuresFree.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] font-mono text-on-secondary-container tracking-wide">
                    <span className="text-on-surface/30 material-symbols-outlined text-xs">done</span>
                    {feat}
                  </div>
                ))}
              </div>
              
              <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest border border-outline-variant/20 text-on-surface/40 rounded-sm hover:border-primary-container/40 hover:text-on-surface transition-colors cursor-default mt-auto">
                CURRENT_PLAN
              </button>
            </div>

            {/* BUILDER TIER */}
            <div className="bg-surface-container p-8 rounded-lg border border-primary-container/40 flex flex-col h-full transform relative shadow-[0_8px_40px_rgba(0,255,135,0.05)] neon-glow mt-[-16px]">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary-container text-on-primary text-[9px] font-black uppercase tracking-widest rounded-sm shadow-[0_0_12px_rgba(0,255,135,0.4)]">
                MOST_POPULAR ⭐
              </div>
              
              <div className="text-[10px] font-black font-mono text-primary-container/60 uppercase tracking-widest mb-3 mt-2">
                BUILDER
              </div>
              <div className="text-[40px] leading-none font-black font-headline text-on-surface mb-2 flex items-end gap-2">
                $19 <span className="text-[14px] text-on-surface/40 mb-1 line-through">$49</span>
              </div>
              <div className="text-[10px] font-mono text-primary-container/60 uppercase tracking-widest mb-6">
                PER MONTH / BILLED ANNUALLY
              </div>
              <div className="text-[11px] font-body text-on-surface mb-8 leading-relaxed max-w-[200px]">
                Full autonomous operating system for founders and teams.
              </div>
              
              <div className="space-y-4 mb-10 flex-1">
                {featuresBuilder.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] font-black font-mono text-on-surface tracking-wider">
                    <span className="text-primary-container material-symbols-outlined text-[14px]">done</span>
                    {feat}
                  </div>
                ))}
              </div>
              
              <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest bg-primary-container text-on-primary rounded-sm hover:opacity-90 transition-all mt-auto shadow-[0_0_20px_rgba(0,255,135,0.3)]">
                UPGRADE_NOW
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
