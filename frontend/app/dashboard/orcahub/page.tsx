'use client';

import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

const DEPT_ICONS: Record<string, string> = {
  saas_startup: '🚀', marketing_agency: '📣', ecommerce: '🛒',
  recruiting_firm: '🧠', dev_agency: '⚙️', intelligence: '🔍',
};

export default function OrcaHubPage() {
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
        // Mark installed locally
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
    <div className="flex min-h-screen bg-bg font-syne">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-syne text-3xl font-[800] text-white mb-2 uppercase tracking-tight">OrcaHub</h1>
            <p className="font-syne text-white/40 text-[11px] uppercase tracking-widest font-[800]">Ready-to-use business templates. Install and go.</p>
          </div>

          {templates.length > 0 && (
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

        {templates.length > 0 && (
          <div className="flex gap-2 mb-12 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full font-syne text-[11px] uppercase tracking-widest border transition-all whitespace-nowrap ${category === cat ? 'bg-green text-bg border-green font-[800]' : 'bg-surface/50 text-white/40 border-white/5 hover:border-white/20'}`}
              >
                {cat === 'all' ? 'All' : cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface border border-white/5 rounded-3xl overflow-hidden animate-pulse">
                <div className="h-48 bg-white/5" />
                <div className="p-8 space-y-4">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-5 bg-white/5 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-4/5" />
                  <div className="h-12 bg-white/5 rounded-xl mt-8" />
                </div>
              </div>
            ))
          ) : filtered.length > 0 ? filtered.map(template => {
            
            // Extract dept/agent counts if available from the backend or fallback to static mappings
            const depts = template.tags?.includes('depts:') ? template.tags.find((t:string) => t.startsWith('depts:'))?.split(':')[1] : (template.name.includes('SaaS') ? '4' : template.name.includes('Content') ? '4' : template.name.includes('E-commerce') ? '4' : template.name.includes('Recruiting') ? '4' : template.name.includes('Dev') ? '4' : '3');
            const agentsCount = template.tags?.includes('agents:') ? template.tags.find((t:string) => t.startsWith('agents:'))?.split(':')[1] : (template.name.includes('SaaS') ? '16' : template.name.includes('Content') ? '18' : template.name.includes('E-commerce') ? '19' : template.name.includes('Recruiting') ? '17' : template.name.includes('Dev') ? '19' : '15');

            return (
            <div key={template.slug} className="group relative bg-surface border border-white/5 rounded-3xl overflow-hidden hover:border-green/20 transition-all duration-500">
              <div className="h-48 bg-bg flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
                {DEPT_ICONS[template.category] || (template.name.includes('SaaS') ? '🚀' : template.name.includes('Content') ? '📣' : template.name.includes('E-commerce') ? '🛒' : template.name.includes('Recruiting') ? '💼' : template.name.includes('Dev') ? '🛠️' : '🔍')}
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <span className="px-2 py-1 rounded bg-green/10 border border-green/20 text-green w-fit text-[9px] font-syne font-[800] uppercase tracking-widest">
                      {template.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-syne font-[800] uppercase tracking-widest ${template.is_accessible ? 'bg-white/5 text-white/20' : 'bg-amber-500/10 text-amber-500/60 border border-amber-500/20'}`}>
                     {template.is_accessible ? template.plan_required : `🔒 Requires ${template.plan_required.toUpperCase()}`}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                   <h3 className="font-syne text-xl font-[800] text-white group-hover:text-green transition-colors uppercase tracking-tight">
                     {template.name}
                   </h3>
                </div>
                
                <div className="font-syne text-[10px] text-white/30 uppercase tracking-widest font-[800] mb-4">
                  {depts} departments · {agentsCount} agents
                </div>

                <p className="font-syne text-[13px] text-white/40 mb-6 leading-relaxed uppercase tracking-tight">
                  {template.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mb-6">
                  <div className="font-syne text-[10px] text-white/20 uppercase font-[800] tracking-widest">
                    {template.installs || 0} installs
                  </div>
                  {template.is_installed && (
                    <span className="text-[9px] text-green font-[800] uppercase tracking-widest">✓ Installed</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 py-4 rounded-xl border border-white/10 font-syne font-[800] text-[11px] uppercase tracking-widest transition-all bg-transparent text-white hover:bg-white/10"
                  >
                    Preview →
                  </button>
                  <button
                    onClick={() => !template.is_installed && template.is_accessible && handleInstall(template.slug)}
                    disabled={!!installing || template.is_installed || !template.is_accessible}
                    className={`flex-1 py-4 rounded-xl font-syne font-[800] text-[11px] uppercase tracking-widest transition-all ${
                      template.is_installed
                        ? 'bg-green/10 text-green cursor-default border border-green/20'
                        : !template.is_accessible
                        ? 'bg-white/5 text-white/20 cursor-not-allowed border border-transparent'
                        : installing === template.slug
                        ? 'bg-white/5 text-white/30 cursor-not-allowed border border-transparent'
                        : 'bg-white/5 text-white hover:bg-green hover:text-bg shadow-sm border border-transparent'
                    }`}
                  >
                    {installing === template.slug ? 'Installing...' : template.is_installed ? '✓ Installed' : 'Install →'}
                  </button>
                </div>
              </div>
            </div>
          )}) : (
            <div className="col-span-full py-20 text-center font-syne border border-white/5 rounded-3xl bg-surface">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-xl mx-auto mb-6 opacity-50">🔍</div>
              <h3 className="text-white font-[800] text-lg uppercase tracking-widest mb-2">No templates found</h3>
              <p className="text-white/40 text-[11px] uppercase tracking-widest font-[800]">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

