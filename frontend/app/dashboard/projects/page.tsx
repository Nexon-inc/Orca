'use client';

import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [showIdeation, setShowIdeation] = useState(false);
  const [ideationInput, setIdeationInput] = useState('');
  const [ideationResult, setIdeationResult] = useState<string | null>(null);
  const [isIdeating, setIsIdeating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, orgRes] = await Promise.all([
          fetch('/api/projects/list'),
          fetch('/api/org')
        ]);
        const projData = await projRes.json();
        const orgData = await orgRes.json();
        
        setProjects(projData.projects || []);
        setUserPlan(orgData.member?.organizations?.plan || 'free');
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleIdeate = async () => {
    if (!ideationInput.trim()) return;
    setIsIdeating(true);
    setIdeationResult(null);

    try {
      const res = await fetch('/api/projects/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: ideationInput })
      });
      const data = await res.json();
      setIdeationResult(data.recommendation);
    } catch (err) {
      setIdeationResult("Failed to generate report. Please check your connectivity.");
    } finally {
      setIsIdeating(false);
    }
  };

  const isPremium = ['builder', 'pro', 'enterprise'].includes(userPlan);

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="projects" />

      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-12 no-scrollbar">
          
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase border-b-2 border-primary-container inline-block pb-1">
                PROJECTS
              </h1>
              <p className="font-body text-sm text-on-secondary-container mt-4">
                Manage your organizations and launch new business ventures.
              </p>
            </div>
            
            <button 
              onClick={() => setShowIdeation(true)}
              className="px-6 py-2.5 bg-primary-container text-on-primary font-black uppercase text-[10px] tracking-widest rounded-sm neon-glow flex items-center gap-2 hover:bg-primary-fixed transition-all"
            >
              <span className="material-symbols-outlined text-sm">psychology</span>
              AI_IDEATION_ENGINE
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-[10px] font-mono text-on-surface/20 uppercase animate-pulse">Initializing_Sync...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="p-6 bg-surface-container rounded-lg border border-outline-variant/10 hover:bg-surface-bright hover:border-primary-container/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary-container neon-glow"></span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-primary-container/60">
                      {project.plan.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-xl font-black font-headline text-on-surface uppercase tracking-tighter mb-1 truncate">
                    {project.name}
                  </div>
                  
                  <div className="text-[10px] font-mono text-on-surface/30 uppercase tracking-wide mb-6">
                    {project.deptCount} DEPTS · {project.agentCount} AGENTS
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant/10">
                    <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-primary-container/10 border border-primary-container/40 text-primary-container rounded-sm hover:bg-primary-container hover:text-on-primary transition-colors">
                      OPEN →
                    </button>
                    <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border border-outline-variant/20 text-on-surface/40 rounded-sm hover:border-outline-variant/40 hover:text-on-surface transition-colors">
                      SETTINGS
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-6 bg-surface-container-low rounded-lg border border-outline-variant/10 border-dashed hover:border-primary-container/30 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] gap-3">
                <span className="material-symbols-outlined text-2xl text-on-surface/20">add</span>
                <span className="text-[10px] font-black font-label uppercase tracking-widest text-on-surface/30">
                  NEW_PROJECT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Ideation Modal */}
        {showIdeation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/80 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-[#1a1c1a] border border-[#2d312d] rounded-xl overflow-hidden shadow-2xl relative">
              
              {!isPremium ? (
                <div className="p-12 text-center flex flex-col items-center gap-6">
                  <span className="material-symbols-outlined text-5xl text-primary-container">lock</span>
                  <h2 className="text-2xl font-black font-headline text-on-surface uppercase">Premium Feature</h2>
                  <p className="text-sm font-body text-on-surface/60 leading-relaxed">
                    The AI Ideation Engine is only available to <span className="text-primary-container font-black">BUILDER</span> and <span className="text-primary-container font-black">PRO</span> tiers. Upgrade to let Atlas research and launch your next venture.
                  </p>
                  <button className="mt-4 px-8 py-3 bg-primary-container text-on-primary font-black uppercase text-[11px] tracking-widest rounded-sm neon-glow">
                    UPGRADE_NOW
                  </button>
                  <button 
                    onClick={() => setShowIdeation(false)}
                    className="mt-2 text-[10px] font-black text-on-surface/30 uppercase tracking-widest hover:text-on-surface"
                  >
                    CLOSE
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                    <h2 className="text-lg font-black font-headline text-on-surface uppercase tracking-tight">AI IDEATION ENGINE</h2>
                    <button onClick={() => setShowIdeation(false)} className="material-symbols-outlined text-on-surface/40 hover:text-on-surface">close</button>
                  </div>

                  <div className="p-8">
                    {ideationResult ? (
                      <div className="flex flex-col gap-6">
                        <div className="p-6 bg-surface-container-high rounded-lg text-sm text-on-surface font-mono whitespace-pre-wrap leading-relaxed border border-primary-container/20">
                          {ideationResult}
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setIdeationResult(null)}
                            className="flex-1 py-3 border border-outline-variant/20 text-[10px] font-black uppercase text-on-surface/40 hover:text-on-surface hover:border-on-surface"
                          >
                            RE-GENERATE
                          </button>
                          <button className="flex-1 py-3 bg-primary-container text-on-primary text-[10px] font-black uppercase neon-glow">
                            DEPLOY_PROJECT
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <p className="text-sm font-body text-on-surface/60">
                          Describe a seedling idea or ask Atlas to suggest a niche based on current market trends.
                        </p>
                        <textarea 
                          value={ideationInput}
                          onChange={(e) => setIdeationInput(e.target.value)}
                          placeholder="Ex: I want to build a decentralized logistics platform for Africa..."
                          className="w-full bg-[#131513] border border-[#2d312d] rounded-lg p-4 text-sm text-on-surface font-body resize-none h-32 focus:border-primary-container/30 transition-all outline-none"
                        />
                        <button 
                          onClick={handleIdeate}
                          disabled={isIdeating || !ideationInput.trim()}
                          className={`w-full py-4 text-[11px] font-black uppercase tracking-widest transition-all ${
                            isIdeating || !ideationInput.trim()
                            ? 'bg-surface-container-high text-on-surface/20 cursor-not-allowed'
                            : 'bg-primary-container text-on-primary neon-glow hover:bg-primary-fixed'
                          }`}
                        >
                          {isIdeating ? 'RESEARCHING_MARKETS...' : 'INITIALIZE_BRAINSTORM'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
