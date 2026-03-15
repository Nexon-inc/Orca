'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Navigation from '@/components/Navigation';
import DashboardSidebar from '@/components/DashboardSidebar';

const TEMPLATES = [
  { slug: 'saas-startup', name: 'SaaS Startup', category: 'Startup', agents: '16', depts: '4', plan: 'Free', icon: '🚀', description: 'Lean setup for early-stage software companies.', installs: 247 },
  { slug: 'marketing-agency', name: 'Content Marketing Agency', category: 'Marketing', agents: '18', depts: '4', plan: 'Starter', icon: '📣', description: 'Optimized for high-volume content production.', installs: 182 },
  { slug: 'ecommerce-operator', name: 'E-commerce Operator', category: 'E-commerce', agents: '19', depts: '4', plan: 'Starter', icon: '🛒', description: 'Full stack management for online stores.', installs: 156 },
  { slug: 'recruiting-firm', name: 'Recruiting Firm', category: 'Hiring', agents: '17', depts: '4', plan: 'Pro', icon: '💼', description: 'Talent sourcing and verification pipeline.', installs: 94 },
  { slug: 'dev-agency', name: 'Dev Agency', category: 'Technology', agents: '19', depts: '4', plan: 'Pro', icon: '🛠️', description: 'Agile development and security-first ops.', installs: 112 },
  { slug: 'intel-desk', name: 'Intelligence & Research Desk', category: 'Research', agents: '15', depts: '3', plan: 'Pro', icon: '🔍', description: 'Deep market research and competitor tracking.', installs: 78 }
];

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
        alert('Template installed successfully! Check your Command Center for Day 1 Briefs.');
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
    <div className="flex min-h-screen bg-bg">
      <DashboardSidebar active="orcahub" />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-syne text-3xl font-bold text-white mb-2">OrcaHub</h1>
            <p className="font-dm-mono text-text-muted text-sm uppercase tracking-wider">Pre-built company templates. Install and go.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-dm-mono text-sm text-white focus:border-green/50 outline-none"
            />
          </div>
        </header>

        <div className="flex gap-2 mb-12 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Startup', 'Marketing', 'E-commerce', 'Hiring', 'Technology', 'Research'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full font-dm-mono text-[11px] uppercase tracking-widest border transition-all ${category === cat ? 'bg-green text-bg border-green' : 'bg-surface/50 text-text-muted border-white/5 hover:border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(template => (
            <div key={template.slug} className="group relative bg-surface border border-white/5 rounded-3xl overflow-hidden hover:border-green/20 transition-all duration-500">
              <div className="h-48 bg-bg flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
                {template.icon}
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-1 rounded bg-green-dim border border-green-border text-green text-[9px] font-dm-mono uppercase">
                    {template.category}
                  </span>
                  <span className="px-2 py-1 rounded bg-white/5 text-text-muted text-[9px] font-dm-mono uppercase">
                    {template.plan}
                  </span>
                </div>
                
                <h3 className="font-syne text-xl font-bold text-white mb-2 group-hover:text-green transition-colors">
                  {template.name}
                </h3>
                
                <p className="font-dm-mono text-[12px] text-text-muted mb-6 leading-relaxed">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="font-dm-mono text-[11px] text-text-muted uppercase">
                    {template.depts} depts · {template.agents} agents
                  </div>
                  <div className="font-dm-mono text-[10px] text-white/30 truncate max-w-[80px]">
                    {template.installs} installs
                  </div>
                </div>

                <button 
                  onClick={() => handleInstall(template.slug)}
                  disabled={!!installing}
                  className={`mt-8 w-full py-4 rounded-xl font-syne font-bold text-xs uppercase tracking-widest transition-all ${installing === template.slug ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/5 text-white hover:bg-green hover:text-bg'}`}
                >
                  {installing === template.slug ? 'Installing...' : 'Install Template →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
