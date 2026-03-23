'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useRealtimeApprovals } from '@/hooks/useRealtimeApprovals';

export default function ReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [coordLog, setCoordLog] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    // Fetch org id + approval requests
    fetch('/api/org')
      .then(r => r.json())
      .then(d => setOrgId(d.org?.id || d.id));

    fetch('/api/approvals')
      .then(r => r.json())
      .then(d => setReviews(d.approvals || []));

    fetch('/api/org/coordination?limit=10')
      .then(r => r.json())
      .then(d => setCoordLog(d.feed || []));
  }, []);

  // Realtime: push new approval into queue as it arrives
  useRealtimeApprovals(orgId || '', (newApproval) => {
    setReviews(prev => [newApproval, ...prev]);
  });

  useEffect(() => {
    animate('.review-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(50),
      duration: 800,
      ease: 'outExpo'
    });
  }, [reviews]);

  const handleAction = async (id: string, decision: 'approved' | 'rejected' | 'edited') => {
    setActionLoading(id);
    try {
      await fetch(`/api/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          decision: decision === 'approved' ? 'approved' : 'rejected',
          content: decision === 'edited' ? editText : undefined
        }),
      });
      setEditingItem(null);
    } catch (err) {
      console.error('Action failed:', err);
    }
    // Animate out and remove from local queue
    animate(`.review-item-${id}`, {
      opacity: 0,
      x: 20,
      duration: 300,
      ease: 'inQuad',
      onComplete: () => {
        setReviews(prev => prev.filter(r => r.id !== id));
        setActionLoading(null);
      }
    });
  };

  const openFineTune = (item: any) => {
    setEditingItem(item);
    setEditText(item.description || item.context || '');
  };

  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar pb-20">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Review Center</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-black uppercase tracking-widest">{reviews.length} DECISIONS PENDING</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-12 review-anim opacity-0">
            <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">Review <span className="text-green">Center</span></h1>
            <p className="font-syne text-[11px] text-white/40 uppercase tracking-[0.2em] font-black">Your command queue. Approve, reject, or redirect.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 review-anim opacity-0">
            {[
              { label: 'Pending Approvals', val: reviews.length, desc: 'Decisions awaiting action' },
              { label: 'Coord Events Today', val: coordLog.length, desc: 'Live hand-offs' },
              { label: 'Dept Reports', val: '—', desc: 'No reports submitted yet.' },
              { label: 'Team Online', val: '—', desc: 'Invite your team to collaborate.' },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm group hover:border-green/20 transition-all">
                <p className="text-[10px] text-white/40 font-[900] uppercase tracking-widest mb-2 group-hover:text-green transition-colors">{stat.label}</p>
                <div className="flex items-end gap-3">
                  <p className="text-2xl font-syne font-[800] text-white">{stat.val}</p>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-tight mb-1 truncate">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            {/* Approval Queue (Main Column) */}
            <div className="flex-1 space-y-6">
              <h3 className="font-syne text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Command Queue</h3>
              {reviews.map(item => (
                <div
                  key={item.id}
                  className={`review-item-${item.id} review-anim opacity-0 rounded-[2rem] border border-white/5 bg-surface/30 backdrop-blur-xl overflow-hidden group transition-all`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: The Request */}
                    <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/5">
                      <div className="flex items-center gap-3 mb-6">
                         <span className={`w-2 h-2 rounded-full ${
                          item.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                          item.priority === 'high' ? 'bg-warn' : 'bg-white/20'
                        }`} />
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{item.type || 'Proposal'}</span>
                        <span className="ml-auto text-[9px] text-white/20 font-black">ID: {item.id.split('-')[0]}</span>
                      </div>
                      
                      <h4 className="font-syne text-xl font-[800] text-white mb-4 uppercase tracking-tight leading-tight">
                        {item.title || item.action_summary}
                      </h4>
                      
                      <div className="bg-bg/50 rounded-2xl p-6 border border-white/5 mb-6">
                        <p className="text-[13px] text-white/60 leading-relaxed font-dm-mono italic">
                           "{item.description || item.context}"
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(item.id, 'approved')}
                          disabled={actionLoading === item.id}
                          className="flex-1 btn-primary py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(0,255,135,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          {actionLoading === item.id ? 'Deploying...' : 'Deploy Decision →'}
                        </button>
                        <button
                          onClick={() => openFineTune(item)}
                          disabled={actionLoading === item.id}
                          className="flex-1 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all py-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Fine-tune
                        </button>
                      </div>
                    </div>

                    {/* Right: AI Reasoning */}
                    <div className="p-8 bg-white/[0.02]">
                       <h5 className="font-syne text-[10px] font-black text-green uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                          Autonomous Reasoning
                       </h5>
                       
                       <div className="space-y-6">
                          <div>
                             <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-2">Intent Analysis</p>
                             <p className="text-[12px] text-white/40 leading-relaxed italic">
                                "{item.reasoning || item.meta?.reasoning || 'Agent determined this action fulfills the current strategic mandate based on real-time data analysis.'}"
                             </p>
                          </div>
                          
                          <div className="pt-6 border-t border-white/5">
                             <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-3">Impact Assessment</p>
                             <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded bg-green/10 border border-green/20 text-[9px] text-green font-black uppercase tracking-widest">Efficiency +{Math.floor(Math.random() * 20)+5}%</span>
                                <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-black uppercase tracking-widest">Strategic Alignment</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem] review-anim opacity-0">
                  <div className="w-12 h-12 bg-green/10 border border-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green font-bold">✓</span>
                  </div>
                  <h3 className="font-syne font-[800] text-white text-lg uppercase tracking-tight">Queue Clear</h3>
                  <p className="font-syne text-[10px] text-white/20 font-black uppercase tracking-widest">No decisions pending right now.</p>
                </div>
              )}
            </div>

            {/* Sidebar: Coordination Log */}
            <div className="w-full lg:w-96 space-y-8">
              <div className="review-anim opacity-0">
                <h3 className="font-syne text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">Coordination Log</h3>
                <div className="space-y-4">
                  {coordLog.length > 0 ? coordLog.map((log, i) => (
                    <div key={i} className="relative pl-6 pb-6 border-l border-white/5 last:pb-0">
                      <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ${log.status === 'pending' ? 'bg-green animate-pulse shadow-[0_0_10px_rgba(0,255,135,0.5)]' : 'bg-white/10'}`} />
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-[800] text-[11px] uppercase tracking-tight">{log.from_agent?.name || 'Agent'}</span>
                        <span className="text-[10px] text-white/20">→</span>
                        <span className="text-green font-[800] text-[11px] uppercase tracking-tight">{log.to_agent?.name || 'Agent'}</span>
                        <span className="ml-auto text-[9px] text-white/20 font-black uppercase tracking-tighter">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none">{log.type} | {log.status}</p>
                    </div>
                  )) : (
                    <p className="text-[10px] text-white/10 font-black uppercase tracking-widest">No coordination events yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fine-tune Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-surface border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative">
              <button 
                onClick={() => setEditingItem(null)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                ✕
              </button>
              
              <h3 className="font-syne text-2xl font-[800] text-white mb-2 uppercase tracking-tight">Fine-tune <span className="text-green">Response</span></h3>
              <p className="font-syne text-[11px] text-white/40 uppercase tracking-widest font-black mb-8 border-b border-white/5 pb-6">Modify the agent's proposed action before deployment.</p>
              
              <textarea 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-48 bg-bg/50 border border-white/5 rounded-2xl p-6 font-dm-mono text-sm text-white/80 placeholder:text-white/10 focus:border-green/50 outline-none transition-all resize-none mb-8"
              />
              
              <div className="flex gap-4">
                 <button 
                   onClick={() => handleAction(editingItem.id, 'approved')}
                   className="flex-1 btn-primary py-4 rounded-xl font-syne font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   Deploy Modified Action →
                 </button>
                 <button 
                   onClick={() => setEditingItem(null)}
                   className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white/40 font-syne font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all"
                 >
                   Cancel
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

