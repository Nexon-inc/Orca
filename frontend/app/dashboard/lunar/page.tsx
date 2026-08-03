'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { toast } from 'sonner';

export default function LunarPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I am Lunar, your Chief Business Context Officer. I build and maintain the Business Context Protocol (BCP) for your company so all 6 ORCA executives operate with complete alignment.\n\nTell me about your product, target audience, core business goals, or preferred operating rules to raise your BCP Completeness score.',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(10);
  const [bcpData, setBcpData] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/lunar')
      .then((res) => res.json())
      .then((data) => {
        if (data.score) setScore(data.score);
        if (data.bcp) setBcpData(data.bcp);
      })
      .catch(() => {});
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMsgs = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/lunar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });

      const data = await res.json();
      if (data.content) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
        if (data.score) setScore(data.score);
        if (data.bcpUpdatesCount > 0) {
          toast.success(`Updated ${data.bcpUpdatesCount} BCP protocol fields!`);
        }
      } else {
        toast.error(data.error || 'Failed to get response from Lunar');
      }
    } catch (err) {
      toast.error('Lunar communication error');
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="lunar" />

      <main className="flex-1 ml-64 flex flex-col h-screen relative grid-bg overflow-hidden">
        <DashboardHeader />

        {/* BCP Completeness Bar */}
        <div className="mx-8 mt-6 p-4 bg-[#121412] border border-[#262a26] rounded-2xl shadow-lg flex items-center justify-between gap-6 z-20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <div>
              <h2 className="text-sm font-bold font-syne text-white uppercase tracking-wider">Business Context Protocol (BCP)</h2>
              <p className="text-[10px] font-mono text-on-surface/40 uppercase tracking-widest">
                Single source of truth for Atlas, Aria, Rex, Purity, Roman & Ghost
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-full h-3 overflow-hidden p-0.5 relative">
              <div
                style={{ width: `${score}%` }}
                className="bg-gradient-to-r from-emerald-500 to-green h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(0,255,135,0.4)]"
              />
            </div>
            <span className="text-xs font-mono font-bold text-green w-12 text-right">{score}%</span>
          </div>

          <button
            onClick={() => handleSendMessage({ preventDefault: () => {} } as any)}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-mono uppercase tracking-wider transition-colors"
          >
            Show Raw BCP
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              {m.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1.5 px-2">
                  <span className="text-sm">🌙</span>
                  <span className="text-[10px] font-bold text-green uppercase tracking-wider">Lunar AI · BCP Architect</span>
                </div>
              )}
              <div
                className={`p-5 rounded-2xl max-w-[80%] text-[13px] leading-relaxed font-dm-mono whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-white/10 text-white rounded-br-none border border-white/10'
                    : 'bg-surface-container-low text-on-surface border border-outline-variant/10 rounded-bl-none shadow-md'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 w-fit animate-pulse">
              <div className="w-2 h-2 rounded-full bg-green animate-ping" />
              <span className="text-[11px] font-mono text-on-surface/60 uppercase tracking-wider">Synthesizing Business Context Protocol...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-8 pt-0 z-30">
          <form onSubmit={handleSendMessage} className="bg-[#121412] border border-[#262a26] rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell Lunar about your goals, audience, product, or rules..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-on-surface/20 text-sm font-dm-mono"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-10 px-6 rounded-xl bg-green text-bg font-syne font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-30 transition-all"
            >
              Send →
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
