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
      <main className="flex-1 flex flex-col min-w-0 font-dm-mono">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="font-syne font-bold text-white text-[16px]">Overview</h2>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/5 border border-green/10">
                <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-[10px] text-green uppercase tracking-[0.2em]">{stats?.active_agents || 0} Agents Online</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-[0.2em] leading-none">
               System Health: <span className="text-green/60">Synchronized</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-8 flex flex-col gap-10 overflow-y-auto no-scrollbar">

          {/* Pending Briefs Banner */}
          {pendingBriefsCount > 0 && (
            <div className="p-6 md:p-8 rounded-2xl bg-surface/50 border border-green/30 relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-6 dash-anim opacity-0 backdrop-blur-sm">
               <div className="absolute inset-0 bg-green/5 opacity-50 pointer-events-none" />
               <div className="relative z-10 flex items-center gap-6">
                 <div className="w-14 h-14 shrink-0 rounded-xl bg-green/10 border border-green/20 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,255,135,0.15)]">🏪</div>
                 <div>
                   <h3 className="font-syne text-[15px] font-bold text-white mb-1">Initialize Sequence Ready</h3>
                   <p className="font-dm-mono text-[13px] text-text-muted leading-relaxed max-w-lg">
                     You have <strong className="text-green">{pendingBriefsCount} Day 1 Briefs</strong> generated from your template. Review and send them to activate your autonomous agents.
                   </p>
                 </div>
               </div>
               <button
                 onClick={() => window.location.href = '/dashboard/orcahub/briefs'}
                 className="relative z-10 whitespace-nowrap px-6 py-3 rounded-xl btn-primary text-[12px] font-bold uppercase tracking-widest w-full md:w-auto text-center transition-all hover:scale-[1.02]"
               >
                 View & Send Briefs →
               </button>
             </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 dash-anim opacity-0">
            {[
              { label: 'Tasks Executed', val: stats?.tasks_today || '0', trend: 'Live', desc: 'Today' },
              { label: 'Coord Events', val: stats?.coordination_events || '0', trend: 'Live', desc: 'Last 24h' },
              { label: 'Avg Efficiency', val: '98%', trend: '↑', desc: 'Real-time' },
              { label: 'Pipeline Leads', val: stats?.pipeline_leads || '0', trend: 'Live', desc: stats?.coordination_label || 'Today' },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface/50 backdrop-blur-sm border border-white/5 flex flex-col gap-2 group hover:border-green/20 transition-all cursor-default">
                <span className="font-dm-mono text-[10px] text-white/40 uppercase tracking-[0.2em] group-hover:text-green transition-colors">{stat.label}</span>
                <div className="flex items-baseline gap-2">
                   <span className="font-syne text-3xl font-bold text-white group-hover:text-green transition-colors tracking-tight">{stat.val}</span>
                   <span className="font-dm-mono text-[10px] text-green uppercase tracking-widest">{stat.trend}</span>
                </div>
                <span className="font-dm-mono text-[10px] text-white/20 uppercase tracking-[0.2em]">{stat.desc}</span>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 dash-anim opacity-0">
             
             {/* Department Grid */}
             <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-syne font-bold text-white text-[16px]">Department Status</h3>
                   <span className="font-dm-mono text-[10px] text-green uppercase tracking-[0.2em] px-3 py-1 border border-green/20 rounded-full bg-green/5">3x3 Cluster Live</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {departments.length > 0 ? departments.map(dept => (
                      <div key={dept.id} className="p-5 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm group hover:border-green/20 transition-all cursor-pointer relative overflow-hidden">
                         <div className="mb-4 flex items-center justify-between relative z-10">
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100">{dept.icon}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${!dept.agents_paused ? 'bg-green animate-pulse shadow-[0_0_10px_rgba(0,255,135,0.5)]' : 'bg-white/10'}`} />
                         </div>
                         <h4 className="font-syne text-[14px] font-bold text-white group-hover:text-green transition-colors mb-2 relative z-10">{dept.name}</h4>
                         <div className="flex items-center gap-3 relative z-10">
                            <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-green/40 transition-all duration-1000" style={{ width: `${dept.agents_paused ? 0 : 65}%` }} />
                            </div>
                            <span className="font-dm-mono text-[10px] text-white/40 group-hover:text-green transition-colors uppercase tracking-[0.2em]">{dept.agents_paused ? 'OFF' : 'LIVE'}</span>
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-br from-green/0 to-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                   )) : (
                      <div className="col-span-2 md:col-span-3 py-16 text-center border border-dashed border-white/5 rounded-2xl bg-surface/20">
                         <p className="font-dm-mono text-[11px] text-white/20 uppercase tracking-[0.3em]">Waiting for department protocols...</p>
                      </div>
                   )}
                </div>
             </div>

             {/* Coordination Feed */}
             <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <h3 className="font-syne font-bold text-white text-[16px] mb-4">Coordination Feed</h3>
                  <div className="space-y-3">
                     {coordEvents.length > 0 ? coordEvents.map((event, idx) => {
                        return (
                           <div key={idx} className="p-4 rounded-xl border border-white/5 bg-surface/50 backdrop-blur-sm flex items-start gap-4 relative group hover:border-white/10 transition-all">
                              <div className="flex flex-col items-center gap-1.5 shrink-0 mt-0.5">
                                 <span className="text-sm opacity-60">{event.from_agent?.icon || '⬡'}</span>
                                 <div className="w-px h-3 bg-white/10" />
                                 <span className="text-sm opacity-60">{event.to_agent?.icon || '⬡'}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-2">
                                    <span className="font-dm-mono text-[10px] text-green uppercase tracking-[0.2em]">{event.type}</span>
                                    <span className="font-dm-mono text-[10px] text-white/30 tracking-widest">
                                      {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 </div>
                                 <p className="font-dm-mono text-[12px] text-white/80 leading-relaxed line-clamp-2">{event.description}</p>
                              </div>
                           </div>
                        );
                     }) : (
                        <div className="py-16 text-center border border-dashed border-white/5 rounded-xl bg-surface/20">
                           <p className="font-dm-mono text-[11px] text-white/20 uppercase tracking-[0.3em]">No Coordination Events</p>
                        </div>
                     )}
                  </div>
                </div>
             </div>

          </div>

          {/* Live Activity Feed */}
          <div className="dash-anim opacity-0">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-syne font-bold text-white text-[16px]">Live Activity Feed</h3>
                <span className="font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Streaming Real-time Intelligence</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {liveActivity.length > 0 ? liveActivity.map((item, idx) => (
                   <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm flex flex-col gap-4 group hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-xl grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100">{item.agent_icon}</span>
                            <div>
                               <p className="font-syne text-[14px] font-bold text-white mb-0.5">{item.agent_name}</p>
                               <p className="font-dm-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">{item.department}</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-white/5">
                         <p className="font-dm-mono text-[12px] text-white/70 leading-snug line-clamp-2">{item.action}</p>
                         <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green opacity-70" />
                           <p className="font-dm-mono text-[10px] text-green/70 uppercase tracking-[0.2em]">Status: {item.status}</p>
                         </div>
                      </div>
                   </div>
                )) : (
                   <div className="col-span-1 md:col-span-2 lg:col-span-4 py-16 text-center border border-dashed border-white/5 rounded-2xl bg-surface/20">
                      <p className="font-dm-mono text-[11px] text-white/20 uppercase tracking-[0.3em] italic">Stream Offline — Synchronizing Intelligence Layer</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
