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
  const [agentState, setAgentState] = useState<'planning' | 'automation'>('planning');
  const [llm, setLlm] = useState('orca');
  const [showAddMenu, setShowAddMenu] = useState(false);
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

    const LLMS = [
    { id: 'orca', name: 'ORCA Intelligence' },
    { id: 'gpt4', name: 'GPT-4o' },
    { id: 'claude', name: 'Claude 3.5' },
    { id: 'gemini', name: 'Gemini 1.5' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'mistral', name: 'Mistral' },
    { id: 'groq', name: 'Groq' },
    { id: 'grok', name: 'Grok' },
    { id: 'ollama', name: 'Ollama' },
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

  const renderInput = (centered: boolean) => (
    <div className={`transition-all duration-500 ${centered ? 'w-full' : 'p-8 border-t border-white/5 bg-bg/50'}`}>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Selector Row */}
        <div className="flex items-center gap-2 mb-2">
           <div className="flex p-0.5 bg-white/5 rounded-xl border border-white/5">
              {['planning', 'automation'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setAgentState(s as any)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${agentState === s ? 'bg-green text-bg shadow-lg' : 'text-white/30 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
           </div>
           <select 
             value={llm} 
             onChange={(e) => setLlm(e.target.value)}
             className="bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/40 outline-none focus:border-green/30 cursor-pointer hover:bg-white/10 transition-all"
           >
             {LLMS.map(l => <option key={l.id} value={l.id} className="bg-bg text-white">{l.name}</option>)}
           </select>
        </div>

        <form onSubmit={handleSendMessage} className="relative flex items-center group">
          <button 
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="absolute left-4 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all z-10"
          >
            <span className="text-xl font-light hover:rotate-90 transition-transform duration-300">+</span>
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Ask anything..."
            className="w-full bg-white/5 border border-white/10 rounded-3xl px-16 py-6 focus:outline-none focus:border-green/50 text-[15px] transition-all placeholder:text-white/10 shadow-2xl resize-none overflow-hidden"
            rows={1}
          />
          <div className="absolute right-4 flex items-center gap-4">
            <button type="button" className="text-white/20 hover:text-green transition-colors focus:outline-none">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            </button>
            <button type="submit" className={`p-2 transition-all duration-300 ${input.trim() ? 'text-green scale-110' : 'text-white/10'}`} disabled={!input.trim()}>
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>

          {showAddMenu && (
            <div className="absolute bottom-full left-4 mb-4 w-56 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[100] animate-in slide-in-from-bottom-2 fade-in divide-y divide-white/5">
               {['Departments', 'Media', 'Files'].map(item => (
                 <button 
                  key={item} 
                  onClick={() => setShowAddMenu(false)}
                  className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-green/10 hover:text-green transition-all"
                 >
                   {item}
                 </button>
               ))}
            </div>
          )}
        </form>
        <div className="flex justify-center">
           <span className="text-[9px] text-white/5 uppercase tracking-[0.3em] font-black">Powered by ORCA Intelligence</span>
        </div>
      </div>
    </div>
  );

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

        <div className={`flex-1 flex flex-col transition-all duration-1000 ease-in-out ${messages.length === 0 ? 'justify-center items-center' : 'overflow-hidden'}`}>
          {messages.length === 0 ? (
            <div className="w-full max-w-4xl px-8 flex flex-col items-center dash-anim">
               <div className="mb-8 w-20 h-20 bg-green/10 border border-green/20 rounded-3xl flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(0,255,135,0.1)]">
                  <img src="/orca-logo.svg" alt="logo" className="w-10 h-10" />
               </div>
               <h1 className="font-syne text-6xl font-black text-white mb-6 uppercase tracking-tighter text-center leading-none">
                 What should we <br/><span className="text-green">build today?</span>
               </h1>
               <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-16 text-center">Autonomous OS · Synchronized Intelligence</p>
               {renderInput(true)}
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full w-full max-w-5xl mx-auto overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-32">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className={`max-w-[80%] p-6 rounded-3xl border transition-all ${
                      msg.role === 'user' 
                        ? 'bg-white/5 border-white/10 text-white shadow-xl' 
                        : 'bg-green/5 border-green/10 text-text-muted shadow-2xl'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-green shadow-[0_0_10px_rgba(0,255,135,1)]" />
                          <span className="text-[10px] font-black text-green uppercase tracking-widest">{msg.sender || 'ORCA'}</span>
                          <span className="text-[8px] text-white/20 uppercase tracking-widest ml-2">Executive Response</span>
                        </div>
                      )}
                      <p className={`${msg.role === 'user' ? 'text-[15px]' : 'text-[16px]'} leading-relaxed whitespace-pre-wrap font-medium`}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-bg via-bg/95 to-transparent pointer-events-none">
                <div className="pointer-events-auto max-w-5xl mx-auto">
                   {renderInput(false)}
                </div>
              </div>
            </div>
          )}
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
