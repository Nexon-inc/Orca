'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Navigation from '@/components/Navigation';
import DashboardSidebar from '@/components/DashboardSidebar';

const TEMPLATES: any[] = [];

export default function OrcaHubPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [installing, setInstalling] = useState<string | null>(null);

  const filtered = TEMPLATES.filter(t => 
    (category === 'All' || t.category === category) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInstall = async (slug: string) => {
    setInstalling(slug);
    try {
      const res = await fetch(`/api/orcahub/${slug}/install`, { method: 'POST' });
      if (res.ok) {
        alert('Template installed successfully!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      alert('Installation failed.');
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg font-syne">
      <DashboardSidebar active="orcahub" />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-syne text-3xl font-[800] text-white mb-2 uppercase tracking-tight">OrcaHub</h1>
            <p className="font-syne text-white/40 text-[11px] uppercase tracking-widest font-[800]">Ready-to-use business templates. Install and go.</p>
          </div>
          
          {TEMPLATES.length > 0 && (
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-syne text-sm text-white focus:border-green/50 outline-none transition-all"
              />
            </div>
          )}
        </header>

        {TEMPLATES.length > 0 && (
          <div className="flex gap-2 mb-12 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Startup', 'Marketing', 'E-commerce', 'Hiring', 'Technology', 'Research'].map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full font-syne text-[11px] uppercase tracking-widest border transition-all ${category === cat ? 'bg-green text-bg border-green font-[800]' : 'bg-surface/50 text-white/40 border-white/5 hover:border-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length > 0 ? filtered.map(template => (
            <div key={template.slug} className="group relative bg-surface border border-white/5 rounded-3xl overflow-hidden hover:border-green/20 transition-all duration-500">
              <div className="h-48 bg-bg flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
                {template.icon}
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                   <span className="px-2 py-1 rounded bg-green/10 border border-green/20 text-green text-[9px] font-syne font-[800] uppercase tracking-widest">
                    {template.category}
                  </span>
                   <span className="px-2 py-1 rounded bg-white/5 text-white/20 text-[9px] font-syne font-[800] uppercase tracking-widest">
                    {template.plan}
                  </span>
                </div>
                
                <h3 className="font-syne text-xl font-[800] text-white mb-2 group-hover:text-green transition-colors uppercase tracking-tight">
                   {template.name}
                </h3>
                
                <p className="font-syne text-[13px] text-white/40 mb-6 leading-relaxed uppercase tracking-tight">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <div className="font-syne text-[10px] text-white/20 uppercase font-[800] tracking-widest">
                    {template.depts} depts · {template.agents} agents
                  </div>
                   <div className="font-syne text-[10px] text-white/10 truncate max-w-[80px] font-[800] uppercase tracking-widest">
                    {template.installs} installs
                  </div>
                </div>

                <button 
                   onClick={() => handleInstall(template.slug)}
                   disabled={!!installing}
                   className={`mt-8 w-full py-4 rounded-xl font-syne font-[800] text-[11px] uppercase tracking-widest transition-all ${installing === template.slug ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/5 text-white hover:bg-green hover:text-bg shadow-sm'}`}
                >
                   {installing === template.slug ? 'Installing...' : 'Install Template'}
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
               <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl mx-auto mb-6 opacity-40">📦</div>
               <p className="font-syne text-[11px] text-white/20 font-[800] uppercase tracking-[0.2em]">Updating Ecosystem Components...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
