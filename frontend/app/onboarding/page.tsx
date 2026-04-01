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
  { slug: 'saas-startup', name: 'SaaS Startup', category: 'Startup', agents: '6', depts: '5', icon: 'ðŸš€', description: 'Lean setup for early-stage software companies.' },
  { slug: 'marketing-agency', name: 'Content Marketing Agency', category: 'Marketing', agents: '6', depts: '5', icon: 'ðŸ“£', description: 'Optimized for high-volume content production.' },
  { slug: 'ecommerce-operator', name: 'E-commerce Operator', category: 'E-commerce', agents: '6', depts: '5', icon: 'ðŸ›’', description: 'Full stack management for online stores.' },
  { slug: 'recruiting-firm', name: 'Recruiting Firm', category: 'Hiring', agents: '6', depts: '5', icon: 'ðŸ’¼', description: 'Talent sourcing and verification pipeline.' },
  { slug: 'dev-agency', name: 'Dev Agency', category: 'Technology', agents: '6', depts: '5', icon: 'ðŸ› ï¸', description: 'Agile development and security-first ops.' },
  { slug: 'intel-desk', name: 'Intelligence & Research Desk', category: 'Research', agents: '6', depts: '5', icon: 'ðŸ”', description: 'Deep market research and competitor tracking.' }
];

