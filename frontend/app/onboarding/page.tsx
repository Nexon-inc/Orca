'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { animate } from 'animejs';
import { matchTemplate } from '@/lib/templates/matchTemplate';

const steps = [
  { id: 0, name: 'Deployment Brief', detail: 'It will only take 5 minutes to fill out info about your company.' },
  { id: 1, name: 'Company Profile', detail: 'Define your mission, industry, and target audience.' },
  { id: 2, name: 'Org Architecture', detail: 'Select a department or a pre-built company template.' },
  { id: 3, name: 'Protocol Alpha', detail: 'Set the governance and execution boundaries for your agents.' },
  { id: 4, name: 'Final Sync', detail: 'Review your configuration and launch your dashboard.' },
];

const INDUSTRIES = [
  'SaaS / Software', 'E-commerce', 'Marketing Agency', 'Hiring & Recruitment', 'Financial Services', 
  'Healthcare & MedTech', 'Real Estate', 'Education / EdTech', 'Manufacturing', 'Logistics & Supply Chain',
  'Legal Services', 'Hospitality', 'Media & Entertainment', 'Cybersecurity', 'AI & Machine Learning',
  'Renewable Energy', 'Retail', 'Consulting / Professional Services', 'Gaming', 'Non-profit'
];

const TEMPLATES = [
  { slug: 'saas-startup', name: 'SaaS Startup', category: 'Startup', agents: '16', depts: '4', icon: '🚀', description: 'Lean setup for early-stage software companies.' },
  { slug: 'marketing-agency', name: 'Content Marketing Agency', category: 'Marketing', agents: '18', depts: '4', icon: '📣', description: 'Optimized for high-volume content production.' },
  { slug: 'ecommerce-operator', name: 'E-commerce Operator', category: 'E-commerce', agents: '19', depts: '4', icon: '🛒', description: 'Full stack management for online stores.' },
  { slug: 'recruiting-firm', name: 'Recruiting Firm', category: 'Hiring', agents: '17', depts: '4', icon: '💼', description: 'Talent sourcing and verification pipeline.' },
  { slug: 'dev-agency', name: 'Dev Agency', category: 'Technology', agents: '19', depts: '4', icon: '🛠️', description: 'Agile development and security-first ops.' },
  { slug: 'intel-desk', name: 'Intelligence & Research Desk', category: 'Research', agents: '15', depts: '3', icon: '🔍', description: 'Deep market research and competitor tracking.' }
];

