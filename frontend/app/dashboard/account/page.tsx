'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const tabs = [
  { id: 'profile', name: 'Profile' },
  { id: 'company', name: 'Company' },
  { id: 'ai-models', name: 'AI Models' },
  { id: 'permissions', name: 'Permissions' },
  { id: 'integrations', name: 'Connectors' },
  { id: 'billing', name: 'Billing' },
  { id: 'notifs', name: 'Notifications' },
  { id: 'security', name: 'Security' },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    animate('.acc-tab-anim', {
      opacity: [0, 1],
      y: [20, 0],
      duration: 600,
      ease: 'outExpo'
    });
  }, [activeTab]);

  return (
    <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">CEO Office</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-black uppercase tracking-widest">OWNER ACCESS</span>
            </div>
          </div>
          <button className="text-[11px] text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest font-black">Terminate Session</button>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
           {/* Tab Navigation */}
           <div className="px-8 border-b border-white/5 bg-surface/30 shrink-0">
              <div className="flex items-center gap-8 py-4 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative pb-4 whitespace-nowrap ${
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
                  <div className="space-y-10">
                    <div className="flex items-center gap-8 mb-12">
                       <div className="w-24 h-24 rounded-[2rem] bg-green/10 border border-green/20 flex items-center justify-center text-4xl text-green font-syne font-[800] shadow-[0_0_30px_rgba(0,255,135,0.1)]">
                          KF
                       </div>
                       <div>
                          <h3 className="font-syne text-2xl font-[800] text-white mb-2 uppercase tracking-tight">Kale Francis</h3>
                          <p className="text-[11px] text-white/40 font-black uppercase tracking-widest leading-none">Verified Primary Account Owner</p>
                          <button className="mt-4 text-[10px] text-green font-black uppercase tracking-widest hover:underline">Change Avatar</button>
                       </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Owner Name</label>
                          <input type="text" defaultValue="Kale Francis" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none transition-all" />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Email Protocol</label>
                          <input type="email" defaultValue="kale@nexonic.industries" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white/50 cursor-not-allowed" disabled />
                       </div>
                    </div>
                    <button className="btn-primary py-4 px-10 rounded-xl text-[11px] font-black uppercase tracking-widest mt-8">Save Profile</button>
                  </div>
                )}

                {activeTab === 'company' && (
                  <div className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Organization Name</label>
                          <input type="text" defaultValue="Nexonic Industries" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none transition-all" />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Industry Domain</label>
                          <select className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none transition-all">
                             <option>AI & Robotics</option>
                             <option>E-commerce</option>
                             <option>Fintech</option>
                             <option>Software / SaaS</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Core Mission Brief</label>
                       <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-green/50 outline-none transition-all resize-none" defaultValue="Building the operating system for the next generation of coordinate AI companies." />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Brand Voice Pattern</label>
                          <select className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none transition-all">
                             <option>Founder / Professional</option>
                             <option>Technical / Dense</option>
                             <option>Friendly / Approachable</option>
                             <option>Bold / Aggressive</option>
                          </select>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Primary Geography</label>
                          <input type="text" defaultValue="Global / Remote" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white" />
                       </div>
                    </div>
                    <button className="btn-primary py-4 px-10 rounded-xl text-[11px] font-black uppercase tracking-widest mt-8">Sync Org Meta</button>
                  </div>
                )}

                {activeTab === 'permissions' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-red-500/20 bg-red-500/5 mb-8">
                       <div>
                          <p className="font-syne font-bold text-red-500 text-[15px] uppercase tracking-tight">Emergency Kill Switch</p>
                          <p className="text-[10px] text-red-500/60 font-medium uppercase tracking-widest">Immediately pause all autonomous agent execution.</p>
                       </div>
                       <div className="w-12 h-6 bg-red-500/20 rounded-full flex items-center px-1 cursor-pointer">
                          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                       </div>
                    </div>
                    
                    <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Department Operational Modes</h3>
                    <div className="space-y-2">
                       {['Marketing', 'Sales', 'Success', 'Tech', 'Hiring', 'Ops', 'Finance', 'Intel', 'Growth'].map(dept => (
                         <div key={dept} className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-surface/20 group hover:border-white/10 transition-all">
                           <span className="font-syne font-bold text-white text-[13px] uppercase tracking-tight">{dept} Department</span>
                           <div className="flex items-center gap-4">
                              {['Auto', 'Approve', 'Suggest'].map(mode => (
                                <button 
                                  key={mode}
                                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
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
                         {['GitHub', 'Stripe', 'HubSpot', 'Linear', 'Slack', 'Mailchimp'].map(tool => (
                           <div key={tool} className="p-6 rounded-2xl border border-white/5 bg-surface/30 backdrop-blur-sm group hover:border-green/30 transition-all relative overflow-hidden">
                              <div className="flex items-center justify-between mb-4">
                                 <span className="text-xl">
                                    {tool === 'GitHub' ? '🐙' : tool === 'Stripe' ? '💳' : tool === 'HubSpot' ? '🟠' : '⚙️'}
                                 </span>
                                 <span className="text-[9px] font-black text-green rounded-full bg-green/10 px-2 py-0.5 border border-green/20">CONNECTED</span>
                              </div>
                              <h4 className="font-syne font-[800] text-white mb-1 uppercase tracking-tight">{tool}</h4>
                              <p className="text-[10px] text-white/20 font-[900] mb-6 uppercase tracking-widest">Active Connection</p>
                              <button className="text-[9px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors">Disconnect</button>
                           </div>
                         ))}
                      </div>
                      <button className="w-full py-8 border border-dashed border-white/10 rounded-2xl text-[11px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                         <span className="text-xl">+</span> Add New Integration
                      </button>
                   </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-10">
                    <div className="p-10 rounded-[2.5rem] border border-green/20 bg-green/5 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 text-4xl opacity-10 font-syne font-[800]">PRO PLAN</div>
                       <h3 className="font-syne text-xl font-[800] text-white mb-2 uppercase tracking-tight">Active Plan: <span className="text-green">Nexonic Pro</span></h3>
                       <p className="font-dm-mono text-[11px] text-green/60 font-bold uppercase tracking-widest mb-8">$199 / Month · Renews Apr 14, 2026</p>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                          <div>
                             <p className="text-[9px] text-white/40 font-black uppercase mb-1">Seats Used</p>
                             <p className="text-white font-syne font-black">3 / 10</p>
                          </div>
                          <div>
                             <p className="text-[9px] text-white/40 font-black uppercase mb-1">Dept Heads</p>
                             <p className="text-white font-syne font-black">2 / 3</p>
                          </div>
                          <div>
                             <p className="text-[9px] text-white/40 font-black uppercase mb-1">Depts</p>
                             <p className="text-green font-syne font-black uppercase">ULTD</p>
                          </div>
                          <div>
                             <p className="text-[9px] text-white/40 font-black uppercase mb-1">Agents</p>
                             <p className="text-green font-syne font-black uppercase">ULTD</p>
                          </div>
                       </div>
                       <button className="btn-primary py-3 px-8 rounded-xl text-[10px]">Compare Plans</button>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Payment Method</h4>
                       <div className="p-6 rounded-2xl border border-white/5 bg-surface/20 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black italic">VISA</div>
                             <div>
                                <p className="text-white font-[800] text-[13px] uppercase tracking-tight">•••• •••• •••• 4242</p>
                                <p className="text-[10px] text-white/20 uppercase tracking-widest font-black leading-none">EXPIRES 12/28</p>
                             </div>
                          </div>
                          <button className="text-[10px] font-black text-green uppercase tracking-widest hover:underline">Update</button>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifs' && (
                  <div className="space-y-8">
                    <p className="text-[11px] text-white/40 font-[900] uppercase mb-8 tracking-widest leading-none">Manage delivery protocol for autonomous events.</p>
                    <div className="space-y-4">
                       {[
                         { id: 'tasks', label: 'Agent Task Completions', desc: 'Alert when an agent finishes an assigned brief.' },
                         { id: 'coord', label: 'Coordination Alerts', desc: 'Critical handoffs between departments.' },
                         { id: 'approvals', label: 'Approval Requests', desc: 'Gated actions requiring your signature.' },
                         { id: 'reports', label: 'Dept Weekly Reports', desc: 'Aggregated performance metrics from Heads.' },
                       ].map(item => (
                         <div key={item.id} className="p-6 rounded-2xl border border-white/5 bg-surface/30 flex items-center justify-between group">
                            <div className="max-w-md">
                               <p className="font-syne font-[800] text-white text-[14px] uppercase tracking-tight mb-1">{item.label}</p>
                               <p className="text-[11px] text-white/40 font-black uppercase tracking-widest leading-none">{item.desc}</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <button className="text-[9px] font-black px-3 py-1.5 rounded-lg border border-green/30 bg-green/10 text-green uppercase">Email</button>
                               <button className="text-[9px] font-black px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-white/20 uppercase">Push</button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ai-models' && (
                  <div className="space-y-12">
                     <div className="p-8 rounded-[2.5rem] border border-green/20 bg-green/5">
                        <h3 className="font-syne text-xl font-[800] text-white mb-4 uppercase tracking-tight">Default Organization Model</h3>
                        <p className="font-dm-mono text-[11px] text-white/40 font-black uppercase tracking-widest leading-none mb-8">All agents use this model unless specifically overridden.</p>
                        
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                           <div className="space-y-4">
                              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">AI Provider</label>
                              <select className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none transition-all">
                                 <option>Google Gemini (Default)</option>
                                 <option>Groq</option>
                                 <option>OpenAI</option>
                                 <option>Anthropic</option>
                                 <option>DeepSeek</option>
                                 <option>Perplexity</option>
                                 <option>Mistral</option>
                              </select>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Model Select</label>
                              <select className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white focus:border-green/50 outline-none transition-all">
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
                                 <p className="text-white font-[800] text-sm uppercase tracking-tight">Use My Own API Key</p>
                                 <p className="text-[10px] text-white/20 uppercase tracking-widest font-black leading-none">Enable BYOLLM for this provider</p>
                              </div>
                           </div>
                           <div className="w-12 h-6 bg-green/20 rounded-full flex items-center px-1 cursor-pointer">
                              <div className="w-4 h-4 rounded-full bg-green" />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Regional & Specific Overrides</h3>
                        <div className="grid gap-4">
                           {['Marketing', 'Tech & Security', 'Finance & Legal'].map(dept => (
                             <div key={dept} className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-surface/30 group">
                                <div>
                                   <p className="text-white font-[800] text-sm uppercase tracking-tight mb-1">{dept} Override</p>
                                   <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Inheriting Org Default (Gemini)</p>
                                </div>
                                <button className="text-[9px] font-black text-green uppercase tracking-widest px-4 py-2 border border-green/20 bg-green/5 rounded-lg hover:bg-green hover:text-bg transition-all">Edit Override</button>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'security' && (
                   <div className="space-y-10">
                      <div className="p-10 rounded-[2.5rem] border border-white/5 bg-surface/30">
                         <h3 className="font-syne text-xl font-[800] text-white mb-8 uppercase tracking-tight">Security Handshake</h3>
                         <div className="space-y-6">
                            <button className="w-full py-5 rounded-xl border border-white/10 text-[11px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-center">Rotate Password Protocol</button>
                             <div className="flex items-center justify-between p-6 rounded-xl border border-white/5 bg-bg/50">
                               <div>
                                  <p className="text-white font-[800] text-[14px] uppercase tracking-tight mb-1">2-Factor Authentication (MFA)</p>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-black leading-none">Biometric or TOTP hardware sign-off</p>
                               </div>
                               <span className="text-green font-black text-[9px] px-3 py-1 bg-green/10 border border-green/20 rounded-full">ACTIVE</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-10 rounded-[2.5rem] border border-red-500/10 bg-red-500/5 group">
                        <h3 className="font-syne text-lg font-black text-red-500 mb-2 uppercase tracking-tight">Terminate Deployment</h3>
                        <p className="text-[10px] text-red-500/40 font-black uppercase tracking-widest mb-10">Permanent deletion of all organizational data.</p>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                           <p className="text-[12px] text-red-500/60 font-bold max-w-sm uppercase leading-relaxed">
                              Proceeding will immediately revoke all agent identities, delete mission history, and disconnect the Nexonic coordination engine.
                           </p>
                           <button className="px-10 py-4 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all whitespace-nowrap">EXTINGUISH ORG</button>
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
