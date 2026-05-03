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

  const [thinkingStep, setThinkingStep] = useState(0);

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
  const [activeDirectives, setActiveDirectives] = useState<any | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const isResizing = useRef(false);

  // Tool Display Names
  const TOOL_DISPLAY_NAMES: Record<string, string> = {
    web_search: '🔍 Searching the web',
    scrape_page: '📄 Reading webpage',
    linkedin_post: '📤 Posting to LinkedIn',
    twitter_post: '📤 Posting to X/Twitter',
    hubspot_create_deal: '💼 Creating deal in CRM',
    github_create_pr: '🔧 Opening GitHub PR',
  };

  // Temporary ID for root chat - will redirect on first message
  const [tempId, setTempId] = useState<string | null>(null);

  // AI SDK useChat Hook
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
      // If we are on root and just finished the first message, we should have a real ID by now
      // This logic depends on the backend returning a conversation_id in the stream or metadata
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
    onError: (err) => {
      toast.error(`ORCA Error: ${err.message}`);
    }
  });

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
        }
      } catch (err) {}
    };
    initialize();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    // If it's the very first message on the root page, create a conversation first
    if (!tempId) {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_name: pinnedAgent || 'Atlas',
            department_key: pinnedAgent?.toLowerCase() || 'ceo'
          })
        });
        const data = await res.json();
        if (data.conversation?.id) {
          setTempId(data.conversation.id);
          // We can't use handleSubmit immediately because the API endpoint in useChat is fixed at init
          // So we redirect to the new conversation page instead to keep it simple and stable
          router.push(`/dashboard/chat/${data.conversation.id}?initialMessage=${encodeURIComponent(input)}`);
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
          className={`flex-1 flex flex-col items-center relative overflow-y-auto no-scrollbar w-full pt-8 pb-[20rem] transition-all duration-500 justify-center`}
        >
          <DashboardHeader />
          <div className="flex-1 flex flex-col items-center justify-center -mt-16 pointer-events-none">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase animate-in fade-in zoom-in duration-700">{greeting} {userName}.</h1>
            <p className="text-[10px] font-mono text-on-surface/20 uppercase tracking-[0.4em] mt-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">Choose an executive to begin operation</p>
          </div>
        </div>

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
