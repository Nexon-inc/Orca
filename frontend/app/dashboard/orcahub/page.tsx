'use client';

import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function OrcaHubPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'integrations' | 'tiers'>('templates');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState<string | null>(null);
  const [activeDrawerTemplate, setActiveDrawerTemplate] = useState<any | null>(null);

  const filters = ['ALL', 'saas_startup', 'marketing_agency', 'ecommerce', 'dev_agency', 'intelligence'];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/orcahub');
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error('Failed to fetch hub templates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleInstall = async (tpl: any) => {
    setIsProvisioning(tpl.slug);
    
    // Simulate terminal provisioning for UX
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/orcahub/${tpl.slug}/install`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          window.location.href = `/dashboard/chat?installed=${tpl.slug}`;
        } else {
          alert(data.error || 'Installation failed');
          setIsProvisioning(null);
        }
      } catch (err) {
        alert('Network error during installation');
        setIsProvisioning(null);
      }
    }, 4500); // Terminal animation time
  };

  const integrations = [
    {
      role: 'CMO_INTEGRATIONS',
      icon: 'campaign',
      items: [
        { id: 'linkedin', name: 'LINKEDIN', type: 'SOCIAL_OUTREACH', connected: true },
        { id: 'twitter', name: 'TWITTER / X', type: 'BRAND_PRESENCE', connected: false },
        { id: 'meta', name: 'META ADS', type: 'PAID_ACQUISITION', connected: false },
        { id: 'hubspot', name: 'HUBSPOT', type: 'CRM_SYNC', connected: false }
      ]
    },
    {
      role: 'COO_INTEGRATIONS',
      icon: 'terminal',
      items: [
        { id: 'google_workspace', name: 'GOOGLE WORKSPACE', type: 'GMAIL / DRIVE / CAL', connected: true },
        { id: 'microsoft_365', name: 'MICROSOFT 365', type: 'OUTLOOK / ONEDRIVE', connected: false },
        { id: 'notion', name: 'NOTION', type: 'KNOWLEDGE_BASE', connected: true },
        { id: 'slack', name: 'SLACK', type: 'TEAM_COMMS', connected: false }
      ]
    },
    {
      role: 'CTO_INTEGRATIONS',
      icon: 'memory',
      items: [
        { id: 'github', name: 'GITHUB', type: 'CODE_SYNC', connected: true },
        { id: 'vercel', name: 'VERCEL', type: 'DEPLOYMENT', connected: false },
        { id: 'linear', name: 'LINEAR', type: 'ISSUE_TRACKING', connected: false }
      ]
    },
    {
      role: 'CSO_INTEGRATIONS',
      icon: 'security',
      items: [
        { id: 'salesforce', name: 'SALESFORCE', type: 'PIPELINE_MGMT', connected: true },
        { id: 'close', name: 'CLOSE.IO', type: 'CRM_SYNC', connected: false },
        { id: 'stripe', name: 'STRIPE', type: 'REVENUE_SYNC', connected: false }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="orcahub" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto p-12 no-scrollbar">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase">
              ORCA_HUB
            </h1>
            <p className="font-body text-sm text-on-secondary-container mt-2">
              Templates and integrations for your executive team.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-outline-variant/10 pb-0">
            <button 
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-3 text-[11px] font-black font-label uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                activeTab === 'templates' 
                  ? 'text-primary-container border-primary-container' 
                  : 'text-on-surface/40 border-transparent hover:text-on-surface'
              }`}
            >
              TEMPLATES
            </button>
            <button 
              onClick={() => setActiveTab('integrations')}
              className={`px-4 py-3 text-[11px] font-black font-label uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                activeTab === 'integrations'
                  ? 'text-primary-container border-primary-container' 
                  : 'text-on-surface/40 border-transparent hover:text-on-surface'
              }`}
            >
              INTEGRATIONS
            </button>
            <button 
              onClick={() => setActiveTab('tiers')}
              className={`px-4 py-3 text-[11px] font-black font-label uppercase tracking-widest transition-colors -mb-px border-b-2 ${
                activeTab === 'tiers'
                  ? 'text-primary-container border-primary-container' 
                  : 'text-on-surface/40 border-transparent hover:text-on-surface'
              }`}
            >
              LICENSE TIERS (TREE)
            </button>
          </div>

          {activeTab === 'templates' ? (
            <>
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {filters.map(f => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-colors border ${
                      activeFilter === f
                        ? 'bg-primary-container/10 border-primary-container/40 text-primary-container'
                        : 'bg-surface-container-high border-outline-variant/20 text-on-surface/40 hover:border-primary-container/40 hover:text-on-surface'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <span className="text-[10px] font-mono text-on-surface/20 uppercase animate-pulse">Initializing_Market_Data...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {templates.filter(t => activeFilter === 'ALL' || t.category === activeFilter).map(tpl => (
                    <div 
                      key={tpl.id} 
                      onClick={() => setActiveDrawerTemplate(tpl)}
                      className="bg-[#1a1c1a]/40 backdrop-blur-md p-7 rounded-xl border border-outline-variant/10 hover:border-primary-container/30 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                        <span className="material-symbols-outlined text-4xl text-primary-container">layers</span>
                      </div>
                      
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container mb-3 border border-primary-container/20 group-hover:bg-primary-container group-hover:text-on-primary transition-all duration-300">
                             <span className="material-symbols-outlined text-xl">hub</span>
                          </div>
                          <div className="text-[15px] font-black font-headline text-on-surface uppercase tracking-tight">
                            {tpl.name}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em] text-primary-container/60">
                            {tpl.category.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                            tpl.plan_required === 'free' ? 'border-primary-container/20 text-primary-container/70' : 'border-error/20 text-error/70'
                          }`}>
                            {tpl.plan_required}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[12px] font-body text-on-surface/50 leading-relaxed mb-8 flex-1 line-clamp-3">
                        {tpl.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-[9px] font-mono text-on-surface/20 uppercase tracking-widest mb-6 pt-4 border-t border-outline-variant/10">
                        <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary-container"></span> {tpl.template_data?.departments?.length || 4} DEPTS</span>
                        <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary-container"></span> LATEST_BUILD</span>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveDrawerTemplate(tpl); }}
                          className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest border border-outline-variant/20 text-on-surface/40 rounded-sm hover:border-on-surface hover:text-on-surface transition-all"
                        >
                          PREVIEW
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleInstall(tpl); }}
                          className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${
                            tpl.is_installed 
                            ? 'bg-surface-container-high text-on-surface/20 cursor-not-allowed'
                            : 'bg-primary-container/10 border border-primary-container/40 text-primary-container hover:bg-primary-container hover:text-on-primary shadow-[0_0_15px_rgba(0,195,103,0.1)]'
                          }`}
                        >
                          {tpl.is_installed ? 'DEPLOYED' : 'INSTALL'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'integrations' ? (
            <div className="flex flex-col gap-8 max-w-3xl animate-in fade-in duration-300">
              {integrations.map(group => (
                <div key={group.role}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black font-mono text-primary-container/60 uppercase tracking-[0.2em] flex items-center gap-2">
                       <span>{group.icon}</span> {group.role}
                    </span>
                    <div className="flex-1 h-px bg-outline-variant/10"></div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {group.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-4 bg-surface-container rounded-lg border border-outline-variant/10 hover:bg-surface-bright transition-all">
                        
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container border border-outline-variant/20 group-hover:border-primary-container/30 transition-all">
                            <span className="material-symbols-outlined text-lg">{group.icon}</span>
                          </div>
                          <div>
                            <div className="text-[11px] font-black font-label text-on-surface uppercase tracking-wide">
                              {item.name}
                            </div>
                            <div className="text-[9px] font-mono text-on-surface/30 uppercase mt-0.5 tracking-tight">
                              {item.type}
                            </div>
                          </div>
                        </div>
                        
                        {item.connected ? (
                          <div className="px-3 py-1 bg-primary-container/10 rounded-full flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_rgba(0,195,103,0.5)]"></span>
                             <span className="text-[8px] font-black font-mono text-primary-container uppercase tracking-widest">CONNECTED</span>
                          </div>
                        ) : (
                          <button className="px-4 py-2 text-[9px] font-black font-mono text-on-surface/30 border border-outline-variant/20 rounded-sm uppercase tracking-widest hover:text-primary-container hover:border-primary-container/40 transition-all">
                            CONNECT_API →
                          </button>
                        )}
                        
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto py-6">
              <div className="bg-[#111311]/80 border border-outline-variant/10 rounded-2xl p-10 backdrop-blur-xl relative overflow-hidden flex flex-col items-center">
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                
                {/* ROOT NODE */}
                <div className="relative z-10 flex flex-col items-center mb-10">
                  <div className="px-6 py-3 rounded-lg bg-primary-container text-on-primary border border-primary-container/20 shadow-[0_0_24px_rgba(0,255,135,0.3)] font-syne font-black text-xs uppercase tracking-widest text-center">
                    👑 ORCA CORE PLATFORM
                  </div>
                  <div className="w-0.5 h-10 bg-gradient-to-b from-primary-container to-outline-variant/35 mt-1" />
                </div>
                
                {/* BRANCH HORIZONTAL BAR */}
                <div className="relative z-10 w-full flex items-center justify-between px-16 mb-1">
                  <div className="w-full h-0.5 bg-outline-variant/35 relative">
                    <div className="absolute top-0 left-0 w-0.5 h-6 bg-outline-variant/35" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-outline-variant/35" />
                    <div className="absolute top-0 right-0 w-0.5 h-6 bg-outline-variant/35" />
                  </div>
                </div>

                {/* THREE COLUMNS TIER LEAF CONTAINER */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-5">
                  
                  {/* FREE TIER LEAF */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-[#161816]/60 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all flex flex-col items-center text-center">
                      <span className="text-[9px] font-black font-mono text-on-surface/40 uppercase tracking-widest mb-1.5">Free License</span>
                      <h4 className="text-sm font-black font-headline text-white uppercase tracking-wider mb-3">$0 / month</h4>
                      <div className="w-full h-px bg-white/5 my-2" />
                      <ul className="space-y-2.5 text-left w-full text-[10px] font-mono text-on-surface/50 mt-2">
                        <li className="flex items-center gap-2"><span className="text-white/20">▪</span> 2 Active Executive Agents</li>
                        <li className="flex items-center gap-2"><span className="text-white/20">▪</span> 20 Autonomous Tasks/mo</li>
                        <li className="flex items-center gap-2"><span className="text-white/20">▪</span> 1 Team Workspace slot</li>
                        <li className="flex items-center gap-2"><span className="text-white/20">▪</span> Core business integrations</li>
                        <li className="flex items-center gap-2"><span className="text-white/20">▪</span> Standard execution speed</li>
                      </ul>
                    </div>
                  </div>

                  {/* BUILDER TIER LEAF (FOUNDING PROMO) */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-primary-container/5 border border-primary-container/40 rounded-xl p-5 hover:border-primary-container/60 transition-all flex flex-col items-center text-center shadow-[0_0_24px_rgba(0,195,103,0.05)]">
                      <span className="text-[9px] font-black font-mono text-primary-container uppercase tracking-widest mb-1.5 flex items-center gap-1">⭐ Builder / Promo</span>
                      <h4 className="text-sm font-black font-headline text-white uppercase tracking-wider mb-1">$29 / month</h4>
                      <p className="text-[8px] font-black text-[#F59E0B] uppercase tracking-widest mb-3">🔥 founding promo: $19/mo</p>
                      <div className="w-full h-px bg-primary-container/10 my-2" />
                      <ul className="space-y-2.5 text-left w-full text-[10px] font-black font-mono text-primary-container/80 mt-2">
                        <li className="flex items-center gap-2"><span className="text-primary-container/55">▪</span> 4 Executive Agents</li>
                        <li className="flex items-center gap-2"><span className="text-primary-container/55">▪</span> 200 Autonomous Tasks/mo</li>
                        <li className="flex items-center gap-2"><span className="text-primary-container/55">▪</span> 1 Team Seat</li>
                        <li className="flex items-center gap-2"><span className="text-primary-container/55">▪</span> Planning & Automate modes</li>
                        <li className="flex items-center gap-2"><span className="text-primary-container/55">▪</span> LinkedIn, HubSpot, Notion API</li>
                      </ul>
                    </div>
                  </div>

                  {/* PRO TIER LEAF */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-[#1b1c1b]/60 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/40 transition-all flex flex-col items-center text-center shadow-[0_0_24px_rgba(168,85,247,0.05)]">
                      <span className="text-[9px] font-black font-mono text-purple-400 uppercase tracking-widest mb-1.5">Pro Enterprise</span>
                      <h4 className="text-sm font-black font-headline text-white uppercase tracking-wider mb-3">$79 / month</h4>
                      <div className="w-full h-px bg-purple-500/10 my-2" />
                      <ul className="space-y-2.5 text-left w-full text-[10px] font-mono text-on-surface/50 mt-2">
                        <li className="flex items-center gap-2 text-purple-300/80"><span className="text-purple-400/40">▪</span> All 6 C-Suite Agents</li>
                        <li className="flex items-center gap-2 text-purple-300/80"><span className="text-purple-400/40">▪</span> 1,000 Tasks / Month</li>
                        <li className="flex items-center gap-2 text-purple-300/80"><span className="text-purple-400/40">▪</span> 5 Team seats & assignments</li>
                        <li className="flex items-center gap-2 text-purple-300/80"><span className="text-purple-400/40">▪</span> Out-of-Office Autopilot</li>
                        <li className="flex items-center gap-2 text-purple-300/80"><span className="text-purple-400/40">▪</span> Bring Your Own LLM Keys</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Details Drawer */}
      {activeDrawerTemplate && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm" onClick={() => setActiveDrawerTemplate(null)}></div>
          <div className="w-full max-w-xl bg-surface-container h-full relative z-10 border-l border-outline-variant/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-slide-in-right">
            <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between">
              <h2 className="text-xl font-black font-headline text-on-surface uppercase tracking-tighter">TEMPLATE_PROTOCOLS</h2>
              <button onClick={() => setActiveDrawerTemplate(null)} className="material-symbols-outlined text-on-surface/40 hover:text-primary-container transition-colors text-2xl">close</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
              <div className="mb-10">
                <div className="text-[9px] font-black text-primary-container uppercase tracking-[0.3em] mb-4">EXECUTIVE_ROSTER</div>
                <div className="grid grid-cols-1 gap-4">
                  {activeDrawerTemplate.template_data?.departments?.map((dept: any) => (
                    <div key={dept.key} className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[11px] font-black text-on-surface uppercase tracking-widest">{dept.key}</span>
                        <span className="h-px flex-1 bg-outline-variant/5"></span>
                        <span className="text-[8px] font-mono text-primary-container/60 uppercase">{dept.agent_mode || 'AUTOPILOT'}</span>
                      </div>
                      <p className="text-[12px] font-body text-on-surface/40 italic">
                        {dept.description || 'Optimized agent handoff protocols active for this department.'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(dept.active_agents || ['Atlas']).map((agent: string) => (
                          <span key={agent} className="px-2 py-0.5 bg-primary-container/5 border border-primary-container/20 rounded text-[8px] font-black text-primary-container uppercase">{agent}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black text-primary-container uppercase tracking-[0.3em] mb-4">DAY_1_MISSION_BRIEFS</div>
                <div className="space-y-4">
                  {activeDrawerTemplate.template_data?.day1_briefs?.map((brief: any, i: number) => (
                    <div key={i} className="p-5 bg-[#121412] rounded-xl border border-outline-variant/10">
                      <div className="text-[10px] font-black text-on-surface/80 uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,195,103,0.5)]"></span>
                        {brief.agent_name} - INITIAL_TASK
                      </div>
                      <p className="text-[13px] font-body text-on-surface/60 leading-relaxed italic mb-3">"{brief.brief}"</p>
                      <div className="text-[9px] font-mono text-on-surface/20 uppercase tracking-widest">WHY: {brief.rationale}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-surface-container-low border-t border-outline-variant/10">
               <button 
                onClick={() => handleInstall(activeDrawerTemplate)}
                disabled={activeDrawerTemplate.is_installed}
                className={`w-full py-4 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeDrawerTemplate.is_installed 
                  ? 'bg-surface-container-high text-on-surface/20 cursor-not-allowed'
                  : 'bg-primary-container text-on-primary neon-glow hover:bg-primary-fixed'
                }`}
               >
                 {activeDrawerTemplate.is_installed ? 'TEMPLATE_ACTIVE' : 'INITIALIZE_OS_DEPLOYMENT'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Provisioning Terminal Overlay */}
      {isProvisioning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0a0c0a]/95 backdrop-blur-xl">
          <div className="w-full max-w-2xl bg-[#0d0f0d] border border-primary-container/20 rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,195,103,0.1)]">
            <div className="p-4 bg-primary-container/5 border-b border-primary-container/10 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-error/40"></span>
              <span className="w-3 h-3 rounded-full bg-warning/40"></span>
              <span className="w-3 h-3 rounded-full bg-primary-container/40 animate-pulse"></span>
              <span className="ml-auto text-[10px] font-mono text-primary-container uppercase tracking-widest font-black">ORCA_PROVISIONING_TERMINAL</span>
            </div>
            <div className="p-8 h-[360px] font-mono text-[11px] text-primary-container/80 flex flex-col gap-2 overflow-y-auto no-scrollbar">
              <p className="text-on-surface/40">{"> [SYSTEM] INITIALIZING_RESOURCES..."}</p>
              <p className="animate-pulse">{`> [TEMPLATE] Loading ${isProvisioning} metadata... [OK]`}</p>
              <p className="delay-700 animate-pulse">{"> [SECURITY] Validating department handoff protocols... [OK]"}</p>
              <p className="delay-1000 animate-pulse">{"> [AGENT] Provisioning Atlas (Chief Operating Officer)... [READY]"}</p>
              <p className="delay-[1500ms] animate-pulse">{"> [AGENT] Provisioning Aria (Chief Marketing Officer)... [READY]"}</p>
              <p className="delay-[2000ms] animate-pulse">{"> [AGENT] Provisioning Ghost (Chief Technical Officer)... [READY]"}</p>
              <p className="delay-[2500ms] animate-pulse">{"> [NETWORK] Connecting Google Workspace & Microsoft 365 Protocols... [ALMOST_READY]"}</p>
              <div className="mt-auto pt-6 flex items-center justify-between">
                 <div className="flex gap-1">
                   {[1,2,3,4,5,6,7,8,9,10].map(i => (
                     <div key={i} className="w-6 h-1 bg-primary-container/20 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary-container animate-loading-bar" style={{ animationDelay: `${i * 300}ms` }}></div>
                     </div>
                   ))}
                 </div>
                 <span className="text-[10px] font-black animate-pulse">DEPLOYING_PHASE_01</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
