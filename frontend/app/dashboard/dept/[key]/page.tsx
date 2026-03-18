'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { animate, stagger } from 'animejs';
import { getAgentsByDept, Agent } from '@/lib/agents';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function DeptWorkspacePage() {
  const params = useParams();
  const deptKey = params.key as string;
  
  const agents = useMemo(() => getAgentsByDept(deptKey?.toLowerCase() || ''), [deptKey]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  useEffect(() => {
    if (selectedAgent) {
      animate('.workspace-anim', {
        opacity: [0, 1],
        y: [20, 0],
        delay: stagger(100),
        duration: 800,
        ease: 'outExpo'
      });
    }
  }, [selectedAgent]);

  if (!selectedAgent && agents.length === 0) {
    return (
      <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
        <DashboardSidebar />
        <div className="p-20 text-white/20 font-dm-mono uppercase tracking-widest font-black">Department protocol not found...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Workspace Header - Agent Hero Display */}
        <header className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 workspace-anim shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-green/10 border border-green/20 flex items-center justify-center text-4xl shadow-[0_8px_30px_rgba(0,255,135,0.1)] relative group">
              <span className="group-hover:scale-110 transition-transform duration-500">{selectedAgent?.icon}</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green border-4 border-bg" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-syne text-3xl font-[800] text-white uppercase tracking-tight">{selectedAgent?.name}</h1>
                <span className="font-dm-mono text-[9px] text-green border border-green/20 bg-green/10 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Autonomous</span>
              </div>
               <p className="font-dm-mono text-[11px] text-white/40 font-[900] uppercase tracking-[0.2em] mb-2">{selectedAgent?.role}</p>
               <div className="flex items-center gap-4">
                 <span className="font-dm-mono text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">● Status: Optimal</span>
                 <span className="font-dm-mono text-[9px] text-white/10 font-bold uppercase tracking-widest italic">"Synchronizing ecosystem benchmarks..."</span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="btn-secondary text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all outline-none">History</button>
             <button className="btn-primary text-[10px] font-black px-8 py-2.5 rounded-xl uppercase tracking-widest shadow-[0_4px_20px_rgba(0,255,135,0.2)] active:scale-95 transition-all">New Brief +</button>
          </div>
        </header>

        {/* Agent Roster Tab Bar */}
        <div className="px-8 bg-surface/30 border-b border-white/5 flex gap-1 overflow-x-auto no-scrollbar pt-4 shrink-0">
          {agents.map(agent => (
            <button 
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`flex flex-col items-center gap-2 px-6 py-3 rounded-t-2xl border-x border-t transition-all duration-300 min-w-[100px] outline-none ${
                selectedAgent?.id === agent.id 
                ? 'bg-bg border-white/5 text-white shadow-[0_-10px_20px_rgba(0,0,0,0.2)]' 
                : 'bg-transparent border-transparent text-white/40 hover:text-white'
              }`}
            >
              <span className="text-xl">{agent.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{agent.name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 flex overflow-hidden">
           {/* Message Thread */}
           <div className="flex-1 flex flex-col border-r border-white/5 overflow-hidden">
              <div key={selectedAgent?.id} className="flex-1 p-8 overflow-y-auto space-y-10 messenger-thread no-scrollbar">
                 {/* Incoming Coordination */}
                 {/* Coordination status will appear here after deployment */}
                 <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01] workspace-anim">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-xl mx-auto mb-6 opacity-20">💬</div>
                    <p className="font-dm-mono text-[11px] text-white/10 font-black uppercase tracking-[0.3em]">Initialize mission parameters to begin coordination</p>
                 </div>

                 {/* Coordination Status Display */}
                 <div className="border-y border-white/5 py-4 flex items-center justify-center gap-4 workspace-anim opacity-60">
                    <span className="font-dm-mono text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">{selectedAgent?.name}</span>
                    <span className="text-white/20">→</span>
                    <span className="font-dm-mono text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">🔄 ECOSYSTEM SYNC</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                    <span className="font-dm-mono text-[9px] text-green font-black uppercase tracking-widest">Protocol Executing</span>
                 </div>
              </div>

              {/* Input Area */}
              <div className="p-8 border-t border-white/5 bg-surface/20 shrink-0">
                 <div className="relative max-w-4xl mx-auto">
                    <div className="absolute -top-12 left-0 flex gap-2 overflow-hidden pointer-events-none opacity-60">
                      {selectedAgent?.prompts.slice(0, 3).map(p => (
                        <span key={p} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-dm-mono font-black text-white/60 uppercase tracking-tight whitespace-nowrap">{p}</span>
                      ))}
                    </div>
                    <div className="relative">
                      <textarea 
                        placeholder={`Command ${selectedAgent?.name}...`}
                        className="w-full bg-bg/50 border border-white/10 rounded-[2rem] p-6 pr-16 font-dm-mono text-[14px] text-white focus:outline-none focus:border-green/30 resize-none h-40 shadow-inner transition-all outline-none"
                      />
                      <button className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-green text-bg border border-green flex items-center justify-center text-xl font-bold shadow-[0_4px_15px_rgba(0,255,135,0.3)] hover:scale-105 active:scale-95 transition-all">
                         ↑
                      </button>
                    </div>
                 </div>
                 <p className="mt-4 text-center text-[9px] text-white/10 font-black uppercase tracking-[0.3em]">Foundational Intelligence Layer Active</p>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}
