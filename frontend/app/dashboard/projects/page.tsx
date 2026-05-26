'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [activeOrg, setActiveOrg] = useState<any | null>(null);

  // New Project Form Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    audience: '',
    competitor: '',
    operationalFocus: 'MVP Development'
  });

  // Strategy Modal
  const [showStrategize, setShowStrategize] = useState(false);
  const [strategizeInput, setStrategizeInput] = useState('');
  const [strategizeResult, setStrategizeResult] = useState<string | null>(null);
  const [isStrategizing, setIsStrategizing] = useState(false);

  const fetchProjectsData = async () => {
    try {
      const [projRes, orgRes] = await Promise.all([
        fetch('/api/projects/list'),
        fetch('/api/org')
      ]);
      const projData = await projRes.json();
      const orgData = await orgRes.json();
      
      const loadedProjects = projData.projects || [];
      setProjects(loadedProjects);
      
      const plan = orgData.member?.organizations?.plan || 'free';
      setUserPlan(plan);

      // Current active organization is the one linked to their session
      if (orgData.member?.organizations) {
        const activeId = orgData.member.organizations.id;
        setActiveOrg({
          id: activeId,
          name: orgData.member.organizations.name,
          plan: orgData.member.organizations.plan,
          deptCount: loadedProjects.find((p: any) => p.id === activeId)?.deptCount || 6,
          agentCount: loadedProjects.find((p: any) => p.id === activeId)?.agentCount || 6
        });
      }
    } catch (err) {
      console.error('Failed to fetch projects data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsProvisioning(true);
    try {
      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Welcome to ${formData.name}! Operational office provisioned successfully.`, {
          duration: 6000
        });
        setShowCreateModal(false);
        setFormData({
          name: '',
          niche: '',
          audience: '',
          competitor: '',
          operationalFocus: 'MVP Development'
        });
        await fetchProjectsData();
      } else {
        toast.error(data.error || 'Failed to provision operational office');
      }
    } catch (err) {
      toast.error('Network failure provisioning startup');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleStrategize = async () => {
    if (!strategizeInput.trim()) return;
    setIsStrategizing(true);
    setStrategizeResult(null);

    try {
      const res = await fetch('/api/projects/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: strategizeInput })
      });
      const data = await res.json();
      setStrategizeResult(data.recommendation);
    } catch (err) {
      setStrategizeResult("Failed to generate strategic report. Please verify connection.");
    } finally {
      setIsStrategizing(false);
    }
  };

  const isPremium = ['builder', 'pro', 'enterprise'].includes(userPlan);

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="projects" />

      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg overflow-y-auto no-scrollbar">
        <DashboardHeader />

        <div className="flex-1 w-full max-w-5xl mx-auto p-8 lg:p-12 space-y-12 pb-32">
          
          {/* Header Title Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase flex items-center gap-3">
                PROJECTS VAULT
                <span className="text-[10px] font-mono border border-[#00c367]/20 px-2 py-0.5 rounded text-primary-container tracking-[0.2em] font-normal uppercase">
                  Multi-Startup Control
                </span>
              </h1>
              <p className="font-body text-xs text-on-secondary-container mt-2 max-w-xl">
                Start, run, and scale multiple startup ideas simultaneously. Switch workspaces instantly and watch your autonomous C-Suite align on deliverables.
              </p>
            </div>
            
            <button 
              onClick={() => {
                if (!isPremium) {
                  toast.error('Multiple Startup workspaces are a premium feature.');
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="px-5 py-3 bg-primary-container text-on-primary font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-[0_12px_40px_rgba(0,195,103,0.2)]"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span> Launch New Startup
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-[10px] font-mono text-primary-container/40 uppercase tracking-widest animate-pulse">
              <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
              Loading operational offices...
            </div>
          ) : (
            <>
              {/* CURRENT ACTIVE PROJECT PANEL */}
              {activeOrg && (
                <div className="bg-[#0e110e] border border-outline-variant/10 rounded-2xl p-6 lg:p-8 space-y-6 relative overflow-hidden group shadow-2xl animate-in fade-in duration-500">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-8xl text-primary-container">dashboard</span>
                  </div>
                  
                  {/* Title & Plan Status */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary-container uppercase tracking-widest font-mono">CURRENTLY_WORKED_ON</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <h2 className="text-2xl font-black font-headline text-white mt-1 uppercase tracking-tight">
                        {activeOrg.name}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono border border-white/10 px-2 py-1 bg-white/5 rounded text-on-surface/50 uppercase tracking-widest">
                        {activeOrg.plan.toUpperCase()} TIER
                      </span>
                      <button 
                        onClick={() => router.push('/dashboard/chat')}
                        className="px-4 py-2 bg-primary-container/10 border border-primary-container/20 text-primary-container font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-primary-container hover:text-on-primary transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">forum</span> Open Workspace
                      </button>
                    </div>
                  </div>

                  {/* Active Grid Control Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Progress details */}
                    <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase text-on-surface/40 tracking-wider">C-Suite Alignment</div>
                      <div className="space-y-3">
                        {[
                          { agent: 'Atlas', role: 'CEO', status: 'Running', progress: '100%' },
                          { agent: 'Ghost', role: 'CTO', status: 'Building', progress: '65%' },
                          { agent: 'Aria', role: 'CMO', status: 'Positioning', progress: '40%' }
                        ].map((a, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-on-surface/80">{a.agent} ({a.role})</span>
                            <span className="font-mono text-primary-container font-bold text-[10px]">{a.progress}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Roadblock Alerts */}
                    <div className="bg-[#181d18] border border-outline-variant/10 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">warning</span> Needs Input
                        </div>
                        <p className="text-[11px] text-on-surface/60 font-body leading-relaxed mt-2 italic">
                          "Atlas is requesting clarification on target customer persona parameters."
                        </p>
                      </div>
                      <button 
                        onClick={() => router.push('/dashboard/chat')}
                        className="w-full mt-2 py-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[8px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-black transition-all rounded-lg"
                      >
                        Answer CEO
                      </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase text-on-surface/40 tracking-wider">Workspace Health</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                          <div className="text-xl font-black font-headline text-white">{activeOrg.deptCount}</div>
                          <div className="text-[8px] font-mono text-on-surface/40 uppercase mt-1">Departments</div>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                          <div className="text-xl font-black font-headline text-white">{activeOrg.agentCount}</div>
                          <div className="text-[8px] font-mono text-on-surface/40 uppercase mt-1">C-Suite Officers</div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ALL STARTUP WORKSPACES SECTION */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface/30">Active Startup Portfolios</h3>
                  <p className="text-[10px] font-body text-on-secondary-container mt-1">Click any startup project below to view details or switch workspaces.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => {
                    const isActive = activeOrg?.id === project.id;
                    return (
                      <div 
                        key={project.id} 
                        className={`p-6 border rounded-xl bg-surface-container-high/40 hover:bg-surface-container-high/70 hover:border-primary-container/30 transition-all duration-300 group flex flex-col justify-between min-h-[190px] relative overflow-hidden ${
                          isActive ? 'border-primary-container shadow-[0_4px_25px_rgba(0,195,103,0.04)] bg-primary-container/[0.02]' : 'border-outline-variant/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[8px] font-mono uppercase bg-white/5 px-2 py-0.5 border border-white/10 rounded text-on-surface/40 font-bold tracking-widest">
                              {project.plan.toUpperCase()}
                            </span>
                            {isActive && (
                              <span className="text-[8px] font-mono font-bold text-primary-container tracking-widest flex items-center gap-1 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-lg font-black font-headline text-on-surface uppercase tracking-tight group-hover:text-primary-container transition-colors truncate">
                            {project.name}
                          </h4>
                          
                          <div className="text-[9px] font-mono text-on-surface/30 uppercase mt-1">
                            {project.deptCount} DEPTS · {project.agentCount} ACTIVE OFFICERS
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6 pt-4 border-t border-outline-variant/10">
                          <button 
                            onClick={() => {
                              toast.info(`Activating operational workspace: ${project.name}...`);
                              // Simulating workspace switch
                              router.push('/dashboard/chat');
                            }}
                            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                              isActive
                                ? 'bg-primary-container text-on-primary hover:scale-[1.02]'
                                : 'bg-surface-container-high border border-outline-variant/20 text-on-surface/60 hover:text-on-surface hover:border-outline-variant/40'
                            }`}
                          >
                            Open Workspace
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty / New Startup Card */}
                  <div 
                    onClick={() => {
                      if (!isPremium) {
                        toast.error('Launch multiple startup projects is a premium tier benefit. Upgrade to launch.');
                      } else {
                        setShowCreateModal(true);
                      }
                    }}
                    className="p-6 bg-surface-container-low/20 rounded-xl border border-outline-variant/10 border-dashed hover:border-primary-container/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[190px] gap-3 group text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface/30 group-hover:text-primary-container group-hover:border-primary-container/30 transition-all duration-300">
                      <span className="material-symbols-outlined text-lg">add</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black font-label uppercase tracking-widest text-on-surface/40 group-hover:text-on-surface transition-colors block">
                        Provision New Startup
                      </span>
                      <span className="text-[8px] font-mono text-on-surface/20 uppercase tracking-wide block mt-1">
                        {!isPremium ? 'Upgrade to Unlock Multiple' : 'Launch New Venture'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* INTENSIVE STARTUP INTAKE WIZARD MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/85 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-[#0e110e] border border-outline-variant/15 rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
              
              {/* Header */}
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-[#121512]">
                <div>
                  <h2 className="text-sm font-black font-headline text-on-surface uppercase tracking-wider">INTAKE: PROVISION NEW STARTUP</h2>
                  <p className="text-[9px] font-mono text-on-surface/40 uppercase mt-1">Set startup parameters to align the operational C-Suite</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="material-symbols-outlined text-on-surface/40 hover:text-on-surface text-sm">close</button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black font-mono text-primary-container uppercase tracking-widest block">1. Startup / Venture Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Apex Logistics"
                    className="w-full bg-[#131513] border border-outline-variant/15 rounded-lg p-3 text-xs text-on-surface font-body outline-none focus:border-primary-container/30 transition-all"
                  />
                </div>

                {/* 2. Niche */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black font-mono text-primary-container uppercase tracking-widest block">2. Target Market / Niche</label>
                  <input 
                    type="text"
                    required
                    value={formData.niche}
                    onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                    placeholder="Ex: Decentralized cargo routing for local fleets"
                    className="w-full bg-[#131513] border border-outline-variant/15 rounded-lg p-3 text-xs text-on-surface font-body outline-none focus:border-primary-container/30 transition-all"
                  />
                </div>

                {/* 3. Audience */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black font-mono text-primary-container uppercase tracking-widest block">3. Primary Target Audience</label>
                  <input 
                    type="text"
                    required
                    value={formData.audience}
                    onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                    placeholder="Ex: Independent truck owners and cargo forwarders"
                    className="w-full bg-[#131513] border border-outline-variant/15 rounded-lg p-3 text-xs text-on-surface font-body outline-none focus:border-primary-container/30 transition-all"
                  />
                </div>

                {/* 4. Competitor */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black font-mono text-primary-container uppercase tracking-widest block">4. Main Competitor or Alternative</label>
                  <input 
                    type="text"
                    required
                    value={formData.competitor}
                    onChange={(e) => setFormData(prev => ({ ...prev, competitor: e.target.value }))}
                    placeholder="Ex: Traditional logistics brokers and spreadsheet management"
                    className="w-full bg-[#131513] border border-outline-variant/15 rounded-lg p-3 text-xs text-on-surface font-body outline-none focus:border-primary-container/30 transition-all"
                  />
                </div>

                {/* 5. Operational Focus */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black font-mono text-primary-container uppercase tracking-widest block">5. Primary Operational Focus</label>
                  <select 
                    value={formData.operationalFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, operationalFocus: e.target.value }))}
                    className="w-full bg-[#131513] border border-outline-variant/15 rounded-lg p-3 text-xs text-on-surface font-body outline-none focus:border-primary-container/30 transition-all cursor-pointer"
                  >
                    <option value="MVP Development">MVP Development & Database Scaffolding</option>
                    <option value="B2B Sales Outreach">B2B Prospecting & Cold Email Sequences</option>
                    <option value="Social Launch & Growth">Viral Hook Generation & Social Marketing</option>
                    <option value="Operational Scaling">Ops Optimization & Workflows</option>
                  </select>
                </div>

                {/* Submit button */}
                <button 
                  type="submit"
                  disabled={isProvisioning || !formData.name.trim()}
                  className={`w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all mt-4 ${
                    isProvisioning || !formData.name.trim()
                    ? 'bg-surface-container-high text-on-surface/20 cursor-not-allowed border border-outline-variant/5'
                    : 'bg-primary-container text-on-primary shadow-[0_12px_40px_rgba(0,195,103,0.2)] hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {isProvisioning ? 'Atlas is provisioning C-Suite offices...' : 'Launch Operational Office'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
