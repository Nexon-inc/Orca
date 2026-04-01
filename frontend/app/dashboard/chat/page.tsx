'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';
import PricingModal from '@/components/PricingModal';

/**
 * CHAT-FIRST DASHBOARD (Phase 3 - Executive Pivot)
 */
export default function ChatPage() {
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [pinnedAgent, setPinnedAgent] = useState<string | null>(null);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const EXECUTIVE_PILLS = [
    { key: 'marketing', name: 'CMO', title: 'Chief Marketing Officer', icon: 'ðŸŽ™ï¸', agent: 'Aria' },
    { key: 'sales',     name: 'CSO', title: 'Chief Sales Officer', icon: 'ðŸ’°', agent: 'Rex' },
    { key: 'cs',        name: 'CCO', title: 'Chief Customer Officer', icon: 'ðŸ›Ÿ', agent: 'Purity' },
    { key: 'intel',     name: 'CIO', title: 'Chief Intelligence Officer', icon: 'ðŸ›ï¸', agent: 'Roman' },
    { key: 'tech',      name: 'CTO', title: 'Chief Technology Officer', icon: 'ðŸ‘»', agent: 'Ghost' },
  ];

  useEffect(() => {
    // 1. Greeting Logic
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data.user));

    fetch('/api/org')
      .then(res => res.json())
      .then(data => {
        const orgData = data.member?.organizations || {};
        setOrg(orgData);
        if (orgData.plan === 'none' || orgData.plan === 'free' || !orgData.plan_expires_at) {
          setShowPricingModal(true);
        } else if (orgData.plan_expires_at && new Date() > new Date(orgData.plan_expires_at)) {
          setShowPricingModal(true);
          setIsLocked(true);
        }
      });

    fetch('/api/org/activity')
      .then(res => res.json())
      .then(data => setLiveActivity(data.activity || []));

    animate('.dash-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input }]);
    setInput('');
    // Logic for Chat routing (Phase 3)
  };

  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar active="chat" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 font-dm-mono">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="font-syne font-bold text-white text-[16px] dash-anim">
               {greeting}, {user?.full_name?.split(' ')[0] || 'Founder'}
             </h2>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/5 border border-green/10 dash-anim">
                <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-[9px] text-green uppercase tracking-[0.2em]">Full Executive Team Online</span>
             </div>
          </div>
          <div className="flex items-center gap-6 dash-anim">
            <div className="flex items-center gap-2 text-white/40 text-[9px] uppercase tracking-[0.2em] leading-none">
               Status: <span className="text-green/60 uppercase">Synchronized</span>
            </div>
          </div>
        </header>

        {/* Chat-first Grid Layout */}
        <div className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto no-scrollbar max-w-5xl mx-auto w-full">
          
          {/* Chat Section */}
          <div className="flex-1 flex flex-col relative min-h-[500px] dash-anim">
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-6 rounded-2xl border ${msg.role === 'user' ? 'bg-green/10 border-green/20 text-white' : 'bg-white/5 border-white/10 text-text-muted'} transition-all`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-green uppercase tracking-widest">{msg.sender}</span>
                        <div className="w-1 h-1 rounded-full bg-green" />
                        <span className="text-[9px] text-white/20 uppercase tracking-tighter">Big 6 Executive</span>
                      </div>
                    )}
                    <p className={`${msg.role === 'user' ? 'text-[15px]' : 'text-[14px]'} leading-relaxed whitespace-pre-wrap`}>{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area with Executive Pills */}
            <div className="p-8 border-t border-white/5 bg-bg/50">
              <div className="flex items-center gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
                <span className="text-[9px] text-white/20 font-black uppercase tracking-widest mr-2 shrink-0">Your Team:</span>
                {EXECUTIVE_PILLS.map(exec => (
                  <button 
                    key={exec.key}
                    onClick={() => setPinnedAgent(pinnedAgent === exec.agent ? null : exec.agent)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap group dash-anim ${
                      pinnedAgent === exec.agent 
                        ? 'bg-green border-green text-bg' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-green hover:border-green/30'
                    }`}
                  >
                    <span className="text-xs">{exec.icon}</span>
                    <span className="font-bold uppercase tracking-widest text-[9px]">{exec.name}</span>
                    <span className="text-[9px] opacity-20 group-hover:opacity-100 transition-opacity ml-1 hidden sm:inline">{exec.title}</span>
                  </button>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="relative flex items-center dash-anim">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={pinnedAgent ? `Send a brief to ${pinnedAgent}...` : "Ask anything or pick a lead executive above..."}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 focus:outline-none focus:border-green/50 text-[15px] transition-all placeholder:text-white/20 shadow-2xl resize-none"
                />
                <button type="submit" className="absolute right-4 p-3 text-green hover:scale-110 transition-transform">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>
              <div className="mt-4 flex justify-between items-center px-2">
                <span className="text-[9px] text-white/10 uppercase tracking-[0.2em]">Press / to focus chat</span>
                {pinnedAgent && (
                   <button onClick={() => setPinnedAgent(null)} className="text-[9px] text-green/40 hover:text-green uppercase tracking-widest transition-all">Clear Pin [Esc]</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => !isLocked && setShowPricingModal(false)} 
        isLocked={isLocked}
        currentPlan={org?.plan}
      />
    </div>
  );
}
