'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import PricingModal from '@/components/PricingModal';
import { useChat } from '@ai-sdk/react';
import { toast } from 'sonner';
import LongContentBanner, { countWords } from '@/components/LongContentBanner';
import {
  DIRECTIVE_RUN_INSTRUCTION,
  isDirectivePaste,
  LONG_PASTE_CHAR_THRESHOLD,
} from '@/lib/chat/pasteConfig';
import { parseExecutiveFromPrompt, AGENT_MAPPING } from '@/lib/chat/agentMapping';

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
  const searchParams = useSearchParams();
  const isDemo = searchParams?.get('demo') === 'true';
  const demoDomain = searchParams?.get('domain') || 'SaaS';

  const [org, setOrg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('GOOD MORNING,');
  const [pinnedAgent, setPinnedAgent] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Demo mode streaming state
  const [demoMessages, setDemoMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; agent?: string }>>([]);
  const [demoStreaming, setDemoStreaming] = useState(false);

  useEffect(() => {
    if (isDemo && !demoStreaming && demoMessages.length === 0) {
      setDemoStreaming(true);
      const startDemoStream = async () => {
        setDemoMessages([{ id: 'demo-1', role: 'user', content: `Launch a 10-minute marketing and operational sprint for ${demoDomain}.` }]);
        try {
          const res = await fetch('/api/guest/demo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: demoDomain }),
          });

          if (!res.body) return;
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let text = '';

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunk = decoder.decode(value, { stream: !done });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('0:')) {
                try {
                  text += JSON.parse(line.substring(2));
                } catch {
                  text += line.substring(2).replace(/^"/, '').replace(/"$/, '');
                }
              }
            }
            
            // Parse agent logs
            const parts = text.split(/\[AGENT:\s*([^\]]+)\]/i);
            const msgs: Array<{ id: string; role: 'user' | 'assistant'; content: string; agent?: string }> = [
              { id: 'demo-1', role: 'user', content: `Launch a 10-minute marketing and operational sprint for ${demoDomain}.` }
            ];

            for (let i = 1; i < parts.length; i += 2) {
              const agent = parts[i].trim();
              const content = (parts[i + 1] || '').trim();
              if (content) {
                msgs.push({
                  id: `demo-${i}`,
                  role: 'assistant',
                  agent,
                  content
                });
              }
            }
            setDemoMessages(msgs);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setDemoStreaming(false);
        }
      };

      startDemoStream();
    }
  }, [isDemo]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Chat Modes & Models
  const [chatMode, setChatMode] = useState('Automate');
  const [activeModel, setActiveModel] = useState({ name: 'ORCA', id: 'orca-intel' });

  const MODES = ['Planning', 'Automate'];
  const MODELS = [
    { name: 'ORCA', id: 'orca-intel' },
    { name: 'Claude', id: 'anthropic/claude-3.5-sonnet' },
    { name: 'GPT', id: 'openai/gpt-4o' },
    { name: 'Llama', id: 'meta-llama/llama-3.1-405b-instruct' },
    { name: 'Gemini', id: 'google/gemini-1.5-pro' },
    { name: 'DeepSeek', id: 'deepseek/deepseek-chat' }
  ];

  const EXECUTIVE_PILLS = [
    { key: 'ceo', role: 'CEO', icon: '🏦', title: 'Atlas (CEO/Ops)', name: 'Atlas' },
    { key: 'cmo', role: 'CMO', icon: '🎙️', title: 'Aria (Marketing)', name: 'Aria' },
    { key: 'cso', role: 'CSO', icon: '💰', title: 'Rex (Sales)', name: 'Rex' },
    { key: 'cco', role: 'CCO', icon: '🛟', title: 'Purity (Customer)', name: 'Purity' },
    { key: 'cio', role: 'CIO', icon: '🏛️', title: 'Roman (Intel)', name: 'Roman' },
    { key: 'cto', role: 'CTO', icon: '👻', title: 'Ghost (Tech)', name: 'Ghost' },
  ];

  const [thinkingStep, setThinkingStep] = useState(0);
  const [activeDirectives, setActiveDirectives] = useState<any | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const isResizing = useRef(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [pastedDocContent, setPastedDocContent] = useState<string | null>(null);
  const pastedDocRef = useRef<string | null>(null);

  const setPastedDocument = (value: string | null) => {
    pastedDocRef.current = value;
    setPastedDocContent(value);
  };

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

  // Temporary ID for root chat - will redirect on first message
  const [tempId, setTempId] = useState<string | null>(null);

  // 1. AI SDK useChat Hook
  const { 
    messages, 
    setMessages,
    input, 
    setInput, 
    handleSubmit, 
    isLoading, 
  } = useChat({
    api: tempId ? `/api/conversations/${tempId}/messages` : '/api/conversations/new/messages',
    id: tempId || 'new-chat',
    body: {
      model: typeof activeModel === 'string' ? activeModel : (activeModel as any).id,
      mode: chatMode.toLowerCase(),
    },
    onFinish: (message) => {
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

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Voice input not supported'); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      inputRef.current?.focus();
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); toast.error('Voice input failed'); };
    recognition.start();
    setIsListening(true);
    toast.success('Listening... speak now');
  };

  function handleInputChange(value: string) {
    setInput(value);
    adjustTextareaHeight();
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.length > LONG_PASTE_CHAR_THRESHOLD) {
      e.preventDefault();
      setPastedDocument(pasted);
      setInput(isDirectivePaste(pasted) ? DIRECTIVE_RUN_INSTRUCTION : '');
      adjustTextareaHeight();
      toast.success('Long content attached — click "Run directive" or type your instruction.');
    }
  };

  const handleLongContentChip = (instruction: string) => {
    inputRef.current?.focus();
    if (instruction) {
      setInput(instruction);
      adjustTextareaHeight();
    } else {
      setInput('');
    }
  };

  function adjustTextareaHeight() {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.style.height = '0px'; 
        inputRef.current.style.height = `${Math.min(Math.max(inputRef.current.scrollHeight, 44), 240)}px`;
      }
    }, 0);
  }

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
        }
      } catch (err) {}
    };
    initialize();
  }, []);

  const isChatLoading = isLoading && messages && messages.length > 0;

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isDemo) {
      setShowRegisterModal(true);
      return;
    }
    if (isChatLoading) return;

    let messageText = (input || '').trim();
    if (!messageText && pastedDocRef.current) {
      if (isDirectivePaste(pastedDocRef.current)) {
        messageText = DIRECTIVE_RUN_INSTRUCTION;
      } else {
        toast.error('Choose a quick action or type an instruction for your document.');
        return;
      }
    }
    if (!messageText) return;

    if (!tempId) {
      try {
        const targetRole = parseExecutiveFromPrompt(messageText);
        const agentDetails = AGENT_MAPPING[targetRole] || AGENT_MAPPING.CEO;

        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_name: agentDetails.name,
            department_key: agentDetails.department_key
          })
        });
        const data = await res.json();
        if (data.conversation?.id) {
          if (pastedDocRef.current) {
            sessionStorage.setItem('orca_pasted_doc', pastedDocRef.current);
          }
          setTempId(data.conversation.id);
          router.push(`/dashboard/chat/${data.conversation.id}?initialMessage=${encodeURIComponent(messageText)}`);
          return;
        }
      } catch (err) {
        toast.error('Failed to start conversation');
        return;
      }
    }

    handleSubmit(e);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const userName = user?.full_name?.split(' ')[0] || '';

  const Dropdown = ({ value, options, onChange, labelKey = 'name' }: { value: any, options: any[], onChange: (v: any) => void, labelKey?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const displayValue = typeof value === 'string' ? value : value[labelKey];

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-on-surface/40 hover:text-primary-container transition-colors font-label text-[10px] uppercase tracking-widest px-2 py-1"
        >
          <span>{displayValue}</span>
          <span className="material-symbols-outlined text-[16px]">{isOpen ? 'expand_less' : 'expand_more'}</span>
        </button>
        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 min-w-[140px] bg-[#1a1c1a] border border-[#2d312d] rounded-lg shadow-xl py-2 z-50">
            {options.map(opt => (
              <button
                type="button"
                key={typeof opt === 'string' ? opt : opt.id}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${(typeof opt === 'string' ? opt : opt.id) === (typeof value === 'string' ? value : value.id) ? 'text-primary-container' : 'text-on-surface/60'}`}
              >
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
          className={`flex-1 flex flex-col items-center relative overflow-y-auto no-scrollbar w-full pt-8 pb-[20rem] transition-all duration-500 justify-center`}
        >
          <DashboardHeader floating={true} activeDirectives={activeDirectives} />
          {isDemo && demoMessages.length > 0 ? (
            <div className="w-full max-w-4xl px-4 py-8 space-y-6 animate-in fade-in duration-500">
              {demoMessages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1.5 px-2">
                      <span className="text-xs">🤖</span>
                      <span className="text-[10px] font-bold text-green uppercase tracking-wider">{m.agent || 'ORCA Executive'}</span>
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl max-w-[85%] text-[13px] leading-relaxed font-dm-mono ${
                    m.role === 'user' 
                      ? 'bg-white/10 text-white rounded-br-none border border-white/10' 
                      : 'bg-surface-container-low text-on-surface border border-outline-variant/10 rounded-bl-none shadow-md'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {demoStreaming && (
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 w-fit animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-green animate-ping" />
                  <span className="text-[11px] font-mono text-on-surface/60 uppercase tracking-wider">Executive Agents Collaborating...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center -mt-16 pointer-events-none">
              <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase animate-in fade-in zoom-in duration-700">{greeting} {userName}.</h1>
              <p className="text-[10px] font-mono text-on-surface/20 uppercase tracking-[0.4em] mt-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">Type an instruction or mention an executive (@cmo, /cto, etc.) to begin operation</p>
            </div>
          )}
        </div>

        <div 
          style={{ right: activeDirectives ? `${sidebarWidth}px` : 0 }}
          className={`fixed bottom-0 left-64 transition-all duration-500 p-8 pt-0 flex flex-col items-center pointer-events-none z-30`}
        >
          <div className="w-full max-w-3xl flex flex-col gap-3 pointer-events-auto">
            {pastedDocContent && (
              <LongContentBanner
                wordCount={countWords(pastedDocContent)}
                onDismiss={() => setPastedDocument(null)}
                onChipClick={handleLongContentChip}
              />
            )}
            <div className="bg-[#121412] border border-[#262a26] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
              <div className="px-6 py-4 flex items-start gap-4">
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt,.md,.csv" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setInput(prev => prev ? `${prev} [Attached: ${file.name}]` : `[Attached: ${file.name}]`); toast.success(`Attached: ${file.name}`); setShowAddMenu(false); }
                }} />
                <div className="relative mt-1.5">
                  <button onClick={() => setShowAddMenu(v => !v)} className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${showAddMenu ? 'bg-primary-container/20 text-primary-container' : 'hover:bg-white/5 text-on-surface/20 hover:text-on-surface/60'}`}>
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${showAddMenu ? 'rotate-45' : ''}`}>add</span>
                  </button>
                  {showAddMenu && (
                    <div className="absolute bottom-full mb-2 left-0 min-w-[180px] bg-[#1a1c1a] border border-[#2d312d] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface/60 hover:text-on-surface hover:bg-white/5 transition-colors"><span className="material-symbols-outlined text-[16px]">image</span> Attach Image</button>
                      <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface/60 hover:text-on-surface hover:bg-white/5 transition-colors"><span className="material-symbols-outlined text-[16px]">description</span> Attach Document</button>
                      <button onClick={() => { setShowAddMenu(false); toast('Web context coming soon'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface/60 hover:text-on-surface hover:bg-white/5 transition-colors"><span className="material-symbols-outlined text-[16px]">language</span> Add Web Context</button>
                    </div>
                  )}
                </div>
                <textarea ref={inputRef} value={input} onChange={(e) => handleInputChange(e.target.value)} onPaste={handlePaste} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = '0px';
                    target.style.height = `${Math.min(Math.max(target.scrollHeight, 44), 240)}px`;
                    if (input !== target.value) {
                      handleInputChange(target.value);
                    }
                  }}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface/20 text-[15px] font-body resize-none min-h-[44px] max-h-[240px] py-2 overflow-hidden"
                  placeholder={pinnedAgent ? `Brief your ${pinnedAgent}...` : "Ask anything..."} disabled={isChatLoading}
                />
                <button onClick={handleVoiceInput} className={`mt-1.5 h-8 w-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/5 text-on-surface/20 hover:text-on-surface/60'}`}>
                  <span className="material-symbols-outlined text-[20px]">{isListening ? 'mic_off' : 'mic'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d0f0d]/30 border-t border-[#262a26]/40 rounded-b-2xl">
                <div className="flex items-center gap-2"><Dropdown value={chatMode} options={MODES} onChange={setChatMode} /><div className="h-1 w-1 rounded-full bg-on-surface/10 mx-1" /><Dropdown value={activeModel} options={MODELS} onChange={setActiveModel} /></div>
                <button onClick={() => handleSendMessage()} disabled={(!(input || '').trim() && !pastedDocContent) || isChatLoading} className={`h-9 w-9 flex items-center justify-center rounded-full transition-all ${((input || '').trim() || pastedDocContent) && !isChatLoading ? 'bg-primary-container text-on-primary shadow-[0_0_20px_rgba(0,195,103,0.3)] hover:scale-105 active:scale-95' : 'bg-[#212421] text-on-surface/20'}`}><span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span></button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showPricingModal && <PricingModal isOpen={showPricingModal} onClose={() => !isLocked && setShowPricingModal(false)} isLocked={isLocked} currentPlan={org?.plan} />}
      
      {showRegisterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121412] border border-[#262a26] rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-green/10 border border-green/20 text-green flex items-center justify-center text-2xl mx-auto">
              🚀
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-syne text-white uppercase tracking-tight">Deploy Your Autonomous Board</h3>
              <p className="text-xs text-white/60 font-dm-mono leading-relaxed">
                Sign up now to unlock full access to your C-Suite AI executive team and run unlimited autonomous tasks.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => router.push(`/auth/signup?domain=${encodeURIComponent(demoDomain)}`)}
                className="w-full btn-primary py-3.5 rounded-xl font-syne font-bold text-xs uppercase tracking-widest shadow-lg"
              >
                Create Account & Run Plan →
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-full py-2.5 text-[10px] font-mono text-white/40 uppercase tracking-widest hover:text-white transition-colors"
              >
                Continue Watching Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