const DEPARTMENTS = [
  { id: 'marketing', name: 'Marketing', icon: '📣', desc: 'Content, social, SEO, and brand voice.' },
  { id: 'sales', name: 'Sales & Revenue', icon: '💰', desc: 'Lead prospecting and CRM management.' },
  { id: 'customer', name: 'Customer Success', icon: '🤝', desc: 'Onboarding, retention, and support.' },
  { id: 'tech', name: 'Tech & Security', icon: '🛡️', desc: 'Code reviews, deployments, and security.' },
  { id: 'people', name: 'People & Hiring', icon: '🧠', desc: 'Sourcing, screening, and offer coordination.' },
  { id: 'ops', name: 'Operations', icon: '📋', desc: 'Project management and inbox automation.' },
  { id: 'finance', name: 'Finance & Legal', icon: '📊', desc: 'Invoicing, contracts, and budgeting.' },
  { id: 'intelligence', name: 'Intelligence', icon: '🔍', desc: 'Market research and competitor tracking.' },
  { id: 'community', name: 'Community', icon: '🌐', desc: 'Growth experiments and partnerships.' }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyInfo, setCompanyInfo] = useState({ name: '', website: '', mission: '', industry: 'SaaS / Software', targetICP: '' });
  const [selectionType, setSelectionType] = useState<'department' | 'template' | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [operatingMode, setOperatingMode] = useState('Approve First');
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [suggestedTemplateSlug, setSuggestedTemplateSlug] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    animate('.onboarding-anim', {
      opacity: [0, 1],
      y: [30, 0],
      duration: 1000,
      ease: 'outExpo'
    });
  }, [currentStep, isTemplateGalleryOpen]);

  const handleNext = async () => {
    // Save current step data to backend before advancing
    const stepPayloads: Record<number, any> = {
      1: { // Step 1: Company Profile
        company_name: companyInfo.name,
        mission: companyInfo.mission,
        industry: companyInfo.industry,
        icp: companyInfo.targetICP,
      },
      2: { // Step 2: Org Architecture
        template_slug: selectedTemplate?.slug || null,
        selected_departments: selectedDept ? [selectedDept] : null,
      },
      3: { // Step 3: Protocol — operating mode
        agent_mode: operatingMode === 'Autopilot' ? 'autopilot' :
                   operatingMode === 'Suggest Only' ? 'suggest_only' : 'approve_first',
      },
    };

    if (stepPayloads[currentStep]) {
      try {
        await fetch('/api/onboarding/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: currentStep, data: stepPayloads[currentStep] }),
        });
      } catch (err) {
        console.error('Failed to save onboarding step:', err);
        // Continue anyway — don't block the user
      }
    }

    if (currentStep === 1) {
      // Going into Step 2: run matching logic
      setSuggestedTemplateSlug(matchTemplate(companyInfo));
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 5 — complete
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 5, data: {} }),
      }).catch(() => {});

      animate('.main-box', {
        scale: 0.95,
        opacity: 0,
        duration: 800,
        ease: 'inExpo',
        onComplete: () => {
           router.push('/dashboard');
        }
      });
    }
  };

  const handleSkipToDashboard = () => {
    router.push('/dashboard');
  };

  const selectDept = (dept: string) => {
    setSelectionType('department');
    setSelectedDept(dept);
    setSelectedTemplate(null); // XOR Logic
  };

  const selectTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectionType('template');
    setSelectedTemplate(template);
    setSelectedDept(null); // XOR Logic
    setIsTemplateGalleryOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg text-text-body font-dm-mono flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-5 text-green">
        <div className="w-full h-full bg-current filter blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl w-full main-box">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-syne text-[11px] font-bold text-green uppercase tracking-[0.3em] mb-4">ORCA Deployment Protocol Alpha</h2>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden w-64 mx-auto">
            <div 
              className="h-full bg-green transition-all duration-700 ease-out shadow-[0_0_15px_rgba(0,255,135,0.6)]" 
              style={{ width: `${(currentStep / 4) * 100}%` }} 
            />
          </div>
        </div>

        {/* Content Box */}
        <div className="onboarding-anim bg-surface/50 border border-white/5 rounded-[3.5rem] p-8 sm:p-16 flex flex-col backdrop-blur-xl relative overflow-hidden group min-h-[600px]">
           <div className="absolute top-0 right-0 p-12 text-[15rem] font-syne font-black opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
              0{currentStep}
           </div>

           <div className="flex-1 relative z-10 flex flex-col h-full">
              <span className="inline-block px-3 py-1 rounded-full bg-green/10 border border-green/20 text-green font-dm-mono text-[9px] uppercase tracking-widest mb-6">
                Execution Tier 0{currentStep}
              </span>
              
              <h1 className="font-syne text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-none uppercase">
                 {steps[currentStep].name}
              </h1>
              
              <p className="font-dm-mono text-text-muted text-[14px] mb-10 leading-relaxed opacity-70 max-w-2xl text-pretty">
                 {steps[currentStep].detail}
              </p>

              {/* Step UI Content */}
              <div className="flex-1 mb-10">
                {currentStep === 0 && (
                  <div className="space-y-8 py-4">
                    <p className="text-white text-lg font-syne font-bold border-l-2 border-green pl-4">
                      Initiating secure configuration sequence. 
                    </p>
                    <div className="space-y-4">
                      <h4 className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-4">Onboarding Sequence:</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {steps.slice(1).map((s, idx) => (
                          <li key={s.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="w-6 h-6 rounded-full bg-green/20 text-green flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                            <span className="text-[12px] text-white/80 font-bold uppercase">{s.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Company Name</label>
                       <input 
                         type="text" 
                         placeholder="Nexonic Industries" 
                         className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 transition-all outline-none" 
                         value={companyInfo.name}
                         onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Website (Optional)</label>
                       <input 
                         type="text" 
                         placeholder="https://nexonic.ai" 
                         className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 transition-all outline-none" 
                         value={companyInfo.website}
                         onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                       <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Company Mission</label>
                       <textarea 
                        rows={2} 
                        placeholder="Automating the future of enterprise coordination..." 
                        className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 transition-all outline-none resize-none" 
                        value={companyInfo.mission}
                        onChange={(e) => setCompanyInfo({...companyInfo, mission: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Industry</label>
                       <select 
                      className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      value={companyInfo.industry}
                      onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                    >
                      {INDUSTRIES.map(ind => (
                        <option key={ind} value={ind} className="bg-[#0c140e] text-white py-2">{ind}</option>
                      ))}
                    </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Target Customer (ICP)</label>
                       <input 
                         type="text" 
                         placeholder="B2B Founders, Early Adopters" 
                         className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none" 
                         value={companyInfo.targetICP}
                         onChange={(e) => setCompanyInfo({...companyInfo, targetICP: e.target.value})}
                       />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8 pb-8">
                    {!isTemplateGalleryOpen ? (
                      <div className="flex flex-col gap-10">
                        {suggestedTemplateSlug && !selectedTemplate && !selectedDept ? (
                          // Match Found Banner
                          <div className="p-8 rounded-[2rem] bg-surface/50 border border-green/30 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-green/5 opacity-50 pointer-events-none" />
                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                              <span className="text-8xl">🏪</span>
                            </div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-xl">🏪</span>
                                <h4 className="text-[14px] text-white font-black uppercase tracking-widest text-syne">We found a template for you</h4>
                              </div>
                              <p className="text-[12px] text-white/70 font-dm-mono leading-relaxed max-w-xl mb-8">
                                The <strong className="text-white">{TEMPLATES.find(t => t.slug === suggestedTemplateSlug)?.name}</strong> template matches your configuration. 
                                It activates {TEMPLATES.find(t => t.slug === suggestedTemplateSlug)?.depts} departments and {TEMPLATES.find(t => t.slug === suggestedTemplateSlug)?.agents} agents with recommended operating modes and Day 1 briefs ready to send.
                              </p>
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button 
                                  onClick={() => selectTemplate(TEMPLATES.find(t => t.slug === suggestedTemplateSlug)!)}
                                  className="w-full sm:w-auto px-8 py-4 rounded-xl btn-primary text-[11px] font-black uppercase tracking-widest"
                                >
                                  Use {TEMPLATES.find(t => t.slug === suggestedTemplateSlug)?.name} Template →
                                </button>
                                <button 
                                  onClick={() => setSuggestedTemplateSlug(null)}
                                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-widest transition-all"
                                >
                                  Build Manually
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Standard Grid when no match or user bypassed matching
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Department Selection */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] text-white/40 font-black uppercase tracking-widest">Choose 1 Department</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {DEPARTMENTS.map(d => (
                              <button 
                                key={d.id}
                                onClick={() => selectDept(d.name)}
                                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all group ${selectedDept === d.name ? 'bg-green border-green shadow-[0_5px_20px_rgba(0,255,135,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.08]'}`}
                              >
                                <span className={`text-xl ${selectedDept === d.name ? 'text-bg' : 'text-green group-hover:scale-110 transition-transform'}`}>{d.icon}</span>
                                <div>
                                  <h5 className={`text-[11px] font-black uppercase tracking-wider mb-1 ${selectedDept === d.name ? 'text-bg' : 'text-white'}`}>{d.name}</h5>
                                  <p className={`text-[9px] font-medium leading-tight line-clamp-2 ${selectedDept === d.name ? 'text-bg/70' : 'text-white/40'}`}>{d.desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Template Selection */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] text-white/40 font-black uppercase tracking-widest">OR Choose 1 Template</h4>
                          {selectedTemplate ? (
                            <div className="p-8 rounded-3xl bg-green/10 border border-green/30 relative group/sel flex flex-col items-center text-center">
                              <span className="text-5xl mb-6 block animate-bounce-slow">{selectedTemplate.icon}</span>
                              <h5 className="text-white font-syne font-black uppercase text-lg mb-2">{selectedTemplate.name}</h5>
                              <p className="text-[11px] text-text-muted opacity-70 mb-8 max-w-xs uppercase tracking-wide">{selectedTemplate.description}</p>
                              <button 
                                onClick={() => setIsTemplateGalleryOpen(true)}
                                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-green font-black uppercase tracking-[0.2em] hover:bg-green hover:text-bg hover:border-green transition-all"
                              >
                                Change Template
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setIsTemplateGalleryOpen(true)}
                              className="w-full aspect-square md:aspect-auto md:h-full rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-6 hover:bg-white/10 hover:border-white/30 transition-all group overflow-hidden relative"
                            >
                              <div className="absolute inset-0 bg-green opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                              <span className="text-5xl group-hover:scale-110 transition-transform duration-500">🏪</span>
                              <div className="text-center">
                                <span className="text-[12px] text-white font-black uppercase tracking-[0.2em] block mb-2">Browse Template Hub</span>
                                <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Accelerate with pre-built stacks</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                       )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <h4 className="text-[12px] text-white font-black uppercase tracking-widest">Select a Company Template</h4>
                            <p className="text-[9px] text-text-muted uppercase tracking-widest mt-1">Single-click activation protocol</p>
                          </div>
                          <button 
                            onClick={() => setIsTemplateGalleryOpen(false)} 
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/60 hover:text-white hover:bg-white/10 uppercase font-black tracking-widest transition-all"
                          >
                            Go Back
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {TEMPLATES.map(t => (
                            <div 
                              key={t.slug}
                              onClick={() => selectTemplate(t)}
                              className="p-6 rounded-[2rem] bg-bg border border-white/5 hover:border-green/40 hover:bg-white/[0.03] cursor-pointer transition-all group relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] group-hover:scale-110 transition-all">
                                <span className="text-4xl">{t.icon}</span>
                              </div>
                              <span className="text-3xl mb-4 block">{t.icon}</span>
                              <h5 className="text-white font-syne font-black text-[13px] uppercase mb-2 tracking-tight group-hover:text-green transition-colors">{t.name}</h5>
                              <p className="text-[10px] text-text-muted opacity-60 leading-relaxed mb-4">{t.description}</p>
                              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <span className="text-[8px] text-white/30 font-bold uppercase">{t.depts} Departments</span>
                                <span className="text-[8px] text-green font-bold uppercase">{t.agents} Agents</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="flex flex-col gap-4 py-4">
                    {[
                      { id: 'Autopilot', name: 'AUTOPILOT', desc: 'Agents execute and report back. Maximum velocity.', brief: 'In this mode, your agents are empowered to take actions immediately based on their objectives. You will receive a summary of completed tasks. Best for experienced users and low-risk workflows.' },
                      { id: 'Approve First', name: 'APPROVE GATED', desc: 'CEO must sign off on all external actions. High security.', brief: 'Agents will draft all messages, social posts, and transactions, but will wait for your explicit approval before sending. Ensures 100% control over your brand voice and budget.' },
                      { id: 'Suggest Only', name: 'SUGGEST ONLY', desc: 'Agents draft solutions but never execute. High control.', brief: 'Agents function as a strategic brain, providing research and drafts within the dashboard. They will never attempt to perform actions on your behalf, even with approval.' },
                    ].map(mode => (
                      <div 
                        key={mode.id}
                        onClick={() => setOperatingMode(mode.id)}
                        className={`p-8 rounded-[2.5rem] border flex flex-col sm:flex-row sm:items-center justify-between gap-8 cursor-pointer transition-all ${
                          operatingMode === mode.id ? 'bg-green/10 border-green/30 shadow-[0_10px_40px_rgba(0,255,135,0.15)] scale-[1.02]' : 'border-white/5 bg-bg/50 opacity-40 hover:opacity-100 hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex-1">
                          <h4 className={`font-syne font-black text-[16px] uppercase tracking-tight mb-2 transition-colors ${operatingMode === mode.id ? 'text-green' : 'text-white'}`}>{mode.name}</h4>
                          <p className={`text-[11px] font-black uppercase mb-4 tracking-widest ${operatingMode === mode.id ? 'text-white' : 'text-white/60'}`}>{mode.desc}</p>
                          <p className="text-[11px] text-white/40 leading-relaxed max-w-2xl font-medium">{mode.brief}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${operatingMode === mode.id ? 'border-green bg-green' : 'border-white/10 group-hover:border-white/30'}`}>
                           {operatingMode === mode.id && <div className="w-3.5 h-3.5 rounded-full bg-bg shadow-inner shadow-black/40" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-10 py-4">
                    <div className="text-center">
                      <h3 className="font-syne font-black text-green text-3xl mb-3 uppercase italic tracking-tighter animate-pulse">Congratulations!</h3>
                      <p className="text-white/60 text-[14px] italic font-medium uppercase tracking-widest">Your autonomous workforce is staged and ready for synchronization.</p>
                    </div>

                    <div className="bg-bg border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5 text-green text-8xl">⚡</div>
                      <h4 className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] border-b border-white/5 pb-6">Final Deployment Manifest</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest block mb-2">Primary Entity</span>
                            <p className="text-white font-syne font-bold text-[18px] uppercase tracking-tight">{companyInfo.name || 'Nexonic Corp'}</p>
                            <p className="text-[11px] text-green font-black uppercase tracking-wider mt-1">{companyInfo.industry}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest block mb-2">Strategic Mandate</span>
                            <p className="text-[12px] text-white/60 leading-relaxed italic border-l-2 border-green/30 pl-4">"{companyInfo.mission || 'To coordinate the future...'}"</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest block mb-2">Core Architecture</span>
                            {selectionType === 'template' ? (
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{selectedTemplate?.icon}</span>
                                <div>
                                  <span className="text-white font-syne font-bold text-[15px] uppercase block leading-none">{selectedTemplate?.name}</span>
                                  <span className="text-[9px] text-text-muted font-bold uppercase mt-1 block">Full Stack Template</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center text-xl text-green border border-green/20">
                                   {DEPARTMENTS.find(d => d.name === selectedDept)?.icon || '🏢'}
                                </span>
                                <div>
                                  <span className="text-white font-syne font-bold text-[15px] uppercase block leading-none">{selectedDept || 'Marketing'} Unit</span>
                                  <span className="text-[9px] text-text-muted font-bold uppercase mt-1 block">Individual Department</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest block mb-1">Execution Guardrails</span>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green/10 border border-green/20 text-green font-black text-[11px] uppercase tracking-widest mt-2 ring-4 ring-green/5">
                              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                              {operatingMode}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto pt-8 border-t border-white/5 relative">
                 <div className="flex items-center gap-4 mr-auto">
                    {currentStep > 0 && (
                      <button 
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="text-[11px] text-text-muted hover:text-white transition-all uppercase tracking-[0.3em] font-black py-4 px-2"
                      >
                        ← Back
                      </button>
                    )}
                    {currentStep === 0 && (
                      <button 
                        onClick={handleSkipToDashboard}
                        className="text-[11px] text-text-muted hover:text-white transition-all uppercase tracking-[0.3em] font-black hover:translate-x-1 py-4"
                      >
                        Skip to Dashboard
                      </button>
                    )}
                 </div>
                 
                 <button 
                   onClick={handleNext}
                   disabled={currentStep === 2 && !selectedDept && !selectedTemplate}
                   className={`px-16 py-6 text-[13px] font-black rounded-2xl uppercase tracking-[0.2em] transition-all duration-300 relative group/btn ${currentStep === 2 && !selectedDept && !selectedTemplate ? 'opacity-20 cursor-not-allowed bg-white/5 text-white/40' : 'btn-primary hover:scale-[1.05] hover:shadow-[0_20px_50px_rgba(0,255,135,0.4)] active:scale-[0.98]'}`}
                 >
                    <span className="relative z-10">{currentStep === 4 ? 'Launch Workforce' : 'Continue Sequence'}</span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 rounded-full scale-x-0 group-hover/btn:scale-x-75 transition-transform duration-500" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
