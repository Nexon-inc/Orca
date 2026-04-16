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
  const [activeModel, setActiveModel] = useState('ORCA Intelligence');

  const MODES = ['Planning', 'Automate', 'Approve'];
  const MODELS = [
    'ORCA Intelligence',
    'Claude 3.5 Sonnet',
    'GPT-4o',
    'Llama 3.1 405B',
    'Gemini 1.5 Pro (Native)',
    'DeepSeek V3 (OR)'
  ];

  const EXECUTIVE_PILLS = [
    { key: 'ceo', role: 'CEO', icon: 'leaderboard', name: 'Atlas' },
    { key: 'cmo', role: 'CMO', icon: 'campaign', name: 'Aria' },
    { key: 'cso', role: 'CSO', icon: 'payments', name: 'Rex' },
    { key: 'cco', role: 'CCO', icon: 'support_agent', name: 'Purity' },
    { key: 'cio', role: 'CIO', icon: 'hub', name: 'Roman' },
    { key: 'cto', role: 'CTO', icon: 'memory', name: 'Ghost' },
  ];

  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    // Detect Orca Hub Installation Redirect
    const searchParams = new URLSearchParams(window.location.search);
    const installedTemplate = searchParams.get('installed');
    
    if (installedTemplate && messages.length === 0) {
      setMessages([{
        id: 'deploy-init',
        role: 'assistant',
        content: `SYSTEM_DEPLOYMENT: ${installedTemplate.toUpperCase()}_OS has been successfully initialized. All core executives are now online and standing by. Atlas is ready to begin operations.`,
        agent: EXECUTIVE_PILLS[0]
      }]);
    }

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
             const msgRes = await fetch(`/api/conversations/${params.id}/messages`);
             const msgData = await msgRes.json();
             if (msgData.messages) setMessages(msgData.messages);
          } else {
            // Check Onboarding status only if new chat
            const identityRes = await fetch('/api/company'); 
            const identityData = await identityRes.json();
            
            if (!identityData?.mission) {
              setIsOnboarding(true);
              setPinnedAgent('CEO');
              setMessages([{
                id: 'onboarding-init',
                role: 'assistant',
                content: "I am Atlas, the CEO of your Autonomous OS. I've detected your company profile is incomplete. To begin operations, I need to understand your mission. Tell me: What does your company do and who are we building for?",
                agent: EXECUTIVE_PILLS[0]
              }]);
            }
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
  }, [params.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    let currentId = params.id as string;
    
    // 1. Auto-Create Conversation if on "New Chat" route
    if (!currentId) {
      try {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            agent_id: EXECUTIVE_PILLS.find(p => p.role === pinnedAgent)?.key || 'ceo',
            department_key: (pinnedAgent || 'ceo').toLowerCase()
          })
        });
        const createData = await createRes.json();
        if (createData.conversation) {
          currentId = createData.conversation.id;
          // Silently push the new route while continuing our execution
          window.history.pushState({}, '', `/dashboard/chat/${currentId}`);
        }
      } catch (err) {
        console.error('Failed to create conversation:', err);
        return;
      }
    }

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Scroll
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await fetch(`/api/conversations/${currentId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: input,
          mode: chatMode.toLowerCase(),
          model: activeModel.id
        })
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, {
          ...data.message,
          role: 'assistant',
          agent: EXECUTIVE_PILLS.find(p => p.role === pinnedAgent) || EXECUTIVE_PILLS[0]
        }]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
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
          className="flex items-center gap-1.5 text-on-surface/40 hover:text-primary-container transition-colors group pointer-events-auto px-2 py-1 rounded-md hover:bg-white/5"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.15em] group-hover:text-primary-container font-label">{displayValue}</span>
          <svg 
            className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
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
                  className={`w-full text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-colors ${activeId === optId ? 'text-primary-container' : 'text-on-surface/50'}`}
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

        <div className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto w-full pt-8 pb-32 no-scrollbar">
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-16 pointer-events-none">
              <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase">
                {greeting} {userName}.
              </h1>
            </div>
          ) : (
            <div className="w-full max-w-3xl flex flex-col gap-6 px-4 pb-20">
              {messages.map(msg => (
                <div key={msg.id} className="w-full">
                  {msg.role === 'user' ? (
                    <div className="flex justify-end mb-4">
                      <div className="max-w-[70%] px-5 py-3 bg-surface-container-high border border-outline-variant/10 rounded-lg text-sm text-on-surface font-body leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 mb-8">
                      <div className="flex-shrink-0 pt-1">
                        <div className="w-8 h-8 rounded bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                          {msg.agent?.role === 'CEO' && <svg className="w-4 h-4 text-primary-container" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>}
                          {msg.agent?.role === 'CMO' && <svg className="w-4 h-4 text-primary-container" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"></path><path d="m18 8 4-4v16l-4-4"></path><line x1="12" y1="12" x2="12" y2="12.01"></line></svg>}
                          {msg.agent?.role === 'CSO' && <svg className="w-4 h-4 text-primary-container" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
                          {msg.agent?.role === 'CCO' && <svg className="w-4 h-4 text-primary-container" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                          {msg.agent?.role === 'CIO' && <svg className="w-4 h-4 text-primary-container" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="12" x2="9" y2="12"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="12" y1="3" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="21"></line></svg>}
                          {msg.agent?.role === 'CTO' && <svg className="w-4 h-4 text-primary-container" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>}
                          {!msg.agent && <svg className="w-4 h-4 text-primary-container" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"></path><path d="M11 10h1v6h1"></path></svg>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[12px] font-black font-headline text-on-surface uppercase tracking-wider">
                            {msg.agent?.name || 'Aria'} ({msg.agent?.role || 'CMO'})
                          </span>
                          <span className="text-[8px] font-mono text-on-surface/20 uppercase ml-auto">
                            JUST NOW
                          </span>
                        </div>
                        <div className="text-sm text-on-secondary-container font-body leading-relaxed">
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-outline-variant/10">
                          <button className="text-[9px] font-black text-on-surface/30 uppercase tracking-widest hover:text-primary-container transition-colors flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Approve
                          </button>
                          <button className="text-[9px] font-black text-on-surface/30 uppercase tracking-widest hover:text-error transition-colors flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            Reject
                          </button>
                          <button className="text-[9px] font-black text-on-surface/30 uppercase tracking-widest hover:text-on-surface transition-colors flex items-center gap-1 ml-auto">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
                  {exec.role === 'CEO' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>}
                  {exec.role === 'CMO' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"></path><path d="m18 8 4-4v16l-4-4"></path><line x1="12" y1="12" x2="12" y2="12.01"></line></svg>}
                  {exec.role === 'CSO' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
                  {exec.role === 'CCO' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                  {exec.role === 'CIO' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="12" x2="9" y2="12"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="12" y1="3" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="21"></line></svg>}
                  {exec.role === 'CTO' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>}
                  {exec.name}
                </button>
              ))}
            </div>

            <div className="bg-[#121412] border border-[#262a26] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all focus-within:border-primary-container/20">
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
                  placeholder={pinnedAgent ? `Brief your ${pinnedAgent}...` : "Ask anything, @ to mention, / for workflows"}
                  rows={1}
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d0f0d]/30 border-t border-[#262a26]/40">
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 flex items-center justify-center text-on-surface/40 hover:text-primary-container transition-colors rounded-lg hover:bg-white/5">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  
                  <div className="h-4 w-[1px] bg-[#262a26] mx-1" />
                  
                  <Dropdown value={chatMode} options={MODES} onChange={setChatMode} />
                  
                  <div className="h-1 w-1 rounded-full bg-on-surface/10 mx-1" />
                  
                  <Dropdown value={activeModel} options={MODELS} onChange={setActiveModel} />
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="h-8 w-8 flex items-center justify-center text-on-surface/40 hover:text-primary-container transition-colors rounded-lg hover:bg-white/5">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  </button>
                  <button 
                    onClick={() => handleSendMessage()}
                    className={`h-9 w-9 flex items-center justify-center rounded-full transition-all ${
                      input.trim() 
                        ? 'bg-primary-container text-on-primary shadow-[0_0_20px_rgba(0,195,103,0.3)] hover:scale-105 active:scale-95'
                        : 'bg-[#212421] text-on-surface/20 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
