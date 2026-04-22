'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, useParams } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import PricingModal from '@/components/PricingModal';

function ChatContent() {
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

  const [isIdeating, setIsIdeating] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBriefing, setIsBriefing] = useState(false);
  
  const searchParams = useSearchParams();
  const installedSlug = searchParams.get('installed');

  useEffect(() => {
    if (installedSlug) {
      handleMasterBriefing(installedSlug);
    }
  }, [installedSlug]);

  const handleMasterBriefing = async (slug: string) => {
    setIsBriefing(true);
    try {
      const res = await fetch(`/api/orcahub/${slug}`);
      const tpl = await res.json();
      
      if (!tpl.template_data?.day1_briefs) return;

      // System Message
      const systemId = Date.now().toString();
      setMessages([{
        id: systemId,
        role: 'agent',
        agent: { name: 'ATLAS', role: 'COO' },
        content: `MASTER BRIEFING INITIALIZED: ${tpl.name.toUpperCase()} OS PROTOCOLS DEPLOYED. STAND BY FOR AGENT HANDOFFS...`,
        created_at: new Date().toISOString()
      }]);

      // Sequence the briefs
      for (const brief of tpl.template_data.day1_briefs) {
        await new Promise(r => setTimeout(r, 2000)); // Handoff delay
        
        const msgId = Math.random().toString(36).substring(7);
        setMessages(prev => [...prev, {
          id: msgId,
          role: 'agent',
          agent: { 
            name: brief.agent_name.toUpperCase(), 
            role: EXECUTIVE_PILLS.find(p => p.name.toUpperCase() === brief.agent_name.toUpperCase())?.role || 'AGENT' 
          },
          content: brief.brief,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Master Briefing failed:', err);
    } finally {
      setIsBriefing(false);
    }
  };

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
            agent_name: EXECUTIVE_PILLS.find(p => p.role === pinnedAgent)?.name || 'Atlas',
            department_key: pinnedAgent?.toLowerCase() || 'ceo'
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

  const handleVoiceInput = () => {
    alert("In a real browser, this would trigger Google Speech Recognition via webkitSpeechRecognition. Initializing microphone...");
    setIsListening(true);
    // Mock transcription after 2s
    setTimeout(() => {
      setIsListening(false);
      // setInput("This is a voice transcription placeholder.");
    }, 2000);
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
                          <span className="material-symbols-outlined text-[18px] text-primary-container">
                            {EXECUTIVE_PILLS.find(p => p.role === msg.agent?.role)?.icon || 'smart_toy'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[12px] font-black font-headline text-on-surface uppercase tracking-wider">
                            ([{msg.agent?.name || 'Aria'}] ([{msg.agent?.role || 'CMO'}]))
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
                            <span className="material-symbols-outlined text-xs">check</span>
                            Approve
                          </button>
                          <button className="text-[9px] font-black text-on-surface/30 uppercase tracking-widest hover:text-error transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">close</span>
                            Reject
                          </button>
                          <button className="text-[9px] font-black text-on-surface/30 uppercase tracking-widest hover:text-on-surface transition-colors flex items-center gap-1 ml-auto">
                            <span className="material-symbols-outlined text-xs">content_copy</span>
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
                  <span className="material-symbols-outlined text-sm">{exec.icon}</span>
                  {exec.name}
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

              <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d0f0d]/30 border-t border-[#262a26]/40">
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

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-surface items-center justify-center">
        <span className="text-[10px] font-mono text-on-surface/20 uppercase animate-pulse">Initializing_Neural_Link...</span>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
