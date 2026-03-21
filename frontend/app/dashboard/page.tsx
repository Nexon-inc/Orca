'use client';

import { useState, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useStatsRefresh } from '@/hooks/useStatsRefresh';
import { useRealtimeCoordination } from '@/hooks/useRealtimeCoordination';
import { useRealtimeActivity } from '@/hooks/useRealtimeActivity';

export default function DashboardPage() {
  const [org, setOrg] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [coordEvents, setCoordEvents] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [pendingBriefsCount, setPendingBriefsCount] = useState(0);
  
  // Custom hooks for real-time updates
  const { stats, loading: statsLoading } = useStatsRefresh(org?.id);
  
  useRealtimeCoordination(org?.id, (newEvent) => {
    // Ideally fetch the full event with agent names, but for now just prepend
    setCoordEvents(prev => [newEvent, ...prev].slice(0, 10));
  });

  useRealtimeActivity(org?.id, (newMsg) => {
    setLiveActivity(prev => [newMsg, ...prev].slice(0, 20));
  });

  useEffect(() => {
    // 1. Fetch Org
    fetch('/api/org')
      .then(res => res.json())
      .then(data => setOrg(data.org || data));

    // 2. Initial fetch for departments
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data.departments || []));

    // 3. Initial fetch for coordination
    fetch('/api/org/coordination')
      .then(res => res.json())
      .then(data => setCoordEvents(data.feed || []));

    // 4. Initial fetch for activity
    fetch('/api/org/activity')
      .then(res => res.json())
      .then(data => setLiveActivity(data.activity || []));

    // 5. Fetch Pending Briefs for Banner
    fetch('/api/briefs')
      .then(res => res.json())
      .then(data => {
         if (data.briefs && data.briefs.length > 0) {
           setPendingBriefsCount(data.briefs.length);
         }
      });

    // Animations
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
                <span className="text-[10px] text-green font-[800] uppercase tracking-widest">{stats?.active_agents || 0} AGENTS ONLINE</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/40 text-[11px] font-[800] uppercase tracking-widest leading-none">
               System Health: <span className="text-green/40">Synchronized</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-8 flex flex-col gap-10 overflow-y-auto no-scrollbar">

          {pendingBriefsCount > 0 && (
            <div className="p-6 md:p-8 rounded-[2rem] bg-surface/50 border border-green/30 relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-6 dash-anim opacity-0">
               <div className="absolute inset-0 bg-green/5 opacity-50 pointer-events-none" />
               <div className="relative z-10 flex items-center gap-6">
                 <div className="w-16 h-16 shrink-0 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,255,135,0.15)]">🏪</div>
                 <div>
                   <h3 className="text-white font-syne font-[800] text-[16px] uppercase tracking-tight mb-2">Initialize Sequence Ready</h3>
                   <p className="text-white/60 font-dm-mono text-[11px] leading-relaxed max-w-lg">
                     You have <strong className="text-green">{pendingBriefsCount} Day 1 Briefs</strong> generated from your template. Review and send them to activate your autonomous agents.
                   </p>
                 </div>
               </div>
               <button
                 onClick={() => window.location.href = '/dashboard/orcahub/briefs'}
                 className="relative z-10 whitespace-nowrap px-8 py-4 rounded-xl btn-primary text-[10px] font-black uppercase tracking-widest w-full md:w-auto text-center"
               >
                 View & Send Briefs →
               </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 dash-anim opacity-0">
            {[
              { label: 'TASKS EXECUTED', val: stats?.tasks_today || '0', trend: 'LIVE', desc: 'Today' },
              { label: 'COORD. EVENTS', val: stats?.coordination_events || '0', trend: 'LIVE', desc: 'Last 24h' },
              { label: 'AVG EFFICIENCY', val: '98%', trend: '↑', desc: 'Real-time' },
              { label: 'PIPELINE LEADS', val: stats?.pipeline_leads || '0', trend: 'LIVE', desc: stats?.coordination_label || 'Today' },
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
                            <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{dept.icon}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${!dept.agents_paused ? 'bg-green animate-pulse' : 'bg-white/10'}`} />
                         </div>
                         <h4 className="font-syne text-[13px] font-[800] text-white group-hover:text-green transition-colors uppercase tracking-tight mb-1 relative z-10">{dept.name}</h4>
                         <div className="flex items-center gap-2 relative z-10">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-green/40 transition-all duration-1000" style={{ width: `${dept.agents_paused ? 0 : 65}%` }} />
                            </div>
                            <span className="text-[9px] font-syne text-white/40 font-[800] group-hover:text-white transition-colors uppercase tracking-tight">{dept.agents_paused ? 'OFF' : 'LIVE'}</span>
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
                        return (
                           <div key={idx} className="p-4 rounded-xl border border-white/5 bg-surface/40 flex items-start gap-3 relative group hover:border-white/10 transition-all">
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                 <span className="text-xs">{event.from_agent?.icon || '⬡'}</span>
                                 <div className="w-[1px] h-3 bg-white/10" />
                                 <span className="text-xs">{event.to_agent?.icon || '⬡'}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] text-green font-[800] uppercase tracking-widest">{event.type}</span>
                                    <span className="text-[9px] text-white/20 font-[800] uppercase tracking-widest">
                                      {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 </div>
                                 <p className="font-syne text-[13px] text-white font-[500] leading-tight line-clamp-2 uppercase tracking-tight">{event.description}</p>
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
                            <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{item.agent_icon}</span>
                            <div>
                               <p className="font-syne text-[13px] font-[800] text-white uppercase tracking-tight leading-none mb-1">{item.agent_name}</p>
                               <p className="font-syne text-[9px] text-white/20 uppercase tracking-widest font-black">{item.department}</p>
                            </div>
                         </div>
                         <span className="text-[9px] text-white/10 font-[800] mb-auto">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <div className="space-y-1">
                         <p className="font-syne text-[12px] text-white/60 uppercase tracking-tight leading-tight">{item.action}</p>
                         <p className="font-syne text-[10px] text-green/60 font-[800] uppercase tracking-widest leading-none">Status: {item.status}</p>
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