const DEPARTMENTS = [
  { id: 'marketing', name: 'Marketing', icon: 'ðŸ“£', desc: 'Content, social, SEO, and brand voice.' },
  { id: 'sales', name: 'Sales & Revenue', icon: 'ðŸ’°', desc: 'Lead prospecting and CRM management.' },
  { id: 'cs', name: 'Customer Success', icon: 'ðŸ¤', desc: 'Onboarding, retention, and support.' },
  { id: 'tech', name: 'Tech & Vibe Coding', icon: 'ðŸ›¡ï¸', desc: 'Code reviews, deployments, and security.' },
  { id: 'intel', name: 'Intelligence & Research', icon: 'ðŸ”', desc: 'Market research and competitor tracking.' },
  { id: 'hiring', name: 'People & Hiring', icon: 'ðŸ§ ', desc: 'Sourcing, screening, and offer coordination.', comingSoon: true },
  { id: 'ops', name: 'Operations', icon: 'ðŸ“‹', desc: 'Project management and inbox automation.', comingSoon: true },
  { id: 'finance', name: 'Finance & Legal', icon: 'ðŸ“Š', desc: 'Invoicing, contracts, and budgeting.', comingSoon: true },
  { id: 'community', name: 'Community', icon: 'ðŸŒ', desc: 'Growth experiments and partnerships.', comingSoon: true }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyInfo, setCompanyInfo] = useState({ name: '', website: '', mission: '', industry: 'SaaS / Software', icp: '' });
  const [selectionType, setSelectionType] = useState<'department' | 'template' | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [operatingMode, setOperatingMode] = useState('Approve First');
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [suggestedTemplateSlug, setSuggestedTemplateSlug] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [techMode, setTechMode] = useState<'build_for_me' | 'build_with_me'>('build_for_me');
  const [showTechModePicker, setShowTechModePicker] = useState(false);
  
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
      0: { selected_plan: selectedPlan || 'starter' },
      1: { // Step 1: Company Profile
        company_name: companyInfo.name,
        mission: companyInfo.mission,
        industry: companyInfo.industry,
        icp: companyInfo.icp,
      },
      2: { // Step 2: Org Architecture
        template_slug: selectedTemplate?.slug || null,
        selected_departments: selectedDepts.length > 0 ? selectedDepts : null,
      },
      3: { // Step 3: Protocol Alpha â€” operating mode
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
        // Continue anyway â€” don't block the user
      }
    }

    if (currentStep === 1) {
      // Going into Step 2: run matching logic
      setSuggestedTemplateSlug(matchTemplate(companyInfo));
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 4 â€” complete (Final Sync)
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 6, data: {} }), // final completion signal
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
  const toggleDept = (dept: string) => {
    setSelectionType('department');
    setSelectedTemplate(null);
    
    // Plan restrictions
    const maxDepts = selectedPlan === 'free' ? 2 : 5;

    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
      if (dept === 'tech') setShowTechModePicker(false);
    } else {
      if (selectedDepts.length < maxDepts) {
        setSelectedDepts([...selectedDepts, dept]);
        if (dept === 'tech') setShowTechModePicker(true);
      }
    }
  };

  const selectTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectionType('template');
    setSelectedTemplate(template);
    setSelectedDepts([]); // XOR Logic
    setIsTemplateGalleryOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg text-text-body font-dm-mono flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.04] bg-green rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-3xl w-full main-box">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-dm-mono text-[10px] font-bold text-green uppercase tracking-[0.3em] mb-4 opacity-80">Deployment Protocol Alpha</h2>
          <div className="h-[2px] bg-white/5 rounded-full overflow-hidden w-64 mx-auto">
            <div 
              className="h-full bg-green/60 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,255,135,0.4)]" 
              style={{ width: `${(currentStep / 4) * 100}%` }} 
            />
          </div>
        </div>

        {/* Content Box */}
        <div className="onboarding-anim bg-surface/50 border border-white/5 rounded-2xl p-8 sm:p-12 flex flex-col backdrop-blur-sm relative overflow-hidden group min-h-[500px]">
           {/* Top edge glow */}
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

           <div className="absolute top-0 right-0 p-8 text-[12rem] font-syne font-bold opacity-[0.02] pointer-events-none transition-opacity">
              0{currentStep}
           </div>

           <div className="flex-1 relative z-10 flex flex-col h-full">
              <span className="inline-block self-start px-3 py-1 rounded-full bg-green/5 border border-green/10 text-green font-dm-mono text-[10px] uppercase tracking-[0.2em] mb-6">
                Execution Tier 0{currentStep}
              </span>
              
              <h1 className="font-syne text-3xl font-bold text-white mb-3 tracking-tight">
                 {steps[currentStep].name}
              </h1>
              
              <p className="font-dm-mono text-[13px] text-text-muted mb-10 leading-relaxed max-w-xl text-pretty">
                 {steps[currentStep].detail}
              </p>

              {/* Step UI Content */}
              <div className="flex-1 mb-10">
                {currentStep === 0 && (
                  <div className="space-y-8 py-2">
                    <p className="font-dm-mono text-[13px] text-white/80 leading-relaxed border-l-2 border-green/50 pl-4 bg-green/5 py-3 pr-4 rounded-r-xl">
                      Initiating secure configuration sequence to deploy your automated workforce.
                    </p>
                    <div className="space-y-4">
                      <h4 className="font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">Onboarding Sequence</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {steps.slice(1).map((s, idx) => (
                          <li key={s.id} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <span className="w-5 h-5 rounded bg-green/10 text-green flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                            <span className="font-syne text-[14px] text-white/80 font-bold">{s.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Company Name</label>
                       <input 
                         type="text" 
                         placeholder="Nexonic Industries" 
                         className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-dm-mono text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all" 
                         value={companyInfo.name}
                         onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Website (Optional)</label>
                       <input 
                         type="text" 
                         placeholder="https://nexonic.ai" 
                         className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-dm-mono text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all" 
                         value={companyInfo.website}
                         onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                       <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Company Mission</label>
                       <textarea 
                        rows={2} 
                        placeholder="Automating the future of enterprise coordination..." 
                        className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-dm-mono text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all resize-none" 
                        value={companyInfo.mission}
                        onChange={(e) => setCompanyInfo({...companyInfo, mission: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Industry</label>
                       <select 
                      className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-dm-mono text-[13px] text-white focus:outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all cursor-pointer appearance-none"
                      style={{ colorScheme: 'dark' }}
                      value={companyInfo.industry}
                      onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                    >
                      {INDUSTRIES.map(ind => (
                        <option key={ind} value={ind} className="bg-[#070d08] text-white">{ind}</option>
                      ))}
                    </select>
                    </div>
                    <div className="space-y-2">
                       <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Target Customer (ICP)</label>
                       <input 
                         type="text" 
                         placeholder="B2B Founders, Early Adopters" 
                         className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-dm-mono text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all" 
                         value={companyInfo.icp}
                         onChange={(e) => setCompanyInfo({...companyInfo, icp: e.target.value})}
                       />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8 pb-4">
                    {!isTemplateGalleryOpen ? (
                      <div className="flex flex-col gap-8">
                        {suggestedTemplateSlug && !selectedTemplate && selectedDepts.length === 0 ? (
                          // Match Found Banner
                          <div className="p-8 rounded-2xl bg-surface/50 border border-green/20 relative overflow-hidden group backdrop-blur-sm">
                            <div className="absolute inset-0 bg-green/5 opacity-50 pointer-events-none" />
                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                              <span className="text-8xl">ðŸª</span>
                            </div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-xl">ðŸª</span>
                                <h4 className="font-syne text-[15px] text-white font-bold">Template Found</h4>
                              </div>
                              <p className="font-dm-mono text-[13px] text-text-muted leading-relaxed max-w-xl mb-6">
                                The <strong className="text-white">{TEMPLATES.find(t => t.slug === suggestedTemplateSlug)?.name}</strong> template matches your configuration. 
                                It activates {TEMPLATES.find(t => t.slug === suggestedTemplateSlug)?.depts} departments and {TEMPLATES.find(t => t.slug === suggestedTemplateSlug)?.agents} agents with recommended operating modes and Day 1 briefs ready to send.
                              </p>
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button 
                                  onClick={() => selectTemplate(TEMPLATES.find(t => t.slug === suggestedTemplateSlug)!)}
                                  className="w-full sm:w-auto px-6 py-3 rounded-xl btn-primary font-syne text-[13px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
                                >
                                  Use {TEMPLATES.find(t => t.slug === suggestedTemplateSlug)?.name} â†’
                                </button>
                                <button 
                                  onClick={() => setSuggestedTemplateSlug(null)}
                                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-white hover:bg-white/10 font-syne text-[13px] font-bold uppercase tracking-widest transition-all"
                                >
                                  Deploy Custom Departments
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Standard Grid when no match or user bypassed matching
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Department Selection */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">
                                  <span>{selectedDepts.length} / {selectedPlan === 'free' ? '2' : '5'} Selected</span>
                                  {selectedPlan === 'free' && <span>Free Plan Limit: 2</span>}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {DEPARTMENTS.map(d => {
                                  const isSelected = selectedDepts.includes(d.id);
                                  const isLocked = !!d.comingSoon;
                                  
                                  return (
                                    <button 
                                      key={d.id}
                                      disabled={isLocked}
                                      onClick={() => toggleDept(d.id)}
                                      className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all group relative ${isSelected ? 'bg-green/10 border-green/30 shadow-[0_5px_15px_rgba(0,255,135,0.1)]' : isLocked ? 'opacity-30 grayscale cursor-not-allowed bg-black/20' : 'bg-surface/50 border-white/5 hover:border-white/20 hover:bg-white/[0.03]'}`}
                                    >
                                      <span className={`text-xl ${isSelected ? 'grayscale-0' : isLocked ? 'grayscale opacity-50' : 'grayscale group-hover:grayscale-0 transition-all'}`}>{d.icon}</span>
                                      <div className="flex flex-col">
                                        <h5 className={`font-syne text-[13px] font-bold mb-1 ${isSelected ? 'text-green' : isLocked ? 'text-white/20' : 'text-white group-hover:text-green transition-colors'}`}>{d.name}</h5>
                                        <p className="font-dm-mono text-[10px] text-text-muted leading-tight line-clamp-2">{isLocked ? 'Protocol Staged (Coming Soon)' : d.desc}</p>
                                      </div>
                                      {isLocked && (
                                        <div className="absolute top-2 right-2 text-[10px] opacity-40">ðŸ”’</div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Template Selection */}
                            <div className="space-y-4">
                              <h4 className="font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">OR Choose 1 Template</h4>
                              {selectedTemplate ? (
                                <div className="p-8 rounded-2xl bg-green/5 border border-green/20 relative group flex flex-col items-center text-center h-full justify-center">
                                  <span className="text-4xl mb-4 block animate-bounce-slow">{selectedTemplate.icon}</span>
                                  <h5 className="font-syne text-[16px] text-white font-bold mb-2">{selectedTemplate.name}</h5>
                                  <p className="font-dm-mono text-[12px] text-text-muted mb-6 max-w-[200px]">{selectedTemplate.description}</p>
                                  <button 
                                    onClick={() => setIsTemplateGalleryOpen(true)}
                                    className="px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 font-syne text-[11px] text-white hover:bg-white/10 transition-all uppercase tracking-widest font-bold"
                                  >
                                    Change Template
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setIsTemplateGalleryOpen(true)}
                                  className="w-full h-full min-h-[200px] rounded-2xl bg-surface/30 border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/[0.03] hover:border-white/20 transition-all group overflow-hidden relative"
                                >
                                  <div className="absolute inset-0 bg-green opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                                  <span className="text-3xl grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300">ðŸª</span>
                                  <div className="text-center">
                                    <span className="font-syne text-[14px] text-white font-bold block mb-1">Browse Template Hub</span>
                                    <span className="font-dm-mono text-[10px] text-text-muted uppercase tracking-[0.2em]">Pre-built workflows</span>
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Tech Mode Selection Overlay */}
                        {showTechModePicker && (
                          <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-green/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                              <span className="text-2xl">ðŸ›¡ï¸</span>
                              <div>
                                <h4 className="font-syne font-bold text-white text-[15px]">Tech Department: Vibe Coding Mode</h4>
                                <p className="font-dm-mono text-[10px] text-text-muted uppercase tracking-[0.1em]">Configure deployment architecture</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <button 
                                onClick={() => setTechMode('build_for_me')}
                                className={`p-5 rounded-xl border text-left transition-all ${techMode === 'build_for_me' ? 'bg-green/10 border-green/40' : 'bg-surface border-white/5 hover:border-white/20'}`}
                              >
                                <h5 className={`font-syne font-bold text-[13px] mb-2 ${techMode === 'build_for_me' ? 'text-green' : 'text-white'}`}>Build FOR Me</h5>
                                <p className="font-dm-mono text-[10px] text-text-muted leading-relaxed">Agents handle all code, PRs, and infra tasks autonomously. Perfect for non-technical founders.</p>
                              </button>
                              <button 
                                onClick={() => setTechMode('build_with_me')}
                                className={`p-5 rounded-xl border text-left transition-all ${techMode === 'build_with_me' ? 'bg-green/10 border-green/40' : 'bg-surface border-white/5 hover:border-white/20'}`}
                              >
                                <h5 className={`font-syne font-bold text-[13px] mb-2 ${techMode === 'build_with_me' ? 'text-green' : 'text-white'}`}>Build WITH Me</h5>
                                <p className="font-dm-mono text-[10px] text-text-muted leading-relaxed">Agents act as pair programmers, explaining changes and leaving final implementation to you.</p>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <h4 className="font-syne text-[15px] text-white font-bold mb-1">Select a Template</h4>
                            <p className="font-dm-mono text-[11px] text-text-muted uppercase tracking-[0.2em]">Pre-configured agents and briefs</p>
                          </div>
                          <button 
                            onClick={() => setIsTemplateGalleryOpen(false)} 
                            className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 font-syne text-[11px] text-white/60 hover:text-white hover:bg-white/10 uppercase font-bold tracking-widest transition-all"
                          >
                            Go Back
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {TEMPLATES.map(t => (
                            <div 
                              key={t.slug}
                              onClick={() => selectTemplate(t)}
                              className="p-5 rounded-2xl bg-surface/50 border border-white/5 hover:border-green/30 hover:bg-white/[0.03] cursor-pointer transition-all group relative overflow-hidden flex flex-col"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{t.icon}</span>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="font-dm-mono text-[9px] text-white/30 uppercase tracking-widest bg-white/[0.03] px-2 py-0.5 rounded">{t.depts} Depts</span>
                                  <span className="font-dm-mono text-[9px] text-green/70 uppercase tracking-widest bg-green/5 px-2 py-0.5 rounded">{t.agents} Agents</span>
                                </div>
                              </div>
                              <h5 className="font-syne text-[14px] font-bold text-white mb-2 group-hover:text-green transition-colors">{t.name}</h5>
                              <p className="font-dm-mono text-[12px] text-text-muted">{t.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="flex flex-col gap-4 py-2">
                    {[
                      { id: 'Autopilot', name: 'Autopilot', desc: 'Execute & Report', brief: 'In this mode, your agents are empowered to take actions immediately based on their objectives. You will receive a summary of completed tasks. Best for low-risk workflows.' },
                      { id: 'Approve First', name: 'Approve Gated', desc: 'Require Sign-off', brief: 'Agents will draft all messages, posts, and transactions, but will wait for your explicit approval before sending. Ensures 100% control over brand voice.' },
                      { id: 'Suggest Only', name: 'Suggest Only', desc: 'Draft & Ideate', brief: 'Agents function as a strategic brain, providing research and drafts. They will never attempt to perform external actions on your behalf.' },
                    ].map(mode => (
                      <div 
                        key={mode.id}
                        onClick={() => setOperatingMode(mode.id)}
                        className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer transition-all ${
                          operatingMode === mode.id ? 'bg-green/5 border-green/30 shadow-[0_4px_20px_rgba(0,255,135,0.05)] scale-[1.01]' : 'border-white/5 bg-surface/30 hover:bg-surface/60 hover:border-white/20'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <h4 className={`font-syne text-[15px] font-bold transition-colors ${operatingMode === mode.id ? 'text-green' : 'text-white'}`}>{mode.name}</h4>
                             <span className={`font-dm-mono text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded ${operatingMode === mode.id ? 'bg-green/10 text-green/80' : 'bg-white/5 text-white/40'}`}>{mode.desc}</span>
                          </div>
                          <p className="font-dm-mono text-[12px] text-text-muted leading-relaxed max-w-xl">{mode.brief}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${operatingMode === mode.id ? 'border-green bg-transparent' : 'border-white/20'}`}>
                           {operatingMode === mode.id && <div className="w-2.5 h-2.5 rounded-full bg-green" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8 py-2">
                    <div className="text-center">
                      <h3 className="font-syne font-bold text-green text-[22px] mb-2 uppercase tracking-wide animate-pulse">Configuration Complete</h3>
                      <p className="font-dm-mono text-[12px] text-text-muted uppercase tracking-[0.2em]">Your autonomous workforce is staged.</p>
                    </div>

                    <div className="bg-surface/50 border border-white/5 rounded-2xl p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-green text-6xl">âš¡</div>
                      <h4 className="font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Final Deployment Manifest</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                        <div className="space-y-6">
                          <div>
                            <span className="font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] block mb-2">Primary Entity</span>
                            <p className="font-syne font-bold text-white text-[16px]">{companyInfo.name || 'Nexonic Corp'}</p>
                            <p className="font-dm-mono text-[11px] text-green uppercase tracking-[0.1em] mt-1">{companyInfo.industry}</p>
                          </div>
                          <div>
                            <span className="font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] block mb-2">Strategic Mandate</span>
                            <p className="font-dm-mono text-[12px] text-text-muted leading-relaxed italic border-l-2 border-green/30 pl-3">"{companyInfo.mission || 'To coordinate the future...'}"</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <span className="font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] block mb-3">Core Architecture</span>
                            {selectionType === 'template' ? (
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
                                <span className="text-2xl">{selectedTemplate?.icon}</span>
                                <div>
                                  <span className="font-syne text-[14px] text-white font-bold block mb-0.5">{selectedTemplate?.name}</span>
                                  <span className="font-dm-mono text-[10px] text-text-muted uppercase tracking-[0.1em] block">Full Stack Template</span>
                                </div>
                              </div>
                            ) : (
                             <div className="flex flex-wrap gap-2">
                                {selectedDepts.map(dName => {
                                  const dept = DEPARTMENTS.find(d => d.name === dName);
                                  return (
                                    <div key={dName} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                      <span className="text-sm grayscale">{dept?.icon}</span>
                                      <span className="font-syne text-[12px] text-white font-bold">{dName}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] block mb-2">Execution Protocol</span>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green/10 border border-green/20 font-dm-mono text-green text-[10px] uppercase tracking-[0.2em]">
                              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse shadow-[0_0_5px_rgba(0,255,135,0.5)]" />
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
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto pt-6 border-t border-white/5 relative">
                 <div className="flex items-center gap-4 mr-auto w-full sm:w-auto justify-between sm:justify-start">
                    {currentStep > 0 && (
                      <button 
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="font-syne text-[13px] font-bold text-text-muted hover:text-white transition-all px-2 py-2"
                      >
                        â† Back
                      </button>
                    )}
                 </div>
                 
                 <button 
                   onClick={handleNext}
                   disabled={
                     (currentStep === 2 && selectedDepts.length === 0 && !selectedTemplate)
                   }
                   className={`w-full sm:w-auto px-8 py-3.5 font-syne text-[14px] font-bold rounded-xl transition-all duration-300 ${((currentStep === 2 && selectedDepts.length === 0 && !selectedTemplate)) ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/40' : 'btn-primary hover:scale-[1.02] active:scale-[0.98]'}`}
                 >
                    {currentStep === 4 ? 'Engage Protocol â†’' : 'Continue â†’'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

