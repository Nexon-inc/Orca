'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { animate, stagger } from 'animejs';

export default function Day1BriefsPage() {
  const [briefs, setBriefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const router = useRouter();

  // Load pending briefs
  useEffect(() => {
    fetch('/api/briefs')
      .then(res => res.json())
      .then(data => {
        setBriefs(data.briefs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && briefs.length > 0) {
      animate('.brief-card', {
        opacity: [0, 1],
        y: [20, 0],
        delay: stagger(100),
        duration: 800,
        ease: 'outExpo'
      });
    }
  }, [loading, briefs.length]);

  const handleSend = async (id: string, text: string) => {
    setActioningId(id);
    try {
      const res = await fetch(`/api/briefs/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief_text: text }),
      });
      if (res.ok) {
        animateOutAndRemove(id);
      } else {
        alert('Failed to send brief');
        setActioningId(null);
      }
    } catch {
      alert('Network error');
      setActioningId(null);
    }
  };

  const handleSkip = async (id: string) => {
    setActioningId(id);
    try {
      const res = await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      });
      if (res.ok) {
        animateOutAndRemove(id);
      } else {
        alert('Failed to skip brief');
        setActioningId(null);
      }
    } catch {
      alert('Network error');
      setActioningId(null);
    }
  };

  const animateOutAndRemove = (id: string) => {
    animate(`.card-${id}`, {
      opacity: 0,
      scale: 0.95,
      y: 10,
      duration: 300,
      ease: 'inQuad',
      onComplete: () => {
        setBriefs(prev => prev.filter(b => b.id !== id));
        setActioningId(null);
        // If this was the last one, go back to dashboard
        if (briefs.length === 1) {
          router.push('/dashboard');
        }
      }
    });
  };

  const updateBriefText = (id: string, newText: string) => {
    setBriefs(prev => prev.map(b => b.id === id ? { ...b, brief_text: newText } : b));
  };

  return (
    <div className="flex h-screen bg-bg font-syne overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar pb-20 p-8 lg:p-12 relative">
        <header className="mb-12 max-w-4xl mx-auto w-full text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green/10 border border-green/20 text-green text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse"></span>
            Activation Protocol Ready
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">Day 1 Briefs</h1>
          <p className="text-white/40 text-[13px] max-w-xl mx-auto leading-relaxed">
            Your template generated these initial tasks to jumpstart your agents. Review, tweak, and send them to put your company into motion.
          </p>
        </header>

        <div className="max-w-4xl mx-auto w-full space-y-6">
          {loading ? (
            <div className="space-y-6 animate-pulse">
               {[1,2,3].map(i => (
                 <div key={i} className="bg-surface/50 border border-white/5 rounded-3xl p-8 h-48" />
               ))}
            </div>
          ) : briefs.length > 0 ? (
            briefs.map((brief) => {
              const agentName = brief.agents?.name || 'Agent';
              const agentIcon = brief.agents?.icon || '⬡';
              const isActioning = actioningId === brief.id;

              return (
                <div key={brief.id} className={`card-${brief.id} brief-card opacity-0 bg-surface/50 border border-white/5 hover:border-green/20 rounded-[2rem] p-8 transition-all relative overflow-hidden group`}>
                   {/* Background glow on hover */}
                   <div className="absolute inset-0 bg-green/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                   
                   <div className="relative z-10 flex flex-col md:flex-row gap-8">
                      {/* Left: Agent Info */}
                      <div className="w-full md:w-48 flex-shrink-0 flex items-center md:items-start md:flex-col gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                          {agentIcon}
                        </div>
                        <div>
                          <h4 className="text-white font-[800] text-[14px] uppercase tracking-tight mb-1">{agentName}</h4>
                          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">{brief.agents?.department_key || 'Department'}</p>
                        </div>
                      </div>

                      {/* Right: Brief Editor & Actions */}
                      <div className="flex-1 min-w-0">
                         <div className="mb-4">
                           <label className="text-green text-[9px] font-black uppercase tracking-[0.2em] mb-2 block">Action Required</label>
                           <textarea 
                             className="w-full bg-bg border border-white/10 rounded-xl p-4 text-white text-[13px] leading-relaxed resize-none focus:border-green/50 outline-none transition-all placeholder-white/20 font-dm-mono"
                             rows={3}
                             value={brief.brief_text}
                             onChange={(e) => updateBriefText(brief.id, e.target.value)}
                             disabled={isActioning}
                           />
                         </div>
                         
                         <div className="flex gap-4 mb-6">
                            <span className="text-xl">💡</span>
                            <p className="text-white/50 text-[11px] font-dm-mono leading-relaxed italic pr-4">
                              "{brief.rationale}"
                            </p>
                         </div>

                         <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-white/5">
                            <button 
                              onClick={() => handleSend(brief.id, brief.brief_text)}
                              disabled={isActioning}
                              className="w-full sm:w-auto px-8 py-3 rounded-xl btn-primary text-[10px] font-black uppercase tracking-widest flex-1 justify-center disabled:opacity-50"
                            >
                              {isActioning ? 'Transmitting...' : 'Send Brief →'}
                            </button>
                            <button 
                              onClick={() => handleSkip(brief.id)}
                              disabled={isActioning}
                              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                              Skip
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <div className="w-16 h-16 rounded-full bg-green/10 border border-green/20 flex items-center justify-center text-xl text-green mx-auto mb-6">✓</div>
              <h3 className="font-syne text-[18px] text-white font-[800] uppercase tracking-tight mb-2">Initialize Sequence Complete</h3>
              <p className="font-syne text-[11px] text-white/40 font-black uppercase tracking-[0.2em] mb-8">All agents have been activated.</p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Return to Command Center
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
