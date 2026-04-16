'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function ArchivesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const sessions = [
    {
      id: 'SESSION_042',
      title: 'CMO_BRIEF_Q1_LAUNCH',
      agent: 'ARIA (CMO)',
      date: '14 APR 2026',
      icon: 'campaign'
    },
    {
      id: 'SESSION_041',
      title: 'CSO_LEADS_ANALYSIS',
      agent: 'REX (CSO)',
      date: '12 APR 2026',
      icon: 'work'
    },
    {
      id: 'SESSION_040',
      title: 'CTO_SECURITY_SCAN',
      agent: 'GHOST (CTO)',
      date: '10 APR 2026',
      icon: 'security'
    },
    {
      id: 'SESSION_039',
      title: 'DEPT_SYNC_Q2_PLANNING',
      agent: 'ATLAS (CEO)',
      date: '08 APR 2026',
      icon: 'terminal'
    }
  ];

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    session.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="archives" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-12 no-scrollbar">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase">
              ARCHIVES
            </h1>
            <p className="font-body text-sm text-on-secondary-container mt-2">
              Your complete conversation history.
            </p>
          </div>

          {/* Search Input */}
          <div className="border-b border-outline-variant/30 pb-1 mb-6 focus-within:border-primary-container/50 transition-colors">
            <input 
              className="w-full bg-transparent text-sm font-body text-on-surface placeholder:text-on-surface/20 border-none outline-none focus:ring-0 pb-1" 
              placeholder="SEARCH_ARCHIVES..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Session List */}
          <div className="flex flex-col gap-1">
            {filteredSessions.map(session => (
              <div 
                key={session.id} 
                className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container-high rounded-lg cursor-pointer transition-all group"
              >
                {/* Icon */}
                <span className="material-symbols-outlined text-sm text-primary-container/40 group-hover:text-primary-container/70 transition-colors">
                  {session.icon}
                </span>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black font-mono text-on-surface uppercase tracking-wide truncate">
                    {session.title}
                  </div>
                  <div className="text-[9px] font-mono text-on-surface/30 uppercase mt-0.5">
                    {session.agent} · {session.date} · {session.id}
                  </div>
                </div>
                
                {/* Arrow */}
                <span className="material-symbols-outlined text-xs text-on-surface/20 group-hover:text-primary-container/50 transition-colors">
                  arrow_forward
                </span>
              </div>
            ))}
            
            {filteredSessions.length === 0 && (
              <div className="py-12 text-center text-[10px] font-mono text-on-surface/30 uppercase tracking-widest">
                NO_MATCHING_SESSIONS_FOUND
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
