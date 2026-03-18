'use client';

import { useState, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const memberStats = [
  { label: 'DEPT TASKS', val: '0', trend: '—', desc: 'Synchronizing' },
  { label: 'PENDING APPROVALS', val: '0', trend: 'STABLE', desc: 'No signals' },
  { label: 'MEMBER RANK', val: '—', trend: 'VERIFIED', desc: '—' },
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
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/20 font-black uppercase tracking-widest uppercase">
                 Detecting Rank...
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
                <div className="member-anim opacity-0 p-4 rounded-xl border border-dashed border-white/5 bg-white/[0.01] flex items-center justify-center">
                   <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.2em]">
                      No active coordination signals detected
                   </p>
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
                    <div className="space-y-4">
                       <div className="py-12 text-center border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                          <p className="font-dm-mono text-[10px] text-white/10 font-black uppercase tracking-[0.2em]">Department log is empty</p>
                       </div>
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
