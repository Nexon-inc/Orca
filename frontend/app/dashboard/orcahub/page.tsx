'use client';

import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

const DEPT_ICONS: Record<string, string> = {
  saas_startup: '🚀', marketing_agency: '📣', ecommerce: '🛒',
  recruiting_firm: '🧠', dev_agency: '⚙️', intelligence: '🔍',
};

export default function OrcaHubPage() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'system'>('system');
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [installing, setInstalling] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orcahub')
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const filtered = templates.filter(t =>
    (category === 'all' || t.category === category) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInstall = async (slug: string) => {
    setInstalling(slug);
    try {
      const res = await fetch(`/api/orcahub/${slug}/install`, { method: 'POST' });
      if (res.ok) {
        setTemplates(prev => prev.map(t => t.slug === slug ? { ...t, is_installed: true } : t));
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch {
      alert('Installation failed.');
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="flex h-screen bg-bg font-syne overflow-hidden">
      <DashboardSidebar active="orcahub" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-bg/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-syne text-2xl font-[900] text-white uppercase tracking-tight">OrcaHub</h1>
            <p className="font-syne text-white/30 text-[10px] uppercase tracking-[0.2em] font-black">Coordinated intelligence marketplace.</p>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
             <button 
              onClick={() => setActiveTab('prompts')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'prompts' ? 'bg-green text-bg shadow-lg' : 'text-white/40 hover:text-white'}`}
             >
               Executive Prompts
             </button>
             <button 
              onClick={() => setActiveTab('system')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-green text-bg shadow-lg' : 'text-white/40 hover:text-white'}`}
             >
               System Templates
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {activeTab === 'system' ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full font-syne text-[10px] uppercase tracking-[0.15em] border transition-all whitespace-nowrap font-black ${category === cat ? 'bg-green text-bg border-green' : 'bg-surface/50 text-white/30 border-white/5 hover:border-white/20 hover:text-white'}`}
                    >
                      {cat === 'all' ? 'All' : cat.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search systems..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 font-syne text-xs text-white focus:border-green/50 outline-none transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-surface/50 border border-white/5 rounded-3xl overflow-hidden animate-pulse h-[400px]" />
                  ))
                ) : filtered.length > 0 ? filtered.map(template => (
                  <div key={template.slug} className="group relative bg-surface/50 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-green/20 transition-all duration-500 flex flex-col">
                    <div className="h-40 bg-bg/50 flex items-center justify-center text-5xl opacity-20 group-hover:opacity-40 transition-opacity">
                      {DEPT_ICONS[template.category] || '⬡'}
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2 py-1 rounded bg-green/10 border border-green/20 text-green text-[9px] font-black uppercase tracking-widest">
                          {template.category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">5 EXECUTIVE ENGINE</span>
                      </div>

                      <h3 className="font-syne text-xl font-[900] text-white group-hover:text-green transition-colors uppercase tracking-tight mb-2">
                        {template.name}
                      </h3>
                      
                      <p className="font-syne text-[12px] text-white/40 mb-6 leading-relaxed uppercase tracking-tight flex-1">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5 mb-6">
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] text-green font-black uppercase tracking-widest">Full Executive Team</span>
                           <span className="text-[8px] text-white/20 uppercase font-black tracking-tighter">CMO · CSO · CCO · CIO · CTO</span>
                        </div>
                        {template.is_installed && (
                          <div className="w-6 h-6 rounded-full bg-green/20 flex items-center justify-center text-green text-[10px]">✓</div>
                        )}
                      </div>

                      <button
                        onClick={() => !template.is_installed && template.is_accessible && handleInstall(template.slug)}
                        disabled={!!installing || template.is_installed || !template.is_accessible}
                        className={`w-full py-4 rounded-xl font-syne font-black text-[11px] uppercase tracking-[0.2em] transition-all ${
                          template.is_installed
                            ? 'bg-green/10 text-green cursor-default border border-green/20 shadow-none'
                            : !template.is_accessible
                            ? 'bg-white/5 text-white/20 cursor-not-allowed border border-transparent shadow-none'
                            : installing === template.slug
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-green text-bg shadow-[0_4px_20px_rgba(0,255,135,0.2)] hover:scale-[1.02]'
                        }`}
                      >
                        {installing === template.slug ? 'SYNCHRONIZING...' : template.is_installed ? 'INSTALLED' : 'PURCHASE & SYNC'}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center font-syne border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-black">No matching systems found.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
               <div className="p-8 rounded-[2rem] border border-white/5 bg-surface/50 backdrop-blur-sm">
                  <header className="flex items-center justify-between mb-8">
                     <div className="flex flex-col">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Executive Prompt Lab</h3>
                        <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Tune the core intelligence of your leaders.</span>
                     </div>
                     <button className="px-6 py-2 rounded-xl bg-green text-bg text-[10px] font-black uppercase tracking-widest shadow-xl">Deploy Changes</button>
                  </header>

                  <div className="space-y-4">
                     {['ATLAS', 'ARIA', 'REX', 'PURITY', 'ROMAN', 'GHOST'].map(exec => (
                        <div key={exec} className="p-6 rounded-2xl border border-white/5 bg-bg/50 hover:border-green/20 transition-all cursor-pointer group">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                 <span className="text-green group-hover:scale-125 transition-transform">⬡</span> {exec} System Prompt
                              </span>
                              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">v2.4.1 — Consolidated</span>
                           </div>
                           <p className="text-[10px] text-white/30 uppercase tracking-tight">Managing department operations and tool coordination...</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
  );
}

