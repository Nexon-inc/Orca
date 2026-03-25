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
    // Fetch user org + profile
    fetch('/api/org')
      .then(r => r.json())
      .then(d => {
        if (d.profile) setProfile({ full_name: d.profile.full_name || '', email: d.profile.email || '' });
        if (d.member?.organizations?.plan) setPlan(d.member.organizations.plan);
      });

    // Fetch company identity
    fetch('/api/company')
      .then(r => r.json())
      .then(d => { if (d.identity) setIdentity(d.identity); });
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
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Account Settings</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-[800] uppercase tracking-widest">Admin Access</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[11px] text-white/40 hover:text-red-500 transition-colors uppercase tracking-[0.2em] font-[800]"
          >
            Logout
          </button>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
           {/* Tab Navigation */}
           <div className="px-8 border-b border-white/5 bg-surface/30 shrink-0">
              <div className="flex items-center gap-8 py-4 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-[11px] font-[800] uppercase tracking-[0.2em] transition-all relative pb-4 whitespace-nowrap ${
                      activeTab === tab.id ? 'text-green' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {tab.name}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green shadow-[0_0_10px_rgba(0,255,135,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
           </div>

           {/* Tab Content */}
           <div className="flex-1 overflow-y-auto no-scrollbar p-8">
              <div className="max-w-4xl w-full mx-auto acc-tab-anim opacity-0 pb-20">
                
                {activeTab === 'profile' && (
                  <div className="space-y-16">
                    {/* Hero Section */}
                    <div className="flex items-center gap-8 mb-12">
                       <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-4xl text-white/10 font-syne font-[800]">
                          👤
                       </div>
                       <div>
                          <h3 className="font-syne text-2xl font-[800] text-white mb-2 uppercase tracking-tight">{profile.full_name || 'Your Account'}</h3>
                          <p className="text-[11px] text-white/20 font-[800] uppercase tracking-widest leading-none">{profile.email || 'Profile & Company Info'}</p>
                       </div>
                    </div>
                    
                    {/* Personal Details */}
                    <div className="space-y-8">
                       <h4 className="text-[10px] font-[800] text-green uppercase tracking-[0.4em] mb-6">01. Personal Information</h4>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">Full Name</label>
                             <input
                               type="text"
                               placeholder="Enter your full name"
                               value={profile.full_name}
                               onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-syne placeholder:text-white/10 focus:border-green/50 outline-none transition-all"
                             />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">Email Address</label>
                             <input
                               type="email"
                               value={profile.email}
                               disabled
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white/20 font-syne cursor-not-allowed"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Company Details */}
                    <div className="space-y-8">
                       <h4 className="text-[10px] font-[800] text-green uppercase tracking-[0.4em] mb-6">02. Company Information</h4>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">Company Name</label>
                             <input
                               type="text"
                               placeholder="Enter your company name"
                               value={identity.company_name || ''}
                               onChange={(e) => setIdentity({ ...identity, company_name: e.target.value })}
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-syne placeholder:text-white/10 focus:border-green/50 outline-none transition-all"
                             />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">Industry</label>
                             <select
                               value={identity.industry || ''}
                               onChange={(e) => setIdentity({ ...identity, industry: e.target.value })}
                               className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all"
                             >
                                <option value="">Select Industry...</option>
                                <option>AI &amp; Robotics</option>
                                <option>E-commerce</option>
                                <option>Fintech</option>
                                <option>Software / SaaS</option>
                             </select>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">Company Mission</label>
                          <textarea
                            rows={4}
                            value={identity.mission || ''}
                            onChange={(e) => setIdentity({ ...identity, mission: e.target.value })}
                            placeholder="Describe what your company does..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-syne placeholder:text-white/10 focus:border-green/30 outline-none transition-all resize-none"
                          />
                       </div>
                    </div>

                    {/* Operating Settings */}
                    <div className="space-y-8">
                       <h4 className="text-[10px] font-[800] text-green uppercase tracking-[0.4em] mb-6">03. Operating Settings</h4>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">Brand Voice</label>
                             <select
                               value={identity.brand_voice || ''}
                               onChange={(e) => setIdentity({ ...identity, brand_voice: e.target.value })}
                               className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all"
                             >
                                <option value="">Select Brand Voice...</option>
                                <option>Founder / Professional</option>
                                <option>Technical / Dense</option>
                                <option>Friendly / Approachable</option>
                                <option>Bold / Aggressive</option>
                             </select>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">Location</label>
                             <input
                               type="text"
                               placeholder="Global / Remote (Default)"
                               value={identity.geography || ''}
                               onChange={(e) => setIdentity({ ...identity, geography: e.target.value })}
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-syne placeholder:text-white/10 focus:border-green/50 outline-none transition-all"
                             />
                          </div>
                       </div>
                       <div className="p-6 rounded-2xl border border-white/5 bg-surface/20">
                          <span className="text-[9px] font-[800] text-white/20 uppercase tracking-[0.3em] block mb-2">Operating Mode</span>
                          <div className="flex items-center gap-3">
                             <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                             <span className="text-[13px] text-white font-[800] uppercase tracking-tight">Approve Gated</span>
                          </div>
                       </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`btn-primary py-4 px-10 rounded-xl text-[11px] font-[800] uppercase tracking-widest mt-8 flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Saving...' : saved ? 'Changes Saved ✓' : 'Save Changes'}
                    </button>
                  </div>
                )}


                {activeTab === 'permissions' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-red-500/20 bg-red-500/5 mb-8">
                       <div>
                          <p className="font-syne font-[800] text-red-500 text-[15px] uppercase tracking-tight">Emergency Stop</p>
                          <p className="text-[10px] text-red-500/60 font-[800] uppercase tracking-widest">Pause all background work immediately.</p>
                       </div>
                       <div className="w-12 h-6 bg-red-500/20 rounded-full flex items-center px-1 cursor-pointer">
                          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                       </div>
                    </div>
                    
                    <h3 className="text-[11px] font-[800] text-white/30 uppercase tracking-[0.3em] mb-4">Department Controls</h3>
                    <div className="space-y-2">
                       {['Marketing', 'Sales', 'Success', 'Tech', 'Hiring', 'Ops', 'Finance', 'Intel', 'Growth'].map(dept => (
                         <div key={dept} className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-surface/20 group hover:border-white/10 transition-all">
                           <span className="font-syne font-[800] text-white text-[13px] uppercase tracking-tight">{dept} Dept</span>
                           <div className="flex items-center gap-4">
                              {['Auto', 'Approve', 'Suggest'].map(mode => (
                                <button 
                                  key={mode}
                                  className={`text-[9px] font-[800] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                                    mode === 'Approve' ? 'bg-green/10 border-green/30 text-green shadow-[0_0_15px_rgba(0,255,135,0.1)]' : 'border-white/5 text-white/40 hover:text-white'
                                  }`}
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

                {activeTab === 'integrations' && (
                   <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Integrations will appear here */}
                      </div>
                      <button className="w-full py-20 border border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01] text-[11px] font-[800] text-white/10 hover:text-white/20 transition-all uppercase tracking-[0.3em] flex flex-col items-center justify-center gap-4 group">
                         <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">+</div>
                         Searching for integrations...
                      </button>
                   </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-10">
                    <div className="p-10 rounded-[2.5rem] border border-green/20 bg-green/5 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 text-4xl opacity-10 font-syne font-[800]">{plan ? plan.toUpperCase() : 'FREE'}</div>
                       <h3 className="font-syne text-xl font-[800] text-white mb-2 uppercase tracking-tight">Active Plan: <span className="text-green">{plan ? plan.toUpperCase() : 'FREE'}</span></h3>
                       <p className="text-[11px] text-green/60 font-[800] uppercase tracking-widest mb-8">{plan === 'enterprise' ? 'Custom' : plan === 'pro' ? '$199' : plan === 'starter' ? '$99' : 'Free'} / Month</p>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                          <div>
                             <p className="text-[9px] text-white/40 font-[800] uppercase mb-1">Seats Used</p>
                             <p className="text-white font-syne font-[800]">0 / 0</p>
                          </div>
                          <div>
                             <p className="text-[9px] text-white/40 font-[800] uppercase mb-1">Headings</p>
                             <p className="text-white font-syne font-[800]">0 / 0</p>
                          </div>
                          <div>
                             <p className="text-[9px] text-white/40 font-[800] uppercase mb-1">Depts</p>
                             <p className="text-white/20 font-syne font-[800] uppercase">—</p>
                          </div>
                          <div>
                             <p className="text-[9px] text-white/40 font-[800] uppercase mb-1">Agents</p>
                             <p className="text-white/20 font-syne font-[800] uppercase">—</p>
                           </div>
                       </div>
                       <button className="btn-primary py-3 px-8 rounded-xl text-[10px] font-[800] uppercase tracking-widest">Compare Plans</button>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-[800] text-white/30 uppercase tracking-[0.3em] mb-4">Payment Method</h4>
                       <div className="p-6 rounded-2xl border border-white/5 bg-surface/20 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-[800] italic">VISA</div>
                             <div>
                                <p className="text-white font-[800] text-[13px] uppercase tracking-tight">•••• •••• •••• 4242</p>
                                <p className="text-[10px] text-white/20 uppercase tracking-widest font-[800] leading-none">EXPIRES 12/28</p>
                             </div>
                          </div>
                          <button className="text-[10px] font-[800] text-green uppercase tracking-widest hover:underline">Update</button>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifs' && (
                  <div className="space-y-8">
                    <p className="text-[11px] text-white/40 font-[800] uppercase mb-8 tracking-widest leading-none">Manage how you receive alerts.</p>
                    <div className="space-y-4">
                       {[
                         { id: 'tasks', label: 'Agent Task Finishes', desc: 'Alert when an agent finishes work.' },
                         { id: 'coord', label: 'Team Alerts', desc: 'Alerts when teams talk to each other.' },
                         { id: 'approvals', label: 'Approval Requests', desc: 'Actions needing your sign-off.' },
                         { id: 'reports', label: 'Weekly Reports', desc: 'Summary of how we did this week.' },
                       ].map(item => (
                         <div key={item.id} className="p-6 rounded-2xl border border-white/5 bg-surface/30 flex items-center justify-between group">
                            <div className="max-w-md">
                               <p className="font-syne font-[800] text-white text-[14px] uppercase tracking-tight mb-1">{item.label}</p>
                               <p className="text-[11px] text-white/40 font-[800] uppercase tracking-widest leading-none">{item.desc}</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <button className="text-[9px] font-[800] px-3 py-1.5 rounded-lg border border-green/30 bg-green/10 text-green uppercase">Email</button>
                               <button className="text-[9px] font-[800] px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-white/20 uppercase">Push</button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ai-models' && (
                  <div className="space-y-12">
                     <div className="p-8 rounded-[2.5rem] border border-green/20 bg-green/5">
                        <h3 className="font-syne text-xl font-[800] text-white mb-4 uppercase tracking-tight">Main AI Model</h3>
                        <p className="text-[11px] text-white/40 font-[800] uppercase tracking-widest leading-none mb-8">This model runs your entire business by default.</p>
                        
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                           <div className="space-y-4">
                              <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">AI Provider</label>
                              <select className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all">
                                 <option>ORCA-powered AI (Default)</option>
                                 <option>ORCA-powered AI (Turbo)</option>
                                 <option>OpenAI</option>
                                 <option>Anthropic</option>
                                 <option>DeepSeek</option>
                                 <option>Perplexity</option>
                                 <option>Mistral</option>
                              </select>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[9px] font-[800] text-white/40 uppercase tracking-[0.3em]">Model Select</label>
                              <select className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white font-syne focus:border-green/50 outline-none transition-all">
                                 <option>gemini-1.5-pro</option>
                                 <option>gemini-2.0-flash</option>
                                 <option>gpt-4o</option>
                                 <option>claude-3-5-sonnet</option>
                              </select>
                           </div>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-bg/50">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">🔑</div>
                              <div>
                                 <p className="text-white font-[800] text-sm uppercase tracking-tight">Use My Own Key</p>
                                 <p className="text-[10px] text-white/20 uppercase tracking-widest font-[800] leading-none">Use your own private license</p>
                              </div>
                           </div>
                           <div className="w-12 h-6 bg-green/20 rounded-full flex items-center px-1 cursor-pointer">
                              <div className="w-4 h-4 rounded-full bg-green" />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h3 className="text-[11px] font-[800] text-white/30 uppercase tracking-[0.3em]">Custom Department Overrides</h3>
                        <div className="grid gap-4">
                           {['Marketing', 'Tech & Security', 'Finance & Legal'].map(dept => (
                             <div key={dept} className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-surface/30 group">
                                <div>
                                   <p className="text-white font-[800] text-sm uppercase tracking-tight mb-1">{dept} Override</p>
                                   <p className="text-[10px] text-white/20 uppercase tracking-widest font-[800]">Using Default (ORCA-powered AI)</p>
                                </div>
                                <button className="text-[9px] font-[800] text-green uppercase tracking-widest px-4 py-2 border border-green/20 bg-green/5 rounded-lg hover:bg-green hover:text-bg transition-all">Edit</button>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'security' && (
                   <div className="space-y-10">
                      <div className="p-10 rounded-[2.5rem] border border-white/5 bg-surface/30">
                         <h3 className="font-syne text-xl font-[800] text-white mb-8 uppercase tracking-tight">Security</h3>
                         <div className="space-y-6">
                            <button className="w-full py-5 rounded-xl border border-white/10 text-[11px] font-[800] text-white uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-center">Change Password</button>
                             <div className="flex items-center justify-between p-6 rounded-xl border border-white/5 bg-bg/50">
                                <div>
                                   <p className="text-white font-[800] text-[14px] uppercase tracking-tight mb-1">Double Login Security (MFA)</p>
                                   <p className="text-[10px] text-white/40 uppercase tracking-widest font-[800] leading-none">Use your phone or fingerprint to log in</p>
                                </div>
                                <span className="text-green font-[800] text-[9px] px-3 py-1 bg-green/10 border border-green/20 rounded-full">ACTIVE</span>
                             </div>
                         </div>
                      </div>

                      <div className="p-10 rounded-[2.5rem] border border-red-500/10 bg-red-500/5 group">
                        <h3 className="font-syne text-lg font-[800] text-red-500 mb-2 uppercase tracking-tight">Delete Account</h3>
                        <p className="text-[10px] text-red-500/40 font-[800] uppercase tracking-widest mb-10">Permanently delete everything.</p>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                           <p className="text-[12px] text-red-500/60 font-[800] max-w-sm uppercase leading-relaxed">
                               This will delete all your data and stop all background work immediately.
                           </p>
                           <button className="px-10 py-4 border border-red-500/20 text-red-500 font-[800] text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all whitespace-nowrap">DELETE EVERYTHING</button>
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
