'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const depts: any[] = [];

export default function IntegrationsDashboardPage() {
  useEffect(() => {
    animate('.int-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar active="integrations" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Integrations</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-[800] uppercase tracking-widest">Active Connection</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl overflow-y-auto no-scrollbar">
          <div className="mb-12 int-anim opacity-0">
            <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">System <span className="text-green">Tools</span></h1>
            <p className="font-syne text-[11px] text-white/40 font-[800] uppercase tracking-widest">Automatic tool synchronization across all your departments.</p>
          </div>

          <div className="space-y-16">
             {depts.length > 0 ? depts.map((dept, idx) => (
                <div key={idx} className="int-anim opacity-0">
                   <div className="flex items-center justify-between mb-8 border-l-2 border-green/30 pl-6">
                      <h3 className="font-syne text-xl font-[800] text-white uppercase tracking-tight">
                         {dept.name}
                      </h3>
                      <span className="text-[9px] text-white/20 font-[800] uppercase tracking-widest hidden sm:block">Department Access Restricted</span>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {dept.tools.map((tool, tIdx) => {
                         const isConnected = dept.connected.includes(tool);
                         return (
                            <div 
                              key={tIdx} 
                              className={`p-6 rounded-[2rem] border transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                                 isConnected 
                                 ? 'bg-green/5 border-green/20 shadow-[0_8px_30px_rgba(0,255,135,0.05)]' 
                                 : 'bg-surface/30 border-white/5 hover:border-white/10 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                              }`}
                            >
                               {isConnected && (
                                 <div className="absolute top-0 right-0 w-24 h-24 bg-green/5 rotate-45 translate-x-12 -translate-y-12" />
                               )}
                               
                               <div className="flex justify-between items-start mb-8 relative z-10">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-[800] text-lg shadow-inner ${isConnected ? 'bg-bg text-green' : 'bg-surface text-white/20'}`}>
                                     {tool.charAt(0)}
                                  </div>
                                  {isConnected ? (
                                     <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                                        <span className="text-[9px] font-[800] text-green uppercase tracking-widest">Connected</span>
                                     </div>
                                  ) : (
                                     <span className="text-[9px] font-[800] text-white/20 uppercase tracking-widest">Disconnected</span>
                                  )}
                               </div>
                               
                               <div className="relative z-10 text-left">
                                  <h4 className={`font-syne font-[800] text-lg mb-1 tracking-tight uppercase ${isConnected ? 'text-white' : 'text-white/40'}`}>{tool}</h4>
                                  <p className="font-syne text-[9px] text-white/20 font-[800] uppercase tracking-widest mb-6">{isConnected ? 'Syncing Now' : 'Tap to connect'}</p>
                                  
                                  <button className={`w-full py-2.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest transition-all duration-300 ${
                                    isConnected 
                                    ? 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white' 
                                    : 'bg-green shadow-[0_4px_15px_rgba(0,255,135,0.2)] text-bg border border-green hover:scale-[1.02]'
                                  }`}>
                                     {isConnected ? 'Settings' : 'Connect Tool'}
                                  </button>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             )) : (
                <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-xl mx-auto mb-6 opacity-30">🔗</div>
                   <p className="font-syne text-[11px] text-white/20 font-[800] uppercase tracking-[0.2em]">Searching for connections... syncing protocols</p>
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
