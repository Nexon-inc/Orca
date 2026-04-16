'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function OrcaHubPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'integrations'>('templates');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = ['ALL', 'STARTUP', 'MARKETING', 'E-COMMERCE', 'DEV_STUDIO', 'CREATOR'];

  const templates = [
    {
      id: 'startup',
      icon: '🚀',
      name: 'STARTUP_OS',
      category: 'STARTUP',
      description: 'The complete Autonomous OS for early-stage software companies. Deploys all 6 Core Executives.',
      stats: '6 DEPTS · 6 AGENTS · 1.2K INSTALL'
    },
    {
      id: 'marketing',
      icon: '📣',
      name: 'MARKETING_OS',
      category: 'MARKETING',
      description: 'High-performance marketing engine with full executive oversight.',
      stats: '4 DEPTS · 4 AGENTS · 942 INSTALL'
    },
    {
      id: 'e-commerce',
      icon: '🛒',
      name: 'E-COMMERCE_OS',
      category: 'E-COMMERCE',
      description: 'DTC retail powerhouse for scaling physical and digital brands.',
      stats: '4 DEPTS · 4 AGENTS · 522 INSTALL'
    },
    {
      id: 'dev-studio',
      icon: '🛠️',
      name: 'DEV_STUDIO_OS',
      category: 'DEV_STUDIO',
      description: 'Technical-first OS for shipping and maintaining high security standards.',
      stats: '3 DEPTS · 3 AGENTS · 312 INSTALL'
    },
    {
      id: 'creator',
      icon: '🎬',
      name: 'CREATOR_OS',
      category: 'CREATOR',
      description: 'Personal brand and audience growth engine for modern creators.',
      stats: '3 DEPTS · 3 AGENTS · 847 INSTALL'
    }
  ];

  const handleInstall = async (slug: string) => {
    try {
      const res = await fetch(`/api/orcahub/${slug}/install`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        window.location.href = `/dashboard/chat?installed=${slug}`;
      } else {
        alert(data.error || 'Installation failed');
      }
    } catch (err) {
      alert('Network error during installation');
    }
  };

  const integrations = [
    {
      role: 'CMO_INTEGRATIONS',
      icon: '📣',
      items: [
        { id: 'linkedin', name: 'LINKEDIN', type: 'SOCIAL_OUTREACH', connected: true },
        { id: 'twitter', name: 'TWITTER / X', type: 'BRAND_PRESENCE', connected: false },
        { id: 'hubspot', name: 'HUBSPOT', type: 'CRM_SYNC', connected: false }
      ]
    },
    {
      role: 'CSO_INTEGRATIONS',
      icon: '💼',
      items: [
        { id: 'salesforce', name: 'SALESFORCE', type: 'PIPELINE_MANAGEMENT', connected: true },
        { id: 'close', name: 'CLOSE.IO', type: 'CRM_SYNC', connected: false }
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
                    {f}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map(tpl => (
                  <div key={tpl.id} className="bg-surface-container p-6 rounded-lg border border-outline-variant/10 hover:bg-surface-bright hover:border-outline-variant/20 transition-all cursor-pointer group flex flex-col">
                    
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-2xl mb-1">{tpl.icon}</div>
                        <div className="text-[13px] font-black font-headline text-on-surface uppercase tracking-wide">
                          {tpl.name}
                        </div>
                      </div>
                      <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em] text-primary-container/60">
                        {tpl.category}
                      </span>
                    </div>
                    
                    <p className="text-[11px] font-body text-on-secondary-container leading-relaxed mb-6 flex-1">
                      {tpl.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-6 whitespace-nowrap overflow-hidden text-ellipsis">
                      {tpl.stats}
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest border border-outline-variant/20 text-on-surface/40 rounded-sm hover:border-primary-container/40 hover:text-on-surface transition-colors">
                        PREVIEW
                      </button>
                      <button 
                        onClick={() => handleInstall(tpl.id)}
                        className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest bg-primary-container/10 border border-primary-container/40 text-primary-container rounded-sm hover:bg-primary-container hover:text-on-primary transition-colors"
                      >
                        INSTALL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-8 max-w-3xl">
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
                          <div className="w-10 h-10 rounded-sm bg-surface-container-high flex items-center justify-center text-sm border border-outline-variant/20">
                            ✨
                          </div>
                          <div>
                            <div className="text-[11px] font-black font-label text-on-surface uppercase tracking-wide">
                              {item.name}
                            </div>
                            <div className="text-[9px] font-mono text-on-surface/30 uppercase mt-0.5">
                              {item.type}
                            </div>
                          </div>
                        </div>
                        
                        {item.connected ? (
                          <button className="text-[9px] font-black font-mono text-primary-container uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                            CONNECTED
                          </button>
                        ) : (
                          <button className="text-[9px] font-black font-mono text-on-surface/30 uppercase tracking-widest hover:text-primary-container transition-colors">
                            CONNECT →
                          </button>
                        )}
                        
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
