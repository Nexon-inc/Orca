'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const members = [
  { id: 1, name: 'John Kyalo', role: 'CEO & Founder', status: 'ACTIVE', avatar: 'JK', badges: ['FOUNDER', 'OWNER'] },
  { id: 2, name: 'Sarah Chen', role: 'Chief of Operations', status: 'ACTIVE', avatar: 'SC', badges: ['HEAD'] },
  { id: 3, name: 'Alex Rivera', role: 'CTO', status: 'ACTIVE', avatar: 'AR', badges: ['FOUNDER'] },
];

export default function TeamsPage() {
  useEffect(() => {
    animate('.team-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Governance</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-[900] uppercase tracking-widest">{members.length} AUTHORITIES</span>
            </div>
          </div>
          <button className="bg-green text-bg px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Invite Authority +</button>
        </header>

        <div className="p-8 max-w-6xl overflow-y-auto no-scrollbar">
          <div className="mb-12 team-anim opacity-0">
            <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">Ecosystem <span className="text-green">Architecture</span></h1>
            <p className="font-dm-mono text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Manage foundational access and high-governance roles.</p>
          </div>

          <div className="grid gap-4 team-anim opacity-0">
             {members.map(member => (
                <div key={member.id} className="p-6 rounded-[2rem] border border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between group hover:border-green/20 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center font-bold text-green shadow-[0_4px_20px_rgba(0,255,135,0.1)] uppercase">
                         {member.avatar}
                      </div>
                       <div className="text-left">
                          <div className="flex items-center gap-3 mb-1">
                             <h3 className="font-syne text-lg font-[800] text-white group-hover:text-green transition-colors uppercase tracking-tight">{member.name}</h3>
                             <div className="flex gap-1">
                                {member.badges.map(b => (
                                  <span key={b} className="text-[8px] font-[900] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 tracking-widest leading-none">
                                    {b}
                                  </span>
                                ))}
                             </div>
                          </div>
                          <p className="font-dm-mono text-[12px] text-white/40 font-black uppercase tracking-widest">{member.role}</p>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-8">
                       <div className="text-right flex flex-col items-end gap-1 hidden sm:flex">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                             <span className="font-dm-mono text-[10px] text-green font-black uppercase tracking-widest">{member.status}</span>
                          </div>
                          <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">Full Access Protocol</span>
                       </div>
                      <div className="h-8 w-[1px] bg-white/5 mx-2 hidden sm:block" />
                      <button className="px-4 py-2 rounded-xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100">
                         <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">Restrict</span>
                      </button>
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-12 p-12 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center max-w-2xl mx-auto team-anim opacity-0">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl mb-6 opacity-40">👥</div>
             <p className="font-dm-mono text-[13px] text-white/40 leading-relaxed uppercase tracking-tighter italic">
                "Human governance is required to maintain the ethics of autonomous agency. Delegate with precision."
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
