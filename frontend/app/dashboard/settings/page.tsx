'use client';

import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useState } from 'react';

export default function SettingsPage() {
  const [aiCeoMode, setAiCeoMode] = useState(false);

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
    </div>
  );
}
