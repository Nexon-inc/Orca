'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
export const dynamic = 'force-dynamic';
import { useRouter, useParams } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import PricingModal from '@/components/PricingModal';
import { useChat } from '@ai-sdk/react';
import { toast } from 'sonner';

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const router = useRouter();
  const params = useParams();
  const [org, setOrg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('GOOD MORNING,');
  const [pinnedAgent, setPinnedAgent] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
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
    { key: 'ceo', role: 'CEO', icon: '🏦', title: 'Atlas (CEO/Ops)', name: 'Atlas' },
    { key: 'cmo', role: 'CMO', icon: '🎙️', title: 'Aria (Marketing)', name: 'Aria' },
    { key: 'cso', role: 'CSO', icon: '💰', title: 'Rex (Sales)', name: 'Rex' },
    { key: 'cco', role: 'CCO', icon: '🛟', title: 'Purity (Customer)', name: 'Purity' },
    { key: 'cio', role: 'CIO', icon: '🏛️', title: 'Roman (Intel)', name: 'Roman' },
    { key: 'cto', role: 'CTO', icon: '👻', title: 'Ghost (Tech)', name: 'Ghost' },
  ];

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [activeDirectives, setActiveDirectives] = useState<any | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const isResizing = useRef(false);

  // Tool Display Names
  const TOOL_DISPLAY_NAMES: Record<string, string> = {
  search_web: '🔍 Searching the web',
  scrape_webpage: '📄 Reading webpage',
  post_to_linkedin: '📤 Publishing to LinkedIn',
  post_to_twitter: '📤 Publishing to X/Twitter',
  send_email_campaign: '📧 Sending email campaign',
  create_hubspot_contact: '👤 Adding contact to CRM',
  create_hubspot_deal: '💼 Creating deal in CRM',
  find_leads: '🔎 Researching leads',
  send_slack_message: '💬 Sending Slack message',
  send_customer_email: '📧 Sending customer email',
  research_competitor: '🕵️ Researching competitor',
  save_to_notion: '📝 Saving to Notion',
  create_github_pr: '🔧 Opening GitHub PR',
  trigger_deployment: '🚀 Triggering deployment',
  security_scan: '🛡️ Running security scan',
  research_business_opportunity: '💡 Researching opportunity',
  analyze_company_health: '📊 Analyzing company health',
  };

  // 1. AI SDK useChat Hook
  const { 
    messages, 
    setMessages,
    input, 
    setInput, 
    handleSubmit, 
    isLoading, 
    reload, 
    stop 
  } = useChat({
    api: `/api/conversations/${params.id}/messages`,
    id: params.id as string,
    body: {
      model: typeof activeModel === 'string' ? activeModel : (activeModel as any).id,
      mode: chatMode.toLowerCase(),
    },
    onFinish: () => {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
    onError: (err) => {
      toast.error(`ORCA Error: ${err.message}`);
    }
  });

  // 2. Thinking Cycle Logic
  const getThinkingMessages = () => {
    if (chatMode === 'Planning') return ['Analyzing strategic objectives...', 'Architecting roadmap...', 'Strategizing growth vectors...', 'Refining organizational logic...'];
    if (pinnedAgent === 'CTO') return ['Scanning system architecture...', 'Generating technical blueprints...', 'Debugging protocol logic...', 'Validating code integrity...'];
    if (pinnedAgent === 'CEO') return ['Orchestrating executive team...', 'Reviewing organizational OKRs...', 'Synchronizing department data...', 'Finalizing CEO directives...'];
    if (pinnedAgent === 'CMO') return ['Analyzing market resonance...', 'Synthesizing creative assets...', 'Refining brand voice...', 'Mapping audience signals...'];
    if (pinnedAgent === 'CSO') return ['Prospecting lead data...', 'Analyzing revenue pipeline...', 'Optimizing sales sequences...', 'Calculating conversion metrics...'];
    return ['Processing intelligence...', 'Synthesizing response...', 'Refining department output...', 'Finalizing brief...'];
  };

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setThinkingStep(prev => (prev + 1) % getThinkingMessages().length);
      }, 1500);
    } else {
      setThinkingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, chatMode, pinnedAgent]);

  const startResizing = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 320 && newWidth < 900) {
      setSidebarWidth(newWidth);
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = '40px'; 
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 240)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
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
            let historyLoaded = false;
            try {
              const msgRes = await fetch(`/api/conversations/${params.id}/messages?t=${Date.now()}`);
              if (msgRes.ok) {
                const msgData = await msgRes.json();
                if (msgData.messages && msgData.messages.length > 0) {
                  // Transform Supabase messages to Vercel AI SDK format if needed
                  const transformed = msgData.messages.map((m: any) => ({
                    id: m.id,
                    role: m.sender_type === 'user' ? 'user' : 'assistant',
                    content: m.content,
                    metadata: m.metadata,
                    result_items: m.result_items,
                    createdAt: new Date(m.created_at)
                  }));
                  setMessages(transformed);
                  historyLoaded = true;
                  const lastAgentMsg = [...msgData.messages].reverse().find(m => m.sender_type === 'agent');
                  if (lastAgentMsg) {
                    const found = EXECUTIVE_PILLS.find(p => p.name === lastAgentMsg.metadata?.agent_name);
                    setPinnedAgent(found?.role || 'CEO');
                  }
                  setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
                }
              }
            } catch (err) {}

            const identityRes = await fetch(`/api/company?t=${Date.now()}`); 
            const identityData = await identityRes.json();
            const missionMissing = !identityData?.identity?.mission;
            setIsOnboarding(missionMissing);
            
            if (missionMissing && !historyLoaded) {
              setPinnedAgent('CEO');
              setMessages([{ id: 'onboarding-init', role: 'assistant', content: "I am Atlas, the CEO of your Autonomous OS. I've detected your company profile is incomplete. To begin operations, I need to understand your mission. Tell me: What does your company do and who are we building for?", agent: EXECUTIVE_PILLS[0] }]);
            }
          }
        }
      } catch (err) {}
    };
    initialize();
  }, [params.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Call AI SDK handleSubmit
    handleSubmit(e);
    
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const userName = user?.full_name?.split(' ')[0] || 'KALE';

  const Dropdown = ({ value, options, onChange, labelKey = 'name' }: { value: any, options: any[], onChange: (v: any) => void, labelKey?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const displayValue = typeof value === 'string' ? value : value[labelKey];
    return (
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 text-on-surface/40 hover:text-primary-container transition-colors font-label text-[10px] uppercase tracking-widest px-2 py-1">
          <span>{displayValue}</span>
          <span className="material-symbols-outlined text-[16px]">{isOpen ? 'expand_less' : 'expand_more'}</span>
        </button>
        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 min-w-[140px] bg-[#1a1c1a] border border-[#2d312d] rounded-lg shadow-xl py-2 z-50">
            {options.map(opt => (
              <button key={typeof opt === 'string' ? opt : opt.id} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${ (typeof opt === 'string' ? opt : opt.id) === (typeof value === 'string' ? value : value.id) ? 'text-primary-container' : 'text-on-surface/60' }`}>
                {typeof opt === 'string' ? opt : opt[labelKey]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="chat" />
      <main className="flex-1 ml-64 flex flex-row min-h-screen relative grid-bg overflow-hidden">
        <div 
          style={{ marginRight: activeDirectives ? `${sidebarWidth}px` : 0 }}
          className={`flex-1 flex flex-col items-center relative overflow-y-auto no-scrollbar w-full pt-8 pb-[20rem] transition-all duration-500 ${messages.length === 0 ? 'justify-center' : 'justify-start'}`}
        >
          <DashboardHeader />
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-16 pointer-events-none">
              <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase">{greeting} {userName}.</h1>
            </div>
          ) : (
            <div className="w-full max-w-3xl flex flex-col gap-6 px-4 min-h-full">
              {messages.map(msg => (
                <div key={msg.id} className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {(msg.sender_type === 'user' || msg.role === 'user') ? (
                    <div className="flex flex-col items-end mb-6">
                      <div className="flex items-center gap-2 mb-2 mr-2">
                        <span className="text-[10px] font-black font-headline text-on-surface/40 uppercase tracking-widest">{userName}</span>
                        <div className="w-6 h-6 rounded-lg bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center text-[10px] font-black text-primary-container shadow-inner">{userName[0]}</div>
                      </div>
                      <div className="max-w-[85%] px-5 py-3 bg-surface-container-high border border-outline-variant/10 rounded-2xl text-sm text-on-surface font-body leading-relaxed shadow-sm">{msg.content}</div>
                    </div>
                  ) : (
                    <div className="flex gap-4 mb-6">
                      <div className="flex-shrink-0 pt-1">
                        <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-lg shadow-inner grayscale">{msg.agent?.icon || '🏦'}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black font-headline text-primary-container uppercase tracking-[0.25em]">{msg.agent?.role || pinnedAgent || 'ATLAS'}</span>
                          <span className="w-1 h-1 rounded-full bg-on-surface/10" />
                          <span className="text-[9px] font-mono text-on-surface/40 uppercase tracking-widest">{msg.agent?.title || 'EXECUTIVE AGENT'}</span>
                        </div>

                        {/* Tool Invocations UI */}
                        {msg.toolInvocations?.map((toolInvocation: any) => {
                          const toolCallId = toolInvocation.toolCallId;
                          const toolName = toolInvocation.toolName;
                          const toolDisplayName = TOOL_DISPLAY_NAMES[toolName] || toolName;
                          
                          return (
                            <div key={toolCallId} className="flex items-center gap-3 px-4 py-2.5 bg-surface-container-low border-l-2 border-primary-container/40 rounded-lg mb-3 animate-in fade-in slide-in-from-left-2 duration-300">
                               <div className="flex-1">
                                 <div className="text-[10px] font-mono text-primary-container uppercase tracking-widest flex items-center gap-2">
                                   {toolDisplayName}
                                   {toolInvocation.state === 'result' ? (
                                     <span className="text-primary-container material-symbols-outlined text-xs">check_circle</span>
                                   ) : (
                                     <div className="flex gap-1 ml-1">
                                       <div className="w-1 h-1 rounded-full bg-primary-container animate-bounce [animation-delay:-0.3s]"/>
                                       <div className="w-1 h-1 rounded-full bg-primary-container animate-bounce [animation-delay:-0.15s]"/>
                                       <div className="w-1 h-1 rounded-full bg-primary-container animate-bounce"/>
                                     </div>
                                   )}
                                 </div>
                               </div>
                            </div>
                          );
                        })}

                        <div className="text-sm text-on-secondary-container font-body leading-relaxed whitespace-pre-wrap">
                          {msg.content.split('DIRECTIVE_DOCUMENT:')[0].split('RESULT:')[0].split('---')[0]
                            .replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
                            .replace(/###\s*(.*?)(?:\n|$)/g, '$1\n').replace(/##\s*(.*?)(?:\n|$)/g, '$1\n').replace(/#\s*(.*?)(?:\n|$)/g, '$1\n')
                            .trim()
                          }
                        </div>
                        {(msg.metadata?.directive_raw || (msg.result_items && msg.result_items.length > 0)) && (
                          <div className="mt-4 p-4 bg-primary-container/5 border border-primary-container/10 rounded-xl space-y-3">
                             <div className="flex items-center justify-between">
                               <div className="text-[9px] font-black text-primary-container uppercase tracking-widest">Executive Briefing Generated</div>
                               <button onClick={() => setActiveDirectives(msg)} className="flex items-center gap-1.5 px-2 py-1 bg-primary-container/20 border border-primary-container/30 rounded text-[8px] font-black text-primary-container uppercase tracking-widest hover:bg-primary-container/30 transition-all">
                                 <span className="material-symbols-outlined text-[14px]">description</span> View & Delegate
                               </button>
                             </div>
                             {msg.result_items && (
                               <div className="space-y-2">
                                 {msg.result_items.slice(0, 3).map((item: string, i: number) => (
                                   <div key={i} className="flex items-start gap-2 text-[11px] text-on-surface/70">
                                     <span className="mt-1 text-primary-container material-symbols-outlined text-xs">check_circle</span>
                                     {item}
                                   </div>
                                 ))}
                               </div>
                             )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant/10 opacity-30 hover:opacity-100 transition-opacity">
                          {chatMode !== 'Planning' && (
                            <><button onClick={() => toast.success('Approved')} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 text-on-surface hover:text-primary-container transition-colors"><span className="material-symbols-outlined text-xs">check</span> Approve</button>
                            <button onClick={() => toast.error('Rejected')} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 text-on-surface hover:text-error transition-colors"><span className="material-symbols-outlined text-xs">close</span> Reject</button></>
                          )}
                          <button 
                            onClick={() => {
                              const cleanContent = msg.content.split('DIRECTIVE_DOCUMENT:')[0].split('RESULT:')[0].split('---')[0].trim();
                              navigator.clipboard.writeText(cleanContent);
                              toast.success('Response copied');
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
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4 mb-6 w-full animate-in fade-in duration-500">
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-primary-container/10 flex items-center justify-center text-lg shadow-inner grayscale animate-pulse">
                      {pinnedAgent ? EXECUTIVE_PILLS.find(p => p.role === pinnedAgent)?.icon : '🏦'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[11px] font-black font-headline text-on-surface uppercase tracking-wider opacity-30">
                        {pinnedAgent || 'ATLAS'}
                      </span>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[9px] font-mono text-primary-container uppercase tracking-[0.2em] animate-pulse">
                          {getThinkingMessages()[thinkingStep]}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 w-3/4 bg-on-surface/5 rounded-full animate-pulse" />
                      <div className="h-1.5 w-1/2 bg-on-surface/5 rounded-full animate-pulse [animation-delay:200ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div className="h-[250px] flex-shrink-0" />
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {activeDirectives && (
          <div 
            style={{ width: `${sidebarWidth}px` }}
            className="bg-surface-container-low border-l border-outline-variant/10 flex flex-col h-screen animate-in slide-in-from-right duration-500 z-40 relative"
          >
            {/* Resize Handle */}
            <div 
              onMouseDown={startResizing}
              className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-primary-container/40 active:bg-primary-container transition-colors z-50 group"
            >
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-8 w-[2px] bg-outline-variant/20 group-hover:bg-primary-container/40 rounded-full" />
            </div>

            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container">
              <div><h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary-container">Executive Briefing</h2><p className="text-[9px] font-mono text-on-surface/40 uppercase mt-1">Ref: ORCA-{activeDirectives.id.substring(0,8)}</p></div>
              <button onClick={() => setActiveDirectives(null)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-on-surface/40 hover:text-on-surface"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#0f110f]">
              <div className="p-5 lg:p-8 bg-surface-container-highest border border-outline-variant/10 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-500">
                <div className="prose prose-sm prose-invert max-w-none text-on-surface/90 font-body leading-relaxed whitespace-pre-wrap break-words">
                  {activeDirectives.metadata?.directive_raw || 
                   activeDirectives.content.split('RESULT:')[0].split('DIRECTIVE_DOCUMENT:')[0].trim()}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pb-8">
                <button 
                  onClick={() => {
                    const content = activeDirectives.metadata?.directive_raw || activeDirectives.content;
                    const blob = new Blob([content], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ORCA_DIRECTIVE_${activeDirectives.id.substring(0,8)}.md`;
                    a.click();
                    toast.success('Document downloaded locally');
                  }}
                  className="w-full py-3 bg-surface-container-high border border-outline-variant/20 text-on-surface font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span> Download as .md
                </button>

                <button 
                  onClick={() => {
                    toast.success('Delegating to executive departments...');
                    // Logic to trigger background orchestration
                  }} 
                  className="w-full py-4 bg-primary-container text-on-primary rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_12px_40px_rgba(0,195,103,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">send_and_archive</span> Authorize & Execute
                </button>
              </div>
            </div>
          </div>
        )}

        <div 
          style={{ right: activeDirectives ? `${sidebarWidth}px` : 0 }}
          className={`fixed bottom-0 left-64 transition-all duration-500 p-8 pt-0 flex flex-col items-center pointer-events-none z-30`}
        >
          <div className="w-full max-w-3xl flex flex-col gap-3 pointer-events-auto">
            <div className="flex justify-center gap-2 mb-1">
              {EXECUTIVE_PILLS.map(exec => (
                <button key={exec.key} onClick={() => setPinnedAgent(pinnedAgent === exec.role ? null : exec.role)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all duration-300 ${pinnedAgent === exec.role ? 'bg-primary-container/20 border border-primary-container text-primary-container shadow-[0_0_20px_rgba(0,195,103,0.2)] scale-105' : 'bg-surface-container-high border border-outline-variant/20 text-on-surface/30 hover:border-primary-container/40 hover:text-on-surface'}`}
                >
                  <span className={`text-sm transition-all duration-500 ${pinnedAgent === exec.role ? 'grayscale-0 scale-110' : 'grayscale group-hover:grayscale-0'}`}>{exec.icon}</span> {exec.role}
                </button>
              ))}
            </div>
            <div className="bg-[#121412] border border-[#262a26] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
              <div className="px-6 py-4 flex items-start gap-4">
                <button className="mt-1.5 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-on-surface/20 hover:text-on-surface/60 transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface/20 text-[15px] font-body resize-none min-h-[44px] max-h-[240px] py-2 overflow-y-auto"
                  placeholder={pinnedAgent ? `Brief your ${pinnedAgent}...` : "Ask anything..."} rows={1} disabled={isLoading}
                />
                <button className="mt-1.5 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-on-surface/20 hover:text-on-surface/60 transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d0f0d]/30 border-t border-[#262a26]/40 rounded-b-2xl">
                <div className="flex items-center gap-2"><Dropdown value={chatMode} options={MODES} onChange={setChatMode} /><div className="h-1 w-1 rounded-full bg-on-surface/10 mx-1" /><Dropdown value={activeModel} options={MODELS} onChange={setActiveModel} /></div>
                <button onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading} className={`h-9 w-9 flex items-center justify-center rounded-full transition-all ${input.trim() && !isLoading ? 'bg-primary-container text-on-primary shadow-[0_0_20px_rgba(0,195,103,0.3)] hover:scale-105 active:scale-95' : 'bg-[#212421] text-on-surface/20'}`}><span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span></button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showPricingModal && <PricingModal isOpen={showPricingModal} onClose={() => !isLocked && setShowPricingModal(false)} isLocked={isLocked} currentPlan={org?.plan} />}
    </div>
  );
}
