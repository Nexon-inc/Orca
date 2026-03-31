'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const tabs = [
  { id: 'profile', name: 'Profile' },
  { id: 'ai-models', name: 'AI Models' },
  { id: 'permissions', name: 'Permissions' },
  { id: 'integrations', name: 'Integrations' },
  { id: 'billing', name: 'Billing' },
  { id: 'notifs', name: 'Notifications' },
  { id: 'security', name: 'Security' },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [plan, setPlan] = useState('');
  const [identity, setIdentity] = useState<any>({
    company_name: '',
    industry: 'AI & Robotics',
    mission: '',
    brand_voice: 'Founder / Professional',
    location: '',
    autonomous_mode: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    fetch('/api/org')
      .then(r => r.json())
      .then(d => {
        if (d.profile) setProfile({ full_name: d.profile.full_name || '', email: d.profile.email || '' });
        if (d.member?.organizations?.plan) setPlan(d.member.organizations.plan.toLowerCase());
      });

    fetch('/api/company')
      .then(r => r.json())
      .then(d => { 
        if (d.identity) {
          setIdentity((prev: any) => ({ ...prev, ...d.identity }));
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(identity),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    animate('.acc-tab-anim', {
      opacity: [0, 1],
      y: [20, 0],
      duration: 600,
      ease: 'outExpo'
    });
  }, [activeTab]);

  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar active="account" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-bg/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-syne text-2xl font-[900] text-white uppercase tracking-tight">Account Settings</h1>
            <p className="font-syne text-white/30 text-[10px] uppercase tracking-[0.2em] font-black">System configuration & Identity.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[11px] text-white/40 hover:text-red-500 transition-colors uppercase tracking-[0.2em] font-black"
          >
            Logout
          </button>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-8 border-b border-white/5 bg-surface/30 shrink-0">
               <div className="flex items-center gap-8 py-5 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`acc-tab-anim px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${activeTab === tab.id ? 'bg-green text-bg shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      {tab.name}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-8">
              <div className="max-w-4xl w-full mx-auto acc-tab-anim opacity-0 pb-20">
                
                {activeTab === 'profile' && (
                  <div className="space-y-16">
                    <div className="flex items-center gap-8 mb-12">
                       <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-4xl text-white/10 font-black">
                          👤
                       </div>
                       <div>
                          <h3 className="font-syne text-2xl font-[900] text-white mb-2 uppercase tracking-tight">{profile.full_name || 'Your Account'}</h3>
                          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{profile.email || 'System Administrator'}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-8">
                       <h4 className="text-[10px] font-black text-green uppercase tracking-[0.4em] mb-6">01. Personal Information</h4>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Full Name</label>
                             <input
                               type="text"
                               value={profile.full_name}
                               onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all"
                             />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Email Address</label>
                             <input
                               type="email"
                               value={profile.email}
                               disabled
                               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white/20 font-syne cursor-not-allowed"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h4 className="text-[10px] font-black text-green uppercase tracking-[0.4em] mb-6">02. Company Identity</h4>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Company Name</label>
                             <input
                               type="text"
                               value={identity.company_name || ''}
                               onChange={(e) => setIdentity({ ...identity, company_name: e.target.value })}
                               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all"
                             />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Industry</label>
                             <select
                               value={identity.industry || ''}
                               onChange={(e) => setIdentity({ ...identity, industry: e.target.value })}
                               className="w-full bg-surface border border-white/10 rounded-2xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all"
                             >
                                <option>AI & Robotics</option>
                                <option>E-commerce</option>
                                <option>Fintech</option>
                                <option>Software / SaaS</option>
                             </select>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Mission Statement</label>
                          <textarea
                            rows={4}
                            value={identity.mission || ''}
                            onChange={(e) => setIdentity({ ...identity, mission: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white font-syne focus:border-green/30 outline-none transition-all resize-none"
                          />
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h4 className="text-[10px] font-black text-green uppercase tracking-[0.4em] mb-6">03. Operating Systems</h4>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Brand Voice</label>
                             <select
                               value={identity.brand_voice || ''}
                               onChange={(e) => setIdentity({ ...identity, brand_voice: e.target.value })}
                               className="w-full bg-surface border border-white/10 rounded-2xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all"
                             >
                                <option>Founder / Professional</option>
                                <option>Technical / Dense</option>
                                <option>Friendly / Approachable</option>
                             </select>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Geographic Focus</label>
                             <input
                               type="text"
                               value={identity.geography || ''}
                               onChange={(e) => setIdentity({ ...identity, geography: e.target.value })}
                               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all"
                             />
                          </div>
                       </div>
                       
                       <div className="p-8 rounded-[2rem] border border-green/10 bg-green/[0.02] flex items-center justify-between shadow-inner">
                          <div>
                            <span className="text-[9px] font-black text-green uppercase tracking-[0.3em] block mb-1">Full Autonomy Mode</span>
                            <p className="text-[11px] text-white/30 uppercase font-black tracking-tight max-w-xs">Allow executives to execute decisions without manual sign-off.</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-[13px] text-white font-black uppercase tracking-tight">{identity.autonomous_mode ? 'ACTIVE' : 'GATED'}</span>
                             <button 
                                onClick={() => setIdentity({...identity, autonomous_mode: !identity.autonomous_mode})}
                                className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 cursor-pointer ${identity.autonomous_mode ? 'bg-green' : 'bg-white/10'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-all ${identity.autonomous_mode ? 'translate-x-6' : 'translate-x-0'}`} />
                             </button>
                          </div>
                       </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="py-4 px-12 rounded-2xl bg-green text-bg text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                      {saving ? 'Synchronizing...' : saved ? 'Identity Saved ✓' : 'Save Changes'}
                    </button>
                  </div>
                )}

                {activeTab === 'ai-models' && (
                  <div className="space-y-12">
                     <div className="p-10 rounded-[3rem] border border-green/20 bg-green/5 shadow-2xl">
                        <h3 className="font-syne text-xl font-black text-white mb-4 uppercase tracking-tight">Default Engine</h3>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-10">Select the primary intelligence provider for the executive team.</p>
                        
                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                           <div className="space-y-4">
                              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">AI Provider</label>
                              <select className="w-full bg-surface border border-white/10 rounded-2xl p-4 text-white font-syne focus:border-green/50 outline-none text-xs">
                                 <option>Anthropic (Claude 3.5 Sonnet)</option>
                                 <option>OpenAI (GPT-4o)</option>
                                 <option>DeepSeek (V3.1)</option>
                                 <option>Mistral (Large 2)</option>
                              </select>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Context Window</label>
                              <select className="w-full bg-surface border border-white/10 rounded-2xl p-4 text-white font-syne focus:border-green/50 outline-none text-xs">
                                 <option>Standard (128k)</option>
                                 <option>Extended (200k)</option>
                                 <option>Infinite (Orca-managed)</option>
                              </select>
                           </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-white/5 bg-bg/50 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="text-2xl">🔑</div>
                              <div>
                                 <p className="text-white font-black text-[13px] uppercase tracking-tight">Private API Access</p>
                                 <p className="text-[9px] text-white/20 uppercase tracking-widest font-black">Bring your own credentials for full data isolation</p>
                              </div>
                           </div>
                           <div className="w-12 h-6 bg-white/5 rounded-full flex items-center px-1">
                              <div className="w-4 h-4 rounded-full bg-white/20" />
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'permissions' && (
                  <div className="space-y-8">
                     <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Executive Clearance</h3>
                     <div className="grid gap-4">
                        {['ATLAS (CEO)', 'ARIA (CMO)', 'REX (CSO)', 'PURITY (CCO)', 'ROMAN (CIO)', 'GHOST (CTO)'].map(exec => (
                           <div key={exec} className="flex items-center justify-between p-6 rounded-[2rem] border border-white/5 bg-surface/30 font-syne group hover:border-white/10 transition-all">
                              <span className="font-black text-white text-[13px] uppercase tracking-tight">{exec}</span>
                              <div className="flex gap-2">
                                 {['Auto', 'Gated', 'Manual'].map(mode => (
                                    <button 
                                      key={mode}
                                      className={`text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${mode === 'Gated' ? 'bg-green text-bg shadow-lg' : 'bg-white/5 text-white/30 hover:text-white'}`}
                                    >
                                       {mode}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                   <div className="space-y-10">
                      <div className="p-12 rounded-[3.5rem] border border-green/20 bg-green/5 relative overflow-hidden shadow-2xl">
                         <h3 className="font-syne text-2xl font-black text-white mb-2 uppercase tracking-tight">Plan: <span className="text-green">{plan ? plan.toUpperCase() : 'BUILDER'}</span></h3>
                         <p className="text-[11px] text-green font-black uppercase tracking-widest mb-12">Level 2 Enterprise System</p>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                               <p className="text-[9px] text-white/30 font-black uppercase mb-1">Executives</p>
                               <p className="text-white font-syne font-black text-lg">6 / 6</p>
                            </div>
                            <div>
                               <p className="text-[9px] text-white/30 font-black uppercase mb-1">Departments</p>
                               <p className="text-white font-syne font-black text-lg">5 / 5</p>
                            </div>
                            <div>
                               <p className="text-[9px] text-white/30 font-black uppercase mb-1">Compute</p>
                               <p className="text-green font-syne font-black text-lg">ELITE</p>
                            </div>
                            <div>
                               <p className="text-[9px] text-white/30 font-black uppercase mb-1">Priority</p>
                               <p className="text-white font-syne font-black text-lg">FAST</p>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
