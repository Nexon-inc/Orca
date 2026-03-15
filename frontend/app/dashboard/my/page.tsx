'use client';

import { useState, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const memberStats = [
  { label: 'DEPT TASKS', val: '24', trend: '↑ 4%', desc: 'Marketing' },
  { label: 'PENDING APPROVALS', val: '3', trend: 'CRITICAL', desc: 'Aria → Rex' },
  { label: 'MEMBER RANK', val: 'Head', trend: 'VERIFIED', desc: 'Nexonic Industries' },
];

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    animate('.member-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, [activeTab]);

  return (
    <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 font-dm-mono">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0 font-syne">
          <div className="flex items-center gap-4">
             <h2 className="font-black text-white text-[18px] uppercase tracking-tight">Member Dashboard</h2>
             <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-black uppercase tracking-widest">
                Marketing Head
             </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/40 text-[11px] font-black uppercase tracking-widest">
               Sync: <span className="text-green uppercase">Live</span>
            </div>
          </div>
        </header>

        {/* Tab Nav */}
        <div className="px-8 pt-6 border-b border-white/5 font-syne">
           <div className="flex gap-10">
              {['Overview', 'Agents', 'Team Chat'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`pb-4 text-[11px] font-[800] uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                 >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green shadow-[0_0_10px_rgba(0,255,135,0.5)]" />}
                 </button>
              ))}
           </div>
        </div>

        {/* Dash Content */}
        <div className="p-8 flex flex-col gap-10 overflow-y-auto no-scrollbar">
           {activeTab === 'Overview' && (
              <>
                {/* Pending Banner */}
                <div className="member-anim opacity-0 p-4 rounded-xl bg-green/5 border border-dashed border-green/20 flex items-center justify-between group cursor-pointer hover:bg-green/10 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                      <p className="text-[11px] text-white/60 font-black uppercase tracking-widest">
                         [SIGNAL] Your Aria → Rex request is waiting on approval from Amara M.
                      </p>
                   </div>
                   <span className="text-[10px] text-green font-black uppercase tracking-widest group-hover:underline">View in Chat →</span>
                </div>

                {/* Scoped Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 member-anim opacity-0">
                   {memberStats.map(stat => (
                      <div key={stat.label} className="p-6 rounded-2xl bg-surface/50 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-all">
                         <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">{stat.label}</span>
                         <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-syne font-black text-white">{stat.val}</span>
                            <span className="text-[10px] text-green font-bold">{stat.trend}</span>
                         </div>
                         <span className="text-[9px] text-white/10 font-bold uppercase tracking-widest">{stat.desc}</span>
                      </div>
                   ))}
                </div>

                {/* Department Log */}
                <div className="member-anim opacity-0 space-y-6">
                   <h3 className="font-syne font-[800] text-white/20 text-[11px] uppercase tracking-widest">Department Activity Log</h3>
                   <div className="space-y-3">
                      {[
                        { icon: '📣', agent: 'Aria', action: 'Social Brief Created', time: '12m ago' },
                        { icon: '💰', agent: 'Rex', action: 'Lead Handoff Received', time: '1h ago' },
                        { icon: '📣', agent: 'NV', action: 'Creative Render Complete', time: '3h ago' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border border-white/5 bg-surface/30 flex items-center justify-between group hover:border-white/10 transition-all">
                           <div className="flex items-center gap-4">
                              <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                              <div>
                                 <p className="font-syne text-[13px] font-black text-white uppercase tracking-tight leading-none mb-1">{item.agent}</p>
                                 <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{item.action}</p>
                              </div>
                           </div>
                           <span className="text-[9px] text-white/10 font-black uppercase">{item.time}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </>
           )}

           {activeTab === 'Agents' && (
              <div className="member-anim opacity-0 p-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                 <h3 className="font-syne text-xl font-black text-white/20 uppercase tracking-widest">Department Roster Synchronizing...</h3>
              </div>
           )}

           {activeTab === 'Team Chat' && (
              <div className="member-anim opacity-0 p-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                 <h3 className="font-syne text-xl font-black text-white/20 uppercase tracking-widest">Encrypted Link Initializing...</h3>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}
