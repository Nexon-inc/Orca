'use client';

import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import PricingModal from '@/components/PricingModal';
import { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [aiCeoMode, setAiCeoMode] = useState(false);
  const [org, setOrg] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const supabase = createClientSupabaseClient();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('org_members')
          .select('org_id, organizations(id, plan)')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => {
             if (data && data.organizations) {
               const orgData = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
               setOrg(orgData);
             }
          });
      }
    });

    // Check URL hash to open billing section by scrolling
    if (window.location.hash === '#billing') {
      setTimeout(() => {
         const el = document.getElementById('billing');
         if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const handleCancelSubscription = async () => {
    const isConfirmed = window.confirm("Are you sure you want to cancel your subscription? Your agents will be downgraded to the FREE tier at the end of the billing cycle.");
    if (isConfirmed) {
       try {
          const res = await fetch('/api/billing/cancel', { method: 'POST' });
          const data = await res.json();
          if (res.ok) {
            alert(data.message || "Cancellation request sent successfully.");
          } else {
            alert(data.error || "Failed to cancel subscription.");
          }
       } catch (err) {
          alert("A network error occurred.");
       }
    }
  };

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="settings" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-12 no-scrollbar">
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase inline-block border-b-2 border-primary-container pb-1">
              SETTINGS
            </h1>
            <p className="font-body text-sm text-on-secondary-container mt-4">
              Configure your command center and intelligent agents.
            </p>
          </div>

          <div className="max-w-2xl">
            {/* COMPANY SETTINGS */}
            <div className="text-[9px] font-black font-mono text-on-surface/30 uppercase tracking-[0.2em] mb-4 mt-10">
              COMPANY_CONTEXT
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
              <div>
                <div className="text-[13px] font-black font-label text-on-surface uppercase tracking-wide">
                  COMPANY_NAME
                </div>
                <div className="text-[11px] font-body text-on-surface/40 mt-0.5">
                  Your company name as it appears to your executive team
                </div>
              </div>
              <div className="w-64 border-b border-outline-variant/30 focus-within:border-primary-container/50 transition-colors">
                <input 
                  className="w-full bg-transparent text-[12px] font-mono text-on-surface border-none outline-none focus:ring-0 py-1" 
                  defaultValue="Nexonic Industries"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
              <div>
                <div className="text-[13px] font-black font-label text-on-surface uppercase tracking-wide">
                  INDUSTRY
                </div>
                <div className="text-[11px] font-body text-on-surface/40 mt-0.5">
                  Core market segment for intelligence tuning
                </div>
              </div>
              <div className="w-64 border-b border-outline-variant/30 focus-within:border-primary-container/50 transition-colors">
                <input 
                  className="w-full bg-transparent text-[12px] font-mono text-on-surface border-none outline-none focus:ring-0 py-1" 
                  defaultValue="B2B SAAS"
                />
              </div>
            </div>

            {/* AI CEO MODE */}
            <div className="text-[9px] font-black font-mono text-on-surface/30 uppercase tracking-[0.2em] mb-4 mt-12">
              AUTONOMOUS_OPERATIONS
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
              <div>
                <div className="text-[13px] font-black font-label text-on-surface uppercase">
                  AI_CEO_MODE
                </div>
                <div className="text-[11px] font-body text-on-surface/40 mt-0.5 max-w-sm">
                  ATLAS runs your executive team autonomously every Monday. 
                  You approve everything that matters.
                </div>
              </div>
              {/* Toggle */}
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="ai-ceo" 
                  className="sr-only peer" 
                  checked={aiCeoMode}
                  onChange={(e) => setAiCeoMode(e.target.checked)}
                />
                <label 
                  htmlFor="ai-ceo" 
                  className="w-11 h-6 bg-surface-container-high border border-outline-variant/20 rounded-sm cursor-pointer peer-checked:bg-primary-container/20 peer-checked:border-primary-container/40 transition-all block"
                ></label>
                {/* Indicator */}
                <span className={`absolute top-1 left-1 w-4 h-4 bg-on-surface/30 rounded-sm transition-all pointer-events-none ${aiCeoMode ? 'left-6 bg-primary-container shadow-[0_0_10px_rgba(0,255,135,0.5)]' : ''}`}>
                </span>
              </div>
            </div>

            {/* AI MODELS */}
            <div className="text-[9px] font-black font-mono text-on-surface/30 uppercase tracking-[0.2em] mb-4 mt-12">
              AI_MODELS
            </div>

            <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
              <div>
                <div className="text-[13px] font-black font-label text-on-surface uppercase tracking-wide">
                  DEFAULT_LLM
                </div>
                <div className="text-[11px] font-body text-on-surface/40 mt-0.5">
                  The model powering your executive intelligence
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-primary-container/10 border border-primary-container/40 text-primary-container text-[10px] font-black uppercase tracking-widest rounded-sm">
                  ORCA_CORE_4.6
                </button>
                <button className="px-3 py-1 bg-surface-container border border-outline-variant/30 text-on-surface/40 hover:text-on-surface text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors">
                  GPT-4O
                </button>
              </div>
            </div>

            {/* BILLING AND SUBSCRIPTION */}
            <div id="billing" className="text-[9px] font-black font-mono text-on-surface/30 uppercase tracking-[0.2em] mb-4 mt-12 scroll-mt-24">
              BILLING_AND_SUBSCRIPTION
            </div>

            <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
              <div>
                <div className="text-[13px] font-black font-label text-on-surface uppercase tracking-wide">
                  CURRENT_PLAN
                </div>
                <div className="text-[11px] font-body text-on-surface/40 mt-0.5">
                  Your active executive tier: <span className="font-black text-primary-container uppercase ml-1">{org?.plan || 'FREE'}</span>
                </div>
              </div>
              <button 
                 onClick={() => setShowPricingModal(true)}
                 className="px-4 py-1.5 border border-outline-variant/30 text-[9px] font-black text-on-surface uppercase tracking-widest rounded-sm hover:border-primary-container/40 hover:text-primary-container hover:bg-primary-container/5 transition-colors pointer"
              >
                 UPGRADE →
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
              <div>
                <div className="text-[13px] font-black font-label text-on-surface uppercase tracking-wide">
                  CANCEL_SUBSCRIPTION
                </div>
                <div className="text-[11px] font-body text-on-surface/40 mt-0.5 max-w-sm">
                  Cancel your active plan. Your agents will be downgraded to the FREE tier at the end of the billing cycle.
                </div>
              </div>
              <button 
                onClick={handleCancelSubscription}
                className="px-4 py-1.5 border border-error/30 text-[9px] font-black text-error uppercase tracking-widest rounded-sm hover:border-error hover:bg-error/10 transition-colors pointer"
              >
                CANCEL_PLAN
              </button>
            </div>

            {/* DANGER ZONE */}
            <div className="text-[9px] font-black font-mono text-error/40 uppercase tracking-[0.2em] mb-4 mt-12">
              DANGER_ZONE
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-error/10">
              <div>
                <div className="text-[13px] font-black font-label text-on-surface uppercase tracking-wide">
                  DELETE_ACCOUNT
                </div>
                <div className="text-[11px] font-body text-on-surface/40 mt-0.5">
                  Permanently remove your company and agents
                </div>
              </div>
              <button className="px-4 py-1.5 border border-error/30 text-[9px] font-black text-error uppercase tracking-widest rounded-sm hover:border-error hover:bg-error/10 transition-colors pointer">
                DELETE →
              </button>
            </div>

          </div>
        </div>
      </main>

      {showPricingModal && (
        <PricingModal 
          isOpen={showPricingModal} 
          onClose={() => setShowPricingModal(false)} 
          isLocked={false}
          currentPlan={org?.plan}
        />
      )}
    </div>
  );
}
