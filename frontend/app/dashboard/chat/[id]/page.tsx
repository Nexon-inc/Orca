'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import PricingModal from '@/components/PricingModal';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const [org, setOrg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('GOOD MORNING,');
  const [pinnedAgent, setPinnedAgent] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Chat Modes & Models
  const [chatMode, setChatMode] = useState('Planning');
  const [activeModel, setActiveModel] = useState({ name: 'ORCA Intelligence', id: 'orca-intel' });

  const MODES = ['Planning', 'Automate', 'Approve'];
  const MODELS = [
    { name: 'ORCA Intelligence', id: 'orca-intel' },
    { name: 'Claude 3.5 Sonnet', id: 'anthropic/claude-3.5-sonnet' },
    { name: 'GPT-4o', id: 'openai/gpt-4o' },
    { name: 'Llama 3.1 405B', id: 'meta-llama/llama-3.1-405b-instruct' },
    { name: 'Gemini 1.5 Pro (Native)', id: 'google/gemini-1.5-pro' },
    { name: 'DeepSeek V3 (OR)', id: 'deepseek/deepseek-chat' }
  ];

  const EXECUTIVE_PILLS = [
    { key: 'ceo', role: 'CEO', icon: '🏦', title: 'Atlas (CEO/Ops)' },
    { key: 'cmo', role: 'CMO', icon: '🎙️', title: 'Aria (Marketing)' },
    { key: 'cso', role: 'CSO', icon: '💰', title: 'Rex (Sales)' },
    { key: 'cco', role: 'CCO', icon: '🛟', title: 'Purity (Customer)' },
    { key: 'cio', role: 'CIO', icon: '🏛️', title: 'Roman (Intel)' },
    { key: 'cto', role: 'CTO', icon: '👻', title: 'Ghost (Tech)' },
  ];

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isIdeating, setIsIdeating] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBriefing, setIsBriefing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const THINKING_MESSAGES = ['Analyzing platform data...', 'Strategizing roadmap...', 'Calculating growth vectors...', 'Orchestrating executives...', 'Refining directives...'];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setThinkingStep(prev => (prev + 1) % THINKING_MESSAGES.length);
      }, 1500);
    } else {
      setThinkingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    // 1. Initial Loading
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('GOOD MORNING,');
    else if (hour >= 12 && hour < 17) setGreeting('GOOD AFTERNOON,');
    else setGreeting('GOOD EVENING,');

    const initialize = async () => {
      try {
        const userRes = await fetch('/api/user');
        const userData = await userRes.json();
        if (userData?.user) {
          setUser(userData.user);
          
          if (params.id) {
            // Fetch existing messages
            try {
              const msgRes = await fetch(`/api/conversations/${params.id}/messages`);
              if (msgRes.ok) {
                const msgData = await msgRes.json();
                if (msgData.messages) setMessages(msgData.messages);
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
              }
            } catch (err) {
              console.error('Failed to load history:', err);
            }
          }

          // Check Onboarding status
          const identityRes = await fetch('/api/company'); 
          const identityData = await identityRes.json();
          
          if (!identityData?.identity?.mission) {
            setIsOnboarding(true);
            setPinnedAgent('CEO');
            setMessages([{
              id: 'onboarding-init',
              role: 'assistant',
              content: "I am Atlas, the CEO of your Autonomous OS. I've detected your company profile is incomplete. To begin operations, I need to understand your mission. Tell me: What does your company do and who are we building for?",
              agent: EXECUTIVE_PILLS[0]
            }]);
          } else {
            setIsOnboarding(false);
          }
        }
      } catch (err) {}
    };

    initialize();

    // Focus input on slash
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    
    // Scroll
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    setIsLoading(true);
    try {
      const res = await fetch(`/api/conversations/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: currentInput,
          mode: chatMode.toLowerCase(),
          model: typeof activeModel === 'string' ? activeModel : (activeModel as any).id
        })
      });
      const data = await res.json();
      console.log('DEBUG_CHAT_RESPONSE:', data);
      
      if (data.error) {
        console.error('System error:', data.error);
      } else if (data.message) {
        setMessages(prev => [...prev, {
          ...data.message,
          role: 'assistant',
          agent: EXECUTIVE_PILLS.find(p => p.role === pinnedAgent) || EXECUTIVE_PILLS[0]
        }]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => setIsListening(false), 2000);
  };

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = '40px'; 
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Dropdown Component 
  const Dropdown = ({ value, options, onChange, labelKey = 'name' }: { value: any, options: any[], onChange: (v: any) => void, labelKey?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const displayValue = typeof value === 'string' ? value : value[labelKey];
    
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-on-surface/30 hover:text-primary-container transition-colors group pointer-events-auto"
        >
          <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary-container font-label">{displayValue}</span>
          <span className="material-symbols-outlined text-[16px]">{isOpen ? 'expand_less' : 'expand_more'}</span>
        </button>
        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 min-w-[140px] bg-[#1a1c1a] border border-[#2d312d] rounded-lg shadow-xl py-2 z-50 pointer-events-auto overflow-hidden">
            {options.map(opt => {
              const optLabel = typeof opt === 'string' ? opt : opt[labelKey];
              const optId = typeof opt === 'string' ? opt : opt.id;
              const activeId = typeof value === 'string' ? value : value.id;

              return (
                <button
                  key={optId}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary-container/10 transition-colors ${activeId === optId ? 'text-primary-container' : 'text-on-surface/60'}`}
                >
                  {optLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const userName = user?.full_name?.split(' ')[0] || 'KALE';

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="chat" />

      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg">
        <DashboardHeader />

        <div className={`flex-1 flex flex-col items-center relative overflow-y-auto w-full pt-8 pb-[40rem] ${messages.length === 0 ? 'justify-center' : 'justify-start'}`}>
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-16 pointer-events-none">
              <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase">
                {greeting} {userName}.
              </h1>
            </div>
          ) : (
            <div className="w-full max-w-3xl flex flex-col gap-6 px-4 min-h-full">
              {messages.map(msg => (
                <div key={msg.id} className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {msg.role === 'user' ? (
                    <div className="flex justify-end mb-4">
                      <div className="max-w-[85%] px-5 py-3 bg-surface-container-high border border-outline-variant/10 rounded-2xl text-sm text-on-surface font-body leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 mb-6">
                      <div className="flex-shrink-0 pt-1">
                        <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-lg shadow-inner grayscale">
                          {msg.agent?.icon || '🏦'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black font-headline text-primary-container uppercase tracking-[0.25em]">{msg.agent?.role || 'ATLAS'}</span>
                          <span className="w-1 h-1 rounded-full bg-on-surface/10" />
                          <span className="text-[9px] font-mono text-on-surface/40 uppercase tracking-widest">
                            {msg.agent?.title || 'CHIEF EXECUTIVE'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-on-secondary-container font-body leading-relaxed whitespace-pre-wrap">
                          {msg.content.split('RESULT:')[0].split('COORDINATION_NEEDED:')[0].split('---')[0]
                            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                            .replace(/\*(.*?)\*/g, '$1')   // Remove italic
                            .replace(/###\s*(.*?)(?:\n|$)/g, '$1\n') // Clean headers
                            .replace(/##\s*(.*?)(?:\n|$)/g, '$1\n')
                            .replace(/#\s*(.*?)(?:\n|$)/g, '$1\n')
                            .trim()
                          }
                        </div>

                        {/* Result Items */}
                        {(msg.result_items || (msg.content.includes('RESULT:') && msg.content.split('RESULT:')[1].split('COORDINATION_NEEDED:')[0].split('\n'))) && (
                          <div className="mt-4 p-4 bg-primary-container/5 border border-primary-container/10 rounded-xl space-y-2">
                             <div className="text-[9px] font-black text-primary-container uppercase tracking-widest mb-1">Directives Generated</div>
                             {(msg.result_items || msg.content.split('RESULT:')[1].split('COORDINATION_NEEDED:')[0].split('\n').filter(Boolean)).map((item: string, i: number) => (
                               <div key={i} className="flex items-start gap-2 text-[11px] text-on-surface/70">
                                 <span className="mt-1 text-primary-container material-symbols-outlined text-xs">check_circle</span>
                                 {item.replace(/^\d+\.\s*/, '').trim()}
                               </div>
                             ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant/10 opacity-30 hover:opacity-100 transition-opacity">
                          {chatMode.toLowerCase() === 'approve' && (
                            <>
                              <button 
                                onClick={async () => {
                                  const res = await fetch(`/api/messages/${msg.id}/status`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'approved' })
                                  });
                                  if (res.ok) {
                                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'approved' } : m));
                                  }
                                }}
                                className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${msg.status === 'approved' ? 'text-primary-container' : 'text-on-surface hover:text-primary-container'}`}
                              >
                                <span className="material-symbols-outlined text-xs">{msg.status === 'approved' ? 'task_alt' : 'check'}</span> 
                                {msg.status === 'approved' ? 'Approved' : 'Approve'}
                              </button>
                              <button 
                                onClick={async () => {
                                  const res = await fetch(`/api/messages/${msg.id}/status`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'rejected' })
                                  });
                                  if (res.ok) {
                                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'rejected' } : m));
                                  }
                                }}
                                className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${msg.status === 'rejected' ? 'text-error' : 'text-on-surface hover:text-error'}`}
                              >
                                <span className="material-symbols-outlined text-xs">{msg.status === 'rejected' ? 'block' : 'close'}</span> 
                                {msg.status === 'rejected' ? 'Rejected' : 'Reject'}
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                              // Could add a toast here
                            }}
                            className="text-[9px] font-black text-on-surface uppercase tracking-widest flex items-center gap-1 ml-auto hover:text-primary-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">content_copy</span> Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 mb-6 w-full animate-pulse">
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-primary-container/10 flex items-center justify-center text-lg shadow-inner grayscale opacity-50">
                      {pinnedAgent ? EXECUTIVE_PILLS.find(p => p.role === pinnedAgent)?.icon : '🏦'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[11px] font-black font-headline text-on-surface uppercase tracking-wider opacity-30">
                        {pinnedAgent || 'ATLAS'}
                      </span>
                      <span className="text-[9px] font-mono text-primary-container uppercase tracking-[0.2em] animate-pulse">
                        {THINKING_MESSAGES[thinkingStep]}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-3/4 bg-on-surface/5 rounded-full" />
                      <div className="h-2 w-1/2 bg-on-surface/5 rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              <div className="h-[40rem] flex-shrink-0" />
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input System */}
        <div className="fixed bottom-0 left-64 right-0 p-8 pt-0 flex flex-col items-center pointer-events-none z-30">
          <div className="w-full max-w-3xl flex flex-col gap-3 pointer-events-auto">
            
            <div className="flex justify-center gap-2 mb-1">
              {EXECUTIVE_PILLS.map(exec => (
                <button 
                  key={exec.key}
                  disabled={isOnboarding && exec.role !== 'CEO'}
                  onClick={() => setPinnedAgent(pinnedAgent === exec.role ? null : exec.role)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-colors ${
                    pinnedAgent === exec.role
                      ? 'bg-primary-container/10 border border-primary-container/40 text-primary-container shadow-[0_0_15px_rgba(0,195,103,0.1)]'
                      : 'bg-surface-container-high border border-outline-variant/20 text-on-surface/30 hover:border-primary-container/40 hover:text-on-surface'
                  } ${isOnboarding && exec.role !== 'CEO' ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <span className="text-sm grayscale">{exec.icon}</span>
                  {exec.role}
                </button>
              ))}
            </div>

            <div className="bg-[#121412] border border-[#262a26] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all focus-within:border-primary-container/20">
              <div className="px-6 py-4">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface/20 text-[15px] font-body resize-none overflow-y-auto min-h-[44px] max-h-[160px] no-scrollbar py-1"
                  placeholder={isBriefing ? "Master Briefing in progress..." : (pinnedAgent ? `Brief your ${pinnedAgent}...` : "Ask anything, @ to mention, / for workflows")}
                  rows={1}
                  disabled={isBriefing}
                />
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d0f0d]/30 border-t border-[#262a26]/40 rounded-b-2xl">
                <div className={`flex items-center gap-2 ${isBriefing ? 'opacity-20 pointer-events-none' : ''}`}>
                  <div className="relative">
                    <button 
                      onClick={() => setShowAddMenu(!showAddMenu)}
                      className="h-8 w-8 flex items-center justify-center text-on-surface/40 hover:text-primary-container transition-colors rounded-lg hover:bg-white/5"
                    >
                      <span className="material-symbols-outlined text-[22px]">add</span>
                    </button>
                    {showAddMenu && (
                      <div className="absolute bottom-full mb-3 left-0 bg-[#1a1c1a] border border-[#2d312d] rounded-lg shadow-xl py-2 min-w-[180px] z-50">
                        <button className="w-full text-left px-4 py-2 text-[9px] font-black text-on-surface/50 hover:text-primary-container hover:bg-white/5 uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">upload_file</span> Upload Document
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[9px] font-black text-on-surface/50 hover:text-primary-container hover:bg-white/5 uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">image</span> Upload Image
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[9px] font-black text-on-surface/50 hover:text-primary-container hover:bg-white/5 uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">link</span> Link Source
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="h-4 w-[1px] bg-[#262a26] mx-1" />
                  <Dropdown value={chatMode} options={MODES} onChange={setChatMode} />
                  <div className="h-1 w-1 rounded-full bg-on-surface/10 mx-1" />
                  <Dropdown value={activeModel} options={MODELS} onChange={setActiveModel} />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleVoiceInput}
                    className={`h-8 w-8 flex items-center justify-center transition-colors rounded-lg hover:bg-white/5 ${isListening ? 'text-error animate-pulse' : 'text-on-surface/40 hover:text-primary-container'}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">mic</span>
                  </button>
                  <button 
                    onClick={() => handleSendMessage()}
                    className={`h-9 w-9 flex items-center justify-center rounded-full transition-all ${
                      input.trim() 
                        ? 'bg-primary-container text-on-primary shadow-[0_0_20px_rgba(0,195,103,0.3)] hover:scale-105 active:scale-95'
                        : 'bg-[#212421] text-on-surface/20 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[9px] font-mono text-on-surface/40 italic uppercase tracking-widest text-center mt-1">
              ORCA can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </main>
      
      {showPricingModal && (
        <PricingModal 
          isOpen={showPricingModal} 
          onClose={() => !isLocked && setShowPricingModal(false)} 
          isLocked={isLocked}
          currentPlan={org?.plan}
        />
      )}
    </div>
  );
}
