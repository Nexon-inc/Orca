'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const members: any[] = [];

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
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar active="team" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Team</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-[800] uppercase tracking-widest">{members.length} PEOPLE</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl overflow-y-auto no-scrollbar">
          <div className="mb-12 team-anim opacity-0">
            <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">Team <span className="text-green">Management</span></h1>
            <p className="font-syne text-[11px] text-white/40 uppercase tracking-widest font-[800]">Control who has access to your company dashboard.</p>
          </div>

          <div className="grid gap-4 team-anim opacity-0">
             {members.length > 0 ? members.map(member => (
                <div key={member.id} className="p-6 rounded-[2rem] border border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between group hover:border-green/20 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center font-[800] text-green shadow-[0_4px_20px_rgba(0,255,135,0.1)] uppercase">
                         {member.avatar}
                      </div>
                       <div className="text-left">
                          <div className="flex items-center gap-3 mb-1">
                             <h3 className="font-syne text-lg font-[800] text-white group-hover:text-green transition-colors uppercase tracking-tight">{member.name}</h3>
                             <div className="flex gap-1">
                                {member.badges.map(b => (
                                  <span key={b} className="text-[8px] font-[800] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 tracking-widest leading-none">
                                    {b}
                                  </span>
                                ))}
                             </div>
                          </div>
                          <p className="font-syne text-[12px] text-white/40 font-[800] uppercase tracking-widest">{member.role}</p>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-8">
                       <div className="text-right flex flex-col items-end gap-1 hidden sm:flex">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                             <span className="font-syne text-[10px] text-green font-[800] uppercase tracking-widest">{member.status}</span>
                          </div>
                          <span className="text-[9px] text-white/20 uppercase font-[800] tracking-widest">Full Access</span>
                       </div>
                       <button className="px-4 py-2 rounded-xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100">
                          <span className="text-[9px] text-red-500 font-[800] uppercase tracking-widest font-black">Remove</span>
                       </button>
                   </div>
                </div>
             )) : (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                   <p className="font-syne text-[11px] text-white/20 font-[800] uppercase tracking-widest">No team members added yet.</p>
                </div>
             )}
          </div>

          <div className="mt-12 p-12 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center max-w-2xl mx-auto team-anim opacity-0">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl mb-6 opacity-40">👥</div>
             <p className="font-syne text-[13px] text-white/40 leading-relaxed uppercase tracking-tighter">
                Manage your team and their access levels here.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
