'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { animate, stagger } from 'animejs';

const steps = [
  { id: 1, name: 'Brief Workforce', detail: 'Founder intent, company meta, and brand voice.' },
  { id: 2, name: 'Build Org Chart', detail: 'Select departments and staff your agent roster.' },
  { id: 3, name: 'Set Protocol', detail: 'Autopilot, Approve First, or Suggest Only.' },
  { id: 4, name: 'Bridge Stack', detail: 'Connect your tools to the coordination engine.' },
  { id: 5, name: 'First Order', detail: 'Launch your first autonomous mission.' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['Marketing', 'Sales']);
  const [operatingMode, setOperatingMode] = useState('Approve First');
  const [companyInfo, setCompanyInfo] = useState({ name: '', mission: '', industry: 'Technology', stage: 'early_revenue' });
  const [suggestedTemplate, setSuggestedTemplate] = useState<{ name: string; slug: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    animate('.onboarding-anim', {
      opacity: [0, 1],
      y: [30, 0],
      duration: 1000,
      ease: 'outExpo'
    });
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Simulate Final Reveal: thinking dots -> result -> dashboard
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

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-body font-dm-mono flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-5">
        <div className="w-full h-full bg-green filter blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl w-full main-box">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-syne text-[11px] font-bold text-green uppercase tracking-[0.3em] mb-4">Nexonic Deployment Protocol Alpha</h2>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden w-64 mx-auto">
            <div 
              className="h-full bg-green transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,255,135,0.5)]" 
              style={{ width: `${(currentStep / 5) * 100}%` }} 
            />
          </div>
        </div>

        {/* Content Box */}
        <div className="onboarding-anim bg-surface/50 border border-white/5 rounded-[3.5rem] p-8 sm:p-20 flex flex-col lg:flex-row gap-20 backdrop-blur-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 text-[15rem] font-syne font-black opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
              0{currentStep}
           </div>

           <div className="flex-1 relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-green/10 border border-green/20 text-green font-dm-mono text-[9px] uppercase tracking-widest mb-8">
                Execution Tier 0{currentStep}
              </span>
              
              <h1 className="font-syne text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-none uppercase">
                 {steps[currentStep-1].name}
              </h1>
              
              <p className="font-dm-mono text-text-muted text-[15px] mb-12 leading-relaxed opacity-70">
                 {steps[currentStep-1].detail}
              </p>

              {/* Step UI Content */}
              <div className="min-h-[300px] mb-12">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Your Name</label>
                          <input type="text" placeholder="CEO Name" className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Company Name</label>
                          <input 
                            type="text" 
                            placeholder="Nexonic Industries" 
                            className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 transition-all outline-none" 
                            onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Core Mission Brief</label>
                       <textarea 
                        rows={2} 
                        placeholder="Building the next generation of..." 
                        className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 transition-all outline-none resize-none" 
                        onChange={(e) => setCompanyInfo({...companyInfo, mission: e.target.value})}
                       />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Industry</label>
                          <select 
                            className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white/50 focus:border-green/50 outline-none"
                            onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                          >
                             <option value="SaaS">SaaS / Software</option>
                             <option value="Agency">Agency / Services</option>
                             <option value="E-commerce">E-commerce</option>
                             <option value="Technology">Technology</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] text-white/40 font-black uppercase tracking-widest">Target ICP</label>
                          <input type="text" placeholder="B2B Founders, Early Adopters" className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none" />
                       </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8">
                    {/* Template Suggestion Banner */}
                    <div className="p-6 rounded-2xl bg-green/5 border border-green/20 flex items-center justify-between gap-6">
                      <div className="flex gap-4 items-center">
                        <span className="text-2xl">🏪</span>
                        <div>
                          <h4 className="font-syne font-bold text-white text-sm">We found a template for you</h4>
                          <p className="font-dm-mono text-[11px] text-text-muted">The SaaS Startup template matches your company stage. It activates Marketing, Sales, Tech, and Ops.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setSelectedDepts(['Marketing', 'Sales', 'Tech', 'Ops']); setCurrentStep(3); }}
                        className="px-4 py-2 bg-green text-bg font-syne font-bold text-[10px] rounded-lg uppercase tracking-widest hover:brightness-110 transition-all whitespace-nowrap"
                      >
                        Use Template →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Marketing', 'Sales', 'Success', 'Tech', 'Hiring', 'Ops', 'Finance', 'Intel', 'Growth'].map((d) => (
                        <div 
                          key={d} 
                          onClick={() => toggleDept(d)}
                          className={`p-5 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                            selectedDepts.includes(d) ? 'bg-green/10 border-green/30 shadow-[0_0_15px_rgba(0,255,135,0.1)]' : 'border-white/5 bg-bg opacity-40 hover:opacity-100'
                          }`}
                        >
                          <span className={`text-[11px] font-black uppercase tracking-widest ${selectedDepts.includes(d) ? 'text-white' : 'text-text-muted'}`}>{d}</span>
                          <span className="text-[9px] text-green font-bold">5 AGENTS</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="flex flex-col gap-4">
                    {[
                      { id: 'Autopilot', name: 'AUTOPILOT', desc: 'Agents execute and report back. Maximum velocity.' },
                      { id: 'Approve First', name: 'APPROVE GATED', desc: 'CEO must sign off on all external actions. High security.' },
                      { id: 'Suggest Only', name: 'SUGGEST ONLY', desc: 'Agents draft solutions but never execute. High control.' },
                    ].map(mode => (
                      <div 
                        key={mode.id}
                        onClick={() => setOperatingMode(mode.id)}
                        className={`p-6 rounded-2xl border flex items-center justify-between group cursor-pointer transition-all ${
                          operatingMode === mode.id ? 'bg-green/10 border-green/30 shadow-[0_0_20px_rgba(0,255,135,0.1)]' : 'border-white/5 bg-bg/50 opacity-40 hover:opacity-100'
                        }`}
                      >
                        <div>
                          <h4 className="font-syne font-black text-white text-[13px] uppercase tracking-tight mb-1">{mode.name}</h4>
                          <p className="text-[10px] text-text-muted font-bold opacity-60 uppercase">{mode.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${operatingMode === mode.id ? 'border-green bg-green' : 'border-white/10'}`}>
                           {operatingMode === mode.id && <div className="w-2.5 h-2.5 rounded-full bg-bg" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8">
                     <p className="font-dm-mono text-[11px] text-white/40 uppercase tracking-widest mb-4">Bridge your stack and connect your own intelligence models.</p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        {['GitHub', 'Stripe', 'Slack', 'Linear'].map(t => (
                          <div key={t} className="p-4 rounded-xl border border-white/5 bg-bg flex items-center justify-between hover:border-white/10 transition-all">
                            <span className="font-dm-mono text-[12px] font-bold text-white/80 uppercase">{t}</span>
                            <button className="text-[9px] text-green font-black tracking-widest uppercase hover:underline">Connect</button>
                          </div>
                        ))}
                     </div>

                     <div className="p-6 rounded-2xl bg-green/5 border border-green/20">
                        <div className="flex items-center gap-4 mb-4">
                           <span className="text-2xl">⚡</span>
                           <h4 className="font-syne font-bold text-white text-sm uppercase">Bring Your Own LLM (Optional)</h4>
                        </div>
                        <p className="font-dm-mono text-[11px] text-text-muted mb-4 opacity-70">Connect your own OpenAI, Anthropic, or DeepSeek keys to override ORCA default models.</p>
                        <div className="grid grid-cols-2 gap-3">
                           {['OpenAI', 'Anthropic', 'DeepSeek', 'Groq'].map(p => (
                             <button key={p} className="p-3 bg-bg border border-white/5 rounded-xl text-[10px] text-white/60 font-black uppercase tracking-widest hover:border-green/30 transition-all">Connect {p} →</button>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="flex flex-col items-center justify-center text-center p-12 bg-green/5 rounded-[2.5rem] border border-dashed border-green/20 relative overflow-hidden group/final">
                     <div className="w-20 h-20 rounded-full border-2 border-green border-t-transparent animate-spin mb-8 shadow-[0_0_30px_rgba(0,255,135,0.2)]" />
                     <h3 className="font-syne font-black text-white text-xl mb-3 tracking-tight uppercase">Synchronizing Command Engine</h3>
                     <p className="font-dm-mono text-[11px] text-green/60 uppercase tracking-widest max-w-xs leading-relaxed">
                        Coordinating 45 agents across 9 departments. Initializing Protocol Alpha governance sequence...
                     </p>
                     
                     <div className="mt-10 px-6 py-4 rounded-2xl bg-bg border border-white/10 w-full max-w-sm text-left font-dm-mono text-[11px] text-white/40">
                        <span className="text-green opacity-100">CEO:</span> Draft first LinkedIn post about our launch. Aria tone.
                     </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 mt-auto">
                 <button 
                   onClick={handleNext}
                   className="btn-primary flex-1 sm:flex-none px-12 py-5 text-[14px] font-black rounded-2xl shadow-[0_10px_30px_rgba(0,255,135,0.2)] uppercase tracking-widest"
                 >
                    {currentStep === 5 ? 'Launch Workforce →' : 'Continue Initialization →'}
                 </button>
                 <button className="text-[10px] text-text-muted hover:text-white transition-colors uppercase tracking-[0.2em] font-black">
                    Skip Tier
                 </button>
              </div>
           </div>

           {/* Side Info */}
           <div className="w-full lg:w-72 border-tl border-white/5 lg:pl-12 hidden lg:flex flex-col justify-center">
              <div className="space-y-12">
                 <div>
                    <h4 className="font-syne text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Deployment Status</h4>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                       <span className="text-[11px] font-black text-green uppercase tracking-widest">Active Link</span>
                    </div>
                 </div>
                 <div>
                    <h4 className="font-syne text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Encryption Root</h4>
                    <span className="text-[11px] font-bold text-white/60 lowercase tracking-tighter">rsa-4096-sha512-gnupg</span>
                 </div>
                 <div>
                    <h4 className="font-syne text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Instance v4</h4>
                    <span className="text-[11px] font-bold text-white/60">Edge Node: Nairobi_Main</span>
                 </div>
              </div>
           </div>
        </div>
        
        <p className="mt-12 text-center font-dm-mono text-[10px] text-text-muted/20 uppercase tracking-[0.5em]">
           Nexonic Industries · Department of Autonomous Governance
        </p>
      </div>
    </div>
  );
}
