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

  const handleAction = async (id: string, approved: boolean) => {
    setActionLoading(id);
    try {
      await fetch(`/api/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: approved ? 'approved' : 'rejected' }),
      });
    } catch (err) {
      console.error('Action failed:', err);
    }
    // Animate out and remove from local queue
    animate(`.review-item-${id}`, {
      opacity: 0.4,
      scale: 0.98,
      duration: 300,
      ease: 'inQuad',
      onComplete: () => {
        setReviews(prev => prev.filter(r => r.id !== id));
        setActionLoading(null);
      }
    });
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
          {/* Greeting Section */}
          <div className="mb-12 review-anim opacity-0">
            <h1 className="font-syne text-4xl font-[800] text-white mb-2 tracking-tight uppercase">Governance <span className="text-green">Protocol Alpha</span></h1>
            <p className="font-syne text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Decisions awaiting your authorization.</p>
          </div>

            {[
              { label: 'Pending Approvals', val: reviews.length, color: reviews.length > 0 ? 'text-warn' : 'text-white' },
              { label: 'Coord Events Today', val: coordLog.length, color: 'text-white' },
              { label: 'Dept Reports', val: '—', color: 'text-white/20' },
              { label: 'Team Online', val: '—', color: 'text-white/20' },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm group hover:border-green/20 transition-all">
                <p className="text-[10px] text-white/40 font-[900] uppercase tracking-widest mb-2 group-hover:text-green transition-colors">{stat.label}</p>
                <p className={`text-2xl font-syne font-[800] ${stat.color}`}>{stat.val}</p>
              </div>
            ))}

          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            {/* Approval Queue (Main Column) */}
            <div className="flex-1 space-y-4">
              <h3 className="font-syne text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Approval Queue</h3>
              {reviews.map(item => (
                <div
                  key={item.id}
                  className={`review-item-${item.id} review-anim opacity-0 p-6 rounded-2xl border bg-surface/30 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-6 group transition-all ${
                    item.priority === 'urgent' ? 'border-red-500/20' :
                    item.priority === 'high' ? 'border-warn-dim' :
                    'border-white/5'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                       <span className={`w-2 h-2 rounded-full ${
                        item.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                        item.priority === 'high' ? 'bg-warn' : 'bg-white/20'
                      }`} />
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{item.type || 'Approval'}</span>
                      <span className="ml-auto text-[9px] text-white/20 font-black">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="font-syne text-lg font-[800] text-white mb-2 uppercase tracking-tight">{item.title || item.action_summary}</h4>
                    <p className="text-[12px] text-white/40 leading-relaxed mb-4">{item.description || item.context}</p>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-40 shrink-0">
                    <button
                      onClick={() => handleAction(item.id, true)}
                      disabled={actionLoading === item.id}
                      className="flex-1 btn-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      {actionLoading === item.id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(item.id, false)}
                      disabled={actionLoading === item.id}
                      className="flex-1 bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Reject
                    </button>
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
    </div>
  );
}

