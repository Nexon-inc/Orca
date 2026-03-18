'use client';

import { useState, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { AGENT_ROSTER, getAgentById } from '@/lib/agents';
import DashboardSidebar from '@/components/DashboardSidebar';

// Dashboard Local Constants
const departments: any[] = [];

const coordEvents: any[] = [];

const liveActivity: any[] = [];

export default function DashboardPage() {
  useEffect(() => {
    animate('.dash-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Overview</h2>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-[10px] text-green font-[800] uppercase tracking-widest">0 AGENTS ONLINE</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/40 text-[11px] font-[800] uppercase tracking-widest leading-none">
               System Health: <span className="text-green/40">Initializing</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-8 flex flex-col gap-10 overflow-y-auto no-scrollbar">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 dash-anim opacity-0">
            {[
              { label: 'TASKS EXECUTED', val: '0', trend: '—', desc: 'Today' },
              { label: 'COORD. EVENTS', val: '0', trend: '—', desc: 'Last 24h' },
              { label: 'AVG EFFICIENCY', val: '0%', trend: '—', desc: 'Real-time' },
              { label: 'REVENUE IMPACT', val: '$0', trend: '—', desc: 'This Week' },
            ].map(stat => (
              <div key={stat.label} className="p-6 rounded-2xl bg-surface/50 border border-white/5 flex flex-col gap-1 group hover:border-green/20 transition-all cursor-default">
                <span className="text-[9px] text-white/40 uppercase font-[900] tracking-[0.2em] group-hover:text-green transition-colors">{stat.label}</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-[800] text-green group-hover:text-white transition-colors tracking-tight">{stat.val}</span>
                   <span className="text-[10px] text-green font-[800]">{stat.trend}</span>
                </div>
                <span className="text-[9px] text-white/20 font-[800] uppercase tracking-widest">{stat.desc}</span>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 dash-anim opacity-0">
             {/* Department Grid */}
             <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-syne font-[800] text-white/60 text-[11px] uppercase tracking-[0.2em]">Department Status</h3>
                   <span className="text-[9px] text-green font-[900] uppercase tracking-widest px-2 py-0.5 border border-green/20 rounded-full">3x3 Cluster Live</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   {departments.length > 0 ? departments.map(dept => (
                      <div key={dept.id} className="p-5 rounded-[2rem] border border-white/5 bg-surface/30 group hover:border-green/20 transition-all cursor-pointer relative overflow-hidden">
                         <div className="mb-3 flex items-center justify-between relative z-10">
                            <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{dept.emoji}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${dept.status === 'ACTIVE' ? 'bg-green animate-pulse' : 'bg-white/10'}`} />
                         </div>
                         <h4 className="font-syne text-[13px] font-[800] text-white group-hover:text-green transition-colors uppercase tracking-tight mb-1 relative z-10">{dept.name}</h4>
                         <div className="flex items-center gap-2 relative z-10">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-green/40 transition-all duration-1000" style={{ width: `${dept.load}%` }} />
                            </div>
                            <span className="text-[9px] font-syne text-white/40 font-[800] group-hover:text-white transition-colors uppercase tracking-tight">{dept.load}%</span>
                         </div>
                         <div className="absolute inset-0 bg-green/0 group-hover:bg-green/[0.02] transition-colors" />
                      </div>
                   )) : (
                      <div className="col-span-3 py-12 text-center border border-dashed border-white/5 rounded-[2rem]">
                         <p className="text-[10px] text-white/20 font-[800] uppercase tracking-widest">Waiting for department protocols...</p>
                      </div>
                   )}
                </div>
             </div>

             {/* Coordination Feed */}
             <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-syne font-[800] text-white/60 text-[11px] uppercase tracking-[0.2em] mb-6">Coordination Feed</h3>
                  <div className="space-y-3">
                     {coordEvents.length > 0 ? coordEvents.map((event, idx) => {
                        const fromAgent = getAgentById(event.fromId);
                        const toAgent = getAgentById(event.toId);
                        return (
                           <div key={idx} className="p-4 rounded-xl border border-white/5 bg-surface/40 flex items-start gap-3 relative group hover:border-white/10 transition-all">
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                 <span className="text-xs">{fromAgent?.icon}</span>
                                 <div className="w-[1px] h-3 bg-white/10" />
                                 <span className="text-xs">{toAgent?.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] text-green font-[800] uppercase tracking-widest">{event.type}</span>
                                    <span className="text-[9px] text-white/20 font-[800] uppercase tracking-widest">{event.time}</span>
                                 </div>
                                 <p className="font-syne text-[13px] text-white font-[500] leading-tight line-clamp-2 uppercase tracking-tight">{event.desc}</p>
                              </div>
                           </div>
                        );
                     }) : (
                        <div className="py-12 text-center border border-dashed border-white/5 rounded-xl bg-surface/20">
                           <p className="text-[10px] text-white/10 font-[800] uppercase tracking-widest">No Coordination Events</p>
                        </div>
                     )}
                  </div>
                </div>

             </div>
          </div>

          {/* Live Activity Feed */}
          <div className="dash-anim opacity-0">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-syne font-[800] text-white/60 text-[11px] uppercase tracking-[0.2em]">Live Activity Feed</h3>
                <span className="font-syne text-[9px] text-white/20 uppercase tracking-widest font-[800]">Streaming Real-time Intelligence</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {liveActivity.length > 0 ? liveActivity.map((item, idx) => (
                   <div key={idx} className="p-6 rounded-[2rem] border border-white/5 bg-surface/30 flex flex-col gap-4 group hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                            <div>
                               <p className="font-syne text-[13px] font-[800] text-white uppercase tracking-tight leading-none mb-1">{item.agent}</p>
                               <p className="font-syne text-[9px] text-white/20 uppercase tracking-widest font-black">{item.dept}</p>
                            </div>
                         </div>
                         <span className="text-[9px] text-white/10 font-[800] mb-auto">{item.time}</span>
                      </div>
                      <div className="space-y-1">
                         <p className="font-syne text-[12px] text-white/60 uppercase tracking-tight leading-tight">{item.action}</p>
                         <p className="font-syne text-[10px] text-green/60 font-[800] uppercase tracking-widest leading-none">{item.detail}</p>
                      </div>
                   </div>
                )) : (
                   <div className="col-span-1 md:col-span-2 lg:col-span-4 py-16 text-center border border-dashed border-white/5 rounded-[2rem]">
                      <p className="text-[11px] text-white/10 font-[800] uppercase tracking-widest italic">Stream Offline — Synchronizing Intelligence Layer</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
