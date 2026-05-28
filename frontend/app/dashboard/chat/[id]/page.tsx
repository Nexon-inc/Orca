'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
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

  const EXECUTIVE_DESCRIPTIONS: Record<string, string> = {
    ceo: 'Oversees organizational roadmap, delegates tasks, and synthesizes department outcomes.',
    cmo: 'Refines brand positioning, creates marketing campaigns, and analyzes target audience signals.',
    cso: 'Manages sales pipelines, qualifies leads, and optimizes outreach sequences for maximum conversions.',
    cco: 'Tracks client satisfaction metrics, drafts customer playbooks, and monitors retention strategies.',
    cio: 'Gathers competitive intelligence, parses market feeds, and compiles research briefings.',
    cto: 'Scopes technical architectures, prototypes codebases, and conducts automated security audits.',
  };

  const getExecutiveStatus = (exec: any) => {
    if (isLoading && pinnedAgent === exec.role) return 'Thinking';
    const isWorking = activeCoordinations.some(c => c.to_agent?.name === exec.name);
    if (isWorking) return 'Executing';
    return 'Idle';
  };

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [activeDirectives, setActiveDirectives] = useState<any | null>(null);
  const [activeCoordinations, setActiveCoordinations] = useState<any[]>([]);
  const [briefingTab, setBriefingTab] = useState<'preview' | 'code' | 'tasks'>('preview');
  const [hoveredExec, setHoveredExec] = useState<string | null>(null);
  const [autoHighlight, setAutoHighlight] = useState(false);
  const [manualHighlights, setManualHighlights] = useState<{ text: string; color: 'green' | 'yellow' }[]>([]);
  const [isExportingToDrive, setIsExportingToDrive] = useState(false);
  const [driveDocUrl, setDriveDocUrl] = useState<string | null>(null);
  const [activeHighlightColor, setActiveHighlightColor] = useState<'green' | 'yellow'>('green');
  const [sidebarWidth, setSidebarWidth] = useState(600);
  const isResizing = useRef(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const historyInitialized = useRef(false);
  const isFirstMessage = useRef(true);
  const initialMessageSent = useRef(false);

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

  // Guard: params.id must be resolved before useChat initializes
  const conversationId = params?.id as string | undefined

  const {
    messages,
    setMessages,
    input,
    setInput,
    append,
    isLoading,
    data,
  } = useChat({
    api: conversationId ? `/api/conversations/${conversationId}/messages` : '/api/conversations/none/messages',
    id: conversationId || 'init',
    body: {
      model: typeof activeModel === 'string' ? activeModel : (activeModel as any).id,
      mode: chatMode.toLowerCase(),
    },
    onResponse: (response: any) => {
      if (!response.ok) {
        response.text().then((text: any) => {
          console.error('[ORCA_RAW_ERROR]', text);
          toast.error(`Server Error: ${text.slice(0, 150)}`);
        });
      }
    },
    onFinish: (message: any) => {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      if (isFirstMessage.current && conversationId) {
        isFirstMessage.current = false;
        window.dispatchEvent(new Event('conversation_created')); // refresh sidebar
      }
    },
    onError: (err: any) => {
      toast.error(`ORCA Error: ${err.message}`);
    }
  });

  // Live Metadata Sync (Directives & Results) from Stream Data
  useEffect(() => {
    if (data && data.length > 0) {
      const lastData = data[data.length - 1] as any;
      if (lastData.type === 'metadata') {
        setMessages((prev: any) => {
          const newMessages = [...prev] as any[];
          for (let i = newMessages.length - 1; i >= 0; i--) {
            if (newMessages[i].role === 'assistant') {
              // CLEAN TAGS FROM CONTENT: Replace [HANDOFF] and [ACTION] with nice UI markers
              const rawContent = newMessages[i].content;
              const cleanContent = rawContent
                .replace(/\[ACTION:\s*tool=["']([^"']+)["']\s*params=({[\s\S]+?})\]/gi, (match: any, tool: any) => `\n> ✓ **Action executed:** ${tool.replace(/_/g, ' ')}\n`)
                .replace(/\[HANDOFF:\s*to=["']([^"']+)["']\s*reason=["']([^"']+)["']\s*context=["']([^"']+)["']\]/gi, (match: any, toAgent: any, reason: any) => `\n> 🔄 **Coordinating with ${toAgent}:** ${reason}\n`);
              
              newMessages[i].content = cleanContent;
              
              const updatedMetadata = {
                ...newMessages[i].metadata,
                directive_raw: lastData.directive_raw,
                result_items: lastData.result_items,
                agent_name: lastData.agent_name
              };
              newMessages[i].metadata = updatedMetadata;
              
              if (i === newMessages.length - 1) {
                setActiveDirectives(newMessages[i]);
              }
              break;
            }
          }
          return newMessages;
        });
      }
    }
  }, [data, setMessages]);

  // Fetch active coordinations periodically
  useEffect(() => {
    if (!org?.id) return;
    const fetchCoordinations = async () => {
      try {
        const res = await fetch(`/api/org/${org.id}/coordinations`);
        const data = await res.json();
        if (data.coordinations) setActiveCoordinations(data.coordinations);
      } catch (err) {}
    };
    fetchCoordinations();
    const interval = setInterval(fetchCoordinations, 10000);
    return () => clearInterval(interval);
  }, [org?.id]);

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

  const getThinkingMessages = () => {
    if (pinnedAgent === 'CTO') return ['Scanning system architecture...', 'Generating technical blueprints...', 'Debugging protocol logic...', 'Validating code integrity...'];
    if (pinnedAgent === 'CEO') return ['Orchestrating executive team...', 'Reviewing organizational OKRs...', 'Aligning department priorities...', 'Finalizing CEO directives...'];
    if (pinnedAgent === 'CMO') return ['Analyzing market resonance...', 'Synthesizing creative assets...', 'Refining brand voice...', 'Mapping audience signals...'];
    if (pinnedAgent === 'CSO') return ['Prospecting lead data...', 'Analyzing revenue pipeline...', 'Optimizing sales sequences...', 'Calculating conversion metrics...'];
    if (pinnedAgent === 'CCO') return ['Reviewing customer health scores...', 'Drafting support playbook...', 'Analyzing NPS signals...', 'Building retention strategy...'];
    if (pinnedAgent === 'CIO') return ['Scanning intelligence feeds...', 'Mapping competitor signals...', 'Synthesizing market data...', 'Compiling research brief...'];
    if (chatMode === 'Planning') return ['Analyzing strategic objectives...', 'Architecting roadmap...', 'Strategizing growth vectors...', 'Refining organizational logic...'];
    if (chatMode === 'Automate') return ['Queuing autonomous tasks...', 'Triggering agent workflows...', 'Coordinating departments...', 'Executing directives...'];
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

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev: any) => prev ? `${prev} ${transcript}` : transcript);
      inputRef.current?.focus();
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); toast.error('Voice input failed'); };
    recognition.start();
    setIsListening(true);
    toast.success('Listening... speak now');
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
      if (historyInitialized.current) return;
      historyInitialized.current = true;
      try {
        const userRes = await fetch('/api/user');
        const userData = await userRes.json();
        if (userData?.user) {
          setUser(userData.user);
          if (conversationId) {
            let historyLoaded = false;
            try {
              const msgRes = await fetch(`/api/conversations/${conversationId}/messages`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
              });
              if (msgRes.ok) {
                const msgData = await msgRes.json();
                if (msgData.messages && msgData.messages.length > 0) {
                  isFirstMessage.current = false;
                  const transformed = msgData.messages.map((m: any) => ({
                    id: m.id,
                    role: (m.sender_type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                    content: String(m.content || ''),
                    createdAt: new Date(m.created_at),
                    metadata: m.metadata || {},
                    result_items: m.result_items || [],
                    // Map tool results back to toolInvocations for rendering
                    toolInvocations: m.metadata?.tool_results ? m.metadata.tool_results.map((tr: any) => ({
                      toolCallId: tr.toolCallId,
                      toolName: tr.toolName,
                      args: tr.args,
                      state: 'result',
                      result: tr.result
                    })) : []
                  }));
                  setMessages(transformed);
                  historyLoaded = true;
                  const lastAgentMsg = [...msgData.messages].reverse().find((m: any) => m.sender_type === 'agent');
                  if (lastAgentMsg?.metadata?.agent_name) {
                    const found = EXECUTIVE_PILLS.find(p => p.name === lastAgentMsg.metadata.agent_name);
                    if (found) setPinnedAgent(found.role);
                  }
                  setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
                }
              }
            } catch (err) { console.error('History load error:', err); }

            if (!historyLoaded) {
              try {
                const identityRes = await fetch(`/api/company`, { cache: 'no-store' });
                const identityData = await identityRes.json();
                setIsOnboarding(!identityData?.identity?.mission);
              } catch (err) { }
            }
          }
        }
      } catch (err) { }
    };
    initialize();
  }, [conversationId]);

  // Handle auto-submitting initialMessage from URL
  useEffect(() => {
    const initMsg = searchParams?.get('initialMessage');
    if (initMsg && historyInitialized.current && !initialMessageSent.current) {
      initialMessageSent.current = true;

      // Clear from URL without triggering Next.js route reload
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/dashboard/chat/${conversationId}`);
      }

      // Auto-submit after a tiny delay to ensure useChat is ready
      setTimeout(() => {
        if (isFirstMessage.current) {
          const titleSlug = initMsg.trim().split(/\s+/).slice(0, 6).join(' ');
          fetch(`/api/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleSlug })
          }).catch(() => { });
        }
        append({ role: 'user', content: initMsg });
      }, 500);
    }
  }, [searchParams, conversationId, append, router]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!(input || '').trim() || isLoading || !conversationId) return;

    const currentInput = input || '';
    setInput('');

    if (isFirstMessage.current) {
      const titleSlug = (currentInput || '').trim().split(/\s+/).slice(0, 6).join(' ');
      fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleSlug })
      }).catch(() => { });
    }

    append({ role: 'user', content: currentInput });
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const userName = user?.full_name?.split(' ')[0] || '';

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
              <button key={typeof opt === 'string' ? opt : opt.id} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${(typeof opt === 'string' ? opt : opt.id) === (typeof value === 'string' ? value : value.id) ? 'text-primary-container' : 'text-on-surface/60'}`}>
                {typeof opt === 'string' ? opt : opt[labelKey]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  const applyManualHighlight = () => {
    if (typeof window !== 'undefined') {
      const selectedText = window.getSelection()?.toString().trim();
      if (selectedText) {
        if (!manualHighlights.some(h => h.text.toLowerCase() === selectedText.toLowerCase())) {
          setManualHighlights(prev => [...prev, { text: selectedText, color: activeHighlightColor }]);
          toast.success(`Highlighted selection in ${activeHighlightColor}`);
        }
      } else {
        toast.error('Please highlight some text in the document preview first.');
      }
    }
  };

  const renderBriefingMarkdown = (rawContent: string) => {
    if (!rawContent) return null;

    const cleanContent = rawContent
      .split('RESULT:')[0]
      .split('DIRECTIVE_DOCUMENT:')[0]
      .trim();

    const lines = cleanContent.split('\n');
    const blocks: { type: string; content: string; lang?: string }[] = [];
    let currentCodeBlock: { lang: string; lines: string[] } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        if (currentCodeBlock) {
          blocks.push({
            type: 'code',
            content: currentCodeBlock.lines.join('\n'),
            lang: currentCodeBlock.lang
          });
          currentCodeBlock = null;
        } else {
          const lang = trimmed.slice(3).trim() || 'typescript';
          currentCodeBlock = { lang, lines: [] };
        }
        continue;
      }

      if (currentCodeBlock !== null) {
        currentCodeBlock.lines.push(line);
        continue;
      }

      if (trimmed.startsWith('# ')) {
        blocks.push({ type: 'h1', content: trimmed.slice(2) });
      } else if (trimmed.startsWith('## ')) {
        blocks.push({ type: 'h2', content: trimmed.slice(3) });
      } else if (trimmed.startsWith('### ')) {
        blocks.push({ type: 'h3', content: trimmed.slice(4) });
      } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('* [ ] ') || trimmed.startsWith('* [x] ')) {
        blocks.push({ type: 'checklist', content: trimmed });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        blocks.push({ type: 'list', content: trimmed.slice(2) });
      } else if (trimmed === '---') {
        blocks.push({ type: 'hr', content: '' });
      } else if (trimmed === '') {
        blocks.push({ type: 'empty', content: '' });
      } else {
        blocks.push({ type: 'p', content: line });
      }
    }

    if (currentCodeBlock !== null) {
      blocks.push({
        type: 'code',
        content: currentCodeBlock.lines.join('\n'),
        lang: currentCodeBlock.lang
      });
    }

    const applyHighlights = (text: string): React.ReactNode[] | string => {
      if (!text) return [];

      let segments: { text: string; highlight?: 'green' | 'yellow' }[] = [{ text }];

      if (autoHighlight) {
        const autoGreenPatterns = [
          /\b(100%|\+\d+%\.?\d*|\d+x|shaved \d+%|validated|milestones? completed|reference customers?|TAM|SAM|SOM|LTV|ROI|growth|conversions?|wins?)\b/gi,
          /\b(apexlogistics|novacreative|zetaretail)\b/gi
        ];
        const autoYellowPatterns = [
          /\b(action items?|warning|caution|risk|blockers?|critical|danger|strictly|must|should|action needed|attention required)\b/gi,
          /(@Ghost|@Aria|@Rex|@Purity|@Roman|@Atlas)/gi
        ];

        autoGreenPatterns.forEach(pattern => {
          const newSegments: typeof segments = [];
          segments.forEach(seg => {
            if (seg.highlight) {
              newSegments.push(seg);
              return;
            }
            const parts = seg.text.split(pattern);
            const matches = seg.text.match(pattern) || [];
            let matchIdx = 0;
            parts.forEach((part, i) => {
              newSegments.push({ text: part });
              if (i < parts.length - 1) {
                newSegments.push({ text: matches[matchIdx++], highlight: 'green' });
              }
            });
          });
          segments = newSegments.filter(s => s.text);
        });

        autoYellowPatterns.forEach(pattern => {
          const newSegments: typeof segments = [];
          segments.forEach(seg => {
            if (seg.highlight) {
              newSegments.push(seg);
              return;
            }
            const parts = seg.text.split(pattern);
            const matches = seg.text.match(pattern) || [];
            let matchIdx = 0;
            parts.forEach((part, i) => {
              newSegments.push({ text: part });
              if (i < parts.length - 1) {
                newSegments.push({ text: matches[matchIdx++], highlight: 'yellow' });
              }
            });
          });
          segments = newSegments.filter(s => s.text);
        });
      }

      manualHighlights.forEach(hl => {
        const newSegments: typeof segments = [];
        segments.forEach(seg => {
          if (seg.highlight) {
            newSegments.push(seg);
            return;
          }
          if (seg.text.toLowerCase().includes(hl.text.toLowerCase())) {
            const pattern = new RegExp(`(${hl.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
            const parts = seg.text.split(pattern);
            const matches = seg.text.match(pattern) || [];
            let matchIdx = 0;
            parts.forEach((part, i) => {
              newSegments.push({ text: part });
              if (i < parts.length - 1) {
                newSegments.push({ text: matches[matchIdx++], highlight: hl.color });
              }
            });
          } else {
            newSegments.push(seg);
          }
        });
        segments = newSegments.filter(s => s.text);
      });

      return segments.map((seg, idx) => {
        if (seg.highlight === 'green') {
          return (
            <span
              key={idx}
              className="bg-emerald-500/20 text-emerald-400 px-1 rounded-sm border border-emerald-400/20 font-semibold inline-block"
            >
              {seg.text}
            </span>
          );
        }
        if (seg.highlight === 'yellow') {
          return (
            <span
              key={idx}
              className="bg-amber-500/20 text-amber-300 px-1 rounded-sm border border-amber-400/20 font-semibold inline-block"
            >
              {seg.text}
            </span>
          );
        }
        return seg.text;
      });
    };

    return blocks.map((block, blockIdx) => {
      if (block.type === 'h1') {
        return (
          <h1 key={blockIdx} className="text-lg font-black text-white font-headline border-b border-outline-variant/10 pb-2 mb-4 mt-6 uppercase tracking-[0.1em]">
            {applyHighlights(block.content)}
          </h1>
        );
      }

      if (block.type === 'h2') {
        return (
          <h2 key={blockIdx} className="text-sm font-extrabold text-primary-container font-headline mb-3 mt-5 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3 bg-primary-container/60 rounded-sm" />
            {applyHighlights(block.content)}
          </h2>
        );
      }

      if (block.type === 'h3') {
        return (
          <h3 key={blockIdx} className="text-xs font-black text-on-surface/80 font-headline uppercase tracking-widest mb-2 mt-4">
            {applyHighlights(block.content)}
          </h3>
        );
      }

      if (block.type === 'checklist') {
        const isChecked = block.content.includes('[x]');
        const text = block.content.slice(6);
        return (
          <div key={blockIdx} className="flex items-start gap-3 my-2 text-xs text-on-surface/80 pl-1">
            <span className={`material-symbols-outlined text-[15px] mt-0.5 select-none ${isChecked ? 'text-primary-container' : 'text-on-surface/20'}`}>
              {isChecked ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span className={isChecked ? 'line-through opacity-40' : ''}>
              {applyHighlights(text)}
            </span>
          </div>
        );
      }

      if (block.type === 'list') {
        return (
          <div key={blockIdx} className="flex items-start gap-2 my-1 text-xs text-on-surface/80 pl-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container/40 mt-1.5 flex-shrink-0" />
            <span>{applyHighlights(block.content)}</span>
          </div>
        );
      }

      if (block.type === 'empty') {
        return <div key={blockIdx} className="h-3" />;
      }

      if (block.type === 'hr') {
        return <hr key={blockIdx} className="my-5 border-outline-variant/10" />;
      }

      if (block.type === 'code') {
        const codeText = block.content;
        const language = block.lang || 'typescript';

        let fileName = `file.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'sql' ? 'sql' : language === 'json' ? 'json' : 'txt'}`;
        if (codeText.includes('interface ') || codeText.includes('export const ')) {
          fileName = `types.ts`;
        }
        if (codeText.includes('CREATE TABLE') || codeText.includes('SELECT ')) {
          fileName = `schema.sql`;
        }

        return (
          <div key={blockIdx} className="my-5 border border-outline-variant/10 rounded-xl overflow-hidden bg-[#080908] shadow-lg animate-in fade-in duration-300">
            <div className="bg-[#121412] px-4 py-2.5 border-b border-outline-variant/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-primary-container">code</span>
                <span className="text-[10px] font-mono text-on-surface/80 font-semibold">{fileName}</span>
                <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-on-surface/40 uppercase font-bold">{language}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeText);
                    toast.success('Code copied to clipboard');
                  }}
                  className="p-1 hover:bg-white/5 rounded text-on-surface/50 hover:text-primary-container transition-all flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold"
                  title="Copy Code"
                >
                  <span className="material-symbols-outlined text-xs">content_copy</span> Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([codeText], { type: 'text/plain;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', fileName);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success(`${fileName} downloaded`);
                  }}
                  className="p-1 hover:bg-white/5 rounded text-on-surface/50 hover:text-primary-container transition-all flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold"
                  title="Download File"
                >
                  <span className="material-symbols-outlined text-xs">download</span> Download
                </button>
              </div>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono text-[#a9b1d6] leading-relaxed max-h-[350px] overflow-y-auto no-scrollbar selection:bg-[#00c3672d]">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      return (
        <p key={blockIdx} className="text-xs text-on-surface/80 leading-relaxed font-body my-1">
          {applyHighlights(block.content)}
        </p>
      );
    });
  };

  const handleExportToGoogleDrive = async () => {
    if (!activeDirectives) return;
    setIsExportingToDrive(true);
    try {
      const rawText = (activeDirectives.metadata?.directive_raw || activeDirectives.content)
        .split('RESULT:')[0]
        .split('DIRECTIVE_DOCUMENT:')[0]
        .trim();
      const title = `ORCA Briefing - ${activeDirectives.id.substring(0, 8)}`;

      const res = await fetch('/api/integrations/google/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefingId: activeDirectives.id,
          title,
          content: rawText
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDriveDocUrl(data.fileUrl);
        toast.success(data.message || 'Exported successfully!', {
          action: {
            label: 'Open Doc ↗',
            onClick: () => window.open(data.fileUrl, '_blank')
          }
        });
      } else {
        toast.error(data.error || 'Failed to export to Google Drive.');
      }
    } catch (err) {
      toast.error('Network failure while exporting to Google Drive.');
    } finally {
      setIsExportingToDrive(false);
    }
  };
  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="chat" />
      <main className="flex-1 ml-64 flex flex-row min-h-screen relative grid-bg overflow-hidden">
        <div
          className={`flex-1 flex flex-col items-center relative overflow-y-auto no-scrollbar w-full pt-8 pb-[20rem] transition-all duration-500 ${messages.length === 0 ? 'justify-center' : 'justify-start'}`}
        >
          <DashboardHeader floating={true} activeDirectives={activeDirectives} />
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-16 pointer-events-none">
              <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase">{greeting} {userName}.</h1>
            </div>
          ) : (
            <div className={`w-full ${activeDirectives ? 'max-w-5xl' : 'max-w-3xl'} flex flex-col gap-6 px-4 min-h-full transition-all duration-500`}>
              {messages.map((msg: any) => (
                <div key={msg.id} className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {(msg.role === 'user') ? (
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
                        <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-lg shadow-inner grayscale">{msg.agent?.icon || EXECUTIVE_PILLS.find(p => p.role === pinnedAgent)?.icon || '🏦'}</div>
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
                                      <div className="w-1 h-1 rounded-full bg-primary-container animate-bounce [animation-delay:-0.3s]" />
                                      <div className="w-1 h-1 rounded-full bg-primary-container animate-bounce [animation-delay:-0.15s]" />
                                      <div className="w-1 h-1 rounded-full bg-primary-container animate-bounce" />
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
                          {chatMode.toLowerCase() !== 'automate' && (
                            <><button onClick={() => {
                                append({ role: 'user', content: 'Approved. Proceed.' });
                                toast.success('Approved & Executing');
                              }} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-primary-container hover:text-primary-container/80 transition-all bg-primary-container/10 px-3 py-1.5 rounded-lg border border-primary-container/20"><span className="material-symbols-outlined text-xs">check</span> Approve & Run</button>
                              <button onClick={() => toast.error('Rejected')} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-on-surface/40 hover:text-error transition-all px-3 py-1.5"><span className="material-symbols-outlined text-xs">close</span> Reject</button></>
                          )}

                          {/* Jump to Executive Coordination Thread */}
                          {(msg.content.includes('🔄') || msg.content.includes('Coordinating with')) && (
                             <button 
                               onClick={() => {
                                 const match = msg.content.match(/Coordinating with ([^:\s]+)/) || msg.content.match(/@([A-Z]{3})/);
                                 if (match) {
                                   const agentName = match[1].replace('@', '');
                                   toast.info(`Jumping to ${agentName}'s coordination thread...`);
                                   fetch(`/api/agents/${agentName}/latest-conversation?orgId=${org?.id}`)
                                     .then(res => res.json())
                                     .then(data => {
                                       if (data.conversationId) router.push(`/dashboard/chat/${data.conversationId}`);
                                       else toast.error('No active coordination thread found yet.');
                                     });
                                 }
                               }}
                               className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-primary-container hover:underline transition-all ml-2"
                             >
                               <span className="material-symbols-outlined text-xs">open_in_new</span> View Execution
                             </button>
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
                <div className="flex gap-4 mb-6 w-full animate-in fade-in duration-500 bg-primary-container/5 p-6 rounded-3xl border border-primary-container/10 shadow-inner">
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-2xl bg-primary-container/20 flex items-center justify-center text-xl shadow-inner grayscale animate-pulse">
                      {pinnedAgent ? EXECUTIVE_PILLS.find(p => p.role === pinnedAgent)?.icon : '🏦'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[12px] font-black font-headline text-primary-container uppercase tracking-[0.2em]">
                        {pinnedAgent || 'ATLAS'} is thinking...
                      </span>
                      <div className="flex gap-2 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-mono text-primary-container/60 uppercase tracking-[0.1em] italic">
                          {getThinkingMessages()[thinkingStep]}
                        </span>
                       <div className="h-1.5 w-full bg-primary-container/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-container/40 animate-loading-bar" style={{ width: '40%' }} />
                       </div>
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
            {/* Drag Handle for Resizing */}
            <div
              onMouseDown={startResizing}
              className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-primary-container/40 active:bg-primary-container transition-colors z-50 group"
            >
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-8 w-[2px] bg-outline-variant/20 group-hover:bg-primary-container/40 rounded-full" />
            </div>

            {/* Sidebar Header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary-container">Executive Briefing</h2>
                <p className="text-[9px] font-mono text-on-surface/40 uppercase mt-1">Ref: ORCA-{activeDirectives.id.substring(0, 8)}</p>
              </div>
              <button onClick={() => setActiveDirectives(null)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-on-surface/40 hover:text-on-surface">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Claude-style Artifact Tabs */}
            <div className="flex border-b border-outline-variant/5 bg-[#121412] px-6">
              <button
                onClick={() => setBriefingTab('preview')}
                className={`flex items-center gap-2 py-3.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all mr-6 ${briefingTab === 'preview' ? 'border-primary-container text-primary-container' : 'border-transparent text-on-surface/40 hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[15px]">description</span> Document
              </button>
              <button
                onClick={() => setBriefingTab('code')}
                className={`flex items-center gap-2 py-3.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all mr-6 ${briefingTab === 'code' ? 'border-primary-container text-primary-container' : 'border-transparent text-on-surface/40 hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[15px]">code</span> Raw Markdown
              </button>
              <button
                onClick={() => setBriefingTab('tasks')}
                className={`flex items-center gap-2 py-3.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${briefingTab === 'tasks' ? 'border-primary-container text-primary-container' : 'border-transparent text-on-surface/40 hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[15px]">splitscreen</span> Tasks & Logs
              </button>
            </div>

            {/* Premium Highlighter Toolbar */}
            <div className="bg-[#161916] border-b border-outline-variant/5 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
              {/* Auto Highlight Switcher */}
              <button
                onClick={() => setAutoHighlight(!autoHighlight)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${autoHighlight ? 'bg-primary-container/10 border-primary-container text-primary-container shadow-[0_0_15px_rgba(0,195,103,0.15)]' : 'bg-surface-container-high border-outline-variant/15 text-on-surface/40 hover:text-on-surface/75'}`}
              >
                <span className="material-symbols-outlined text-xs">{autoHighlight ? 'toggle_on' : 'toggle_off'}</span>
                Auto Highlight
              </button>

              {/* Manual Highlights Controls */}
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-on-surface/30">Highlight Select:</span>
                <button
                  onClick={() => setActiveHighlightColor('green')}
                  className={`w-4 h-4 rounded-full bg-emerald-500 border transition-all ${activeHighlightColor === 'green' ? 'scale-125 border-white ring-2 ring-emerald-400/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  title="Green Highlighter"
                />
                <button
                  onClick={() => setActiveHighlightColor('yellow')}
                  className={`w-4 h-4 rounded-full bg-amber-500 border transition-all ${activeHighlightColor === 'yellow' ? 'scale-125 border-white ring-2 ring-amber-400/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  title="Yellow Highlighter"
                />
                <button
                  onClick={applyManualHighlight}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container/10 border border-primary-container/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-primary-container hover:bg-primary-container/20 transition-all ml-1"
                >
                  <span className="material-symbols-outlined text-xs">ink_highlighter</span> Apply
                </button>
                {manualHighlights.length > 0 && (
                  <button
                    onClick={() => { setManualHighlights([]); toast.success('Cleared all highlights'); }}
                    className="flex items-center justify-center p-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-on-surface/40 hover:text-error transition-all"
                    title="Clear Highlights"
                  >
                    <span className="material-symbols-outlined text-xs">delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Content Pane */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[#0f110f] relative selection:bg-[#00c3672d]">
              {briefingTab === 'preview' && (
                <div className="p-6 lg:p-8 bg-surface-container-highest border border-outline-variant/10 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300 select-text">
                  {renderBriefingMarkdown(activeDirectives.metadata?.directive_raw || activeDirectives.content)}
                </div>
              )}

              {briefingTab === 'code' && (
                <div className="relative h-full flex flex-col">
                  <button
                    onClick={() => {
                      const rawText = (activeDirectives.metadata?.directive_raw || activeDirectives.content)
                        .split('RESULT:')[0].split('DIRECTIVE_DOCUMENT:')[0].trim();
                      navigator.clipboard.writeText(rawText);
                      toast.success('Raw markdown copied to clipboard');
                    }}
                    className="absolute top-4 right-4 bg-[#1e221e] border border-outline-variant/20 rounded-lg px-3 py-2 text-[8px] font-black text-primary-container uppercase tracking-widest hover:bg-[#282d28] transition-colors flex items-center gap-1.5 z-10"
                  >
                    <span className="material-symbols-outlined text-xs">content_copy</span> Copy Raw
                  </button>
                  <textarea
                    readOnly
                    value={(activeDirectives.metadata?.directive_raw || activeDirectives.content)
                      .split('RESULT:')[0].split('DIRECTIVE_DOCUMENT:')[0].trim()}
                    className="w-full h-[85%] bg-[#080908] border border-outline-variant/10 rounded-2xl p-6 font-mono text-[10px] text-on-surface/70 leading-relaxed outline-none resize-none"
                  />
                </div>
              )}

              {briefingTab === 'tasks' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* C-Suite System Status grid */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-container mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">grid_view</span> C-Suite Status Board
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {EXECUTIVE_PILLS.map(exec => {
                        const status = getExecutiveStatus(exec);
                        const statusColor = status === 'Executing' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : status === 'Thinking' ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' : 'text-on-surface/40 border-outline-variant/10 bg-white/5';
                        const dotColor = status === 'Executing' ? 'bg-emerald-400' : status === 'Thinking' ? 'bg-amber-300' : 'bg-on-surface/20';

                        return (
                          <div key={exec.key} className="p-3 bg-[#121412] border border-outline-variant/10 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{exec.icon}</span>
                              <div>
                                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">{exec.name}</h4>
                                <p className="text-[8px] font-mono text-on-surface/40 uppercase tracking-widest">{exec.role}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest border flex items-center gap-1.5 ${statusColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${status !== 'Idle' ? 'animate-pulse' : ''}`} />
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Handoffs */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-container mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">sync_alt</span> Active Handoffs & Coordinations
                    </h3>
                    {activeCoordinations.length === 0 ? (
                      <div className="p-4 bg-[#121412] border border-outline-variant/5 rounded-xl text-center text-on-surface/40 text-[10px] font-mono uppercase tracking-widest">
                        No active handoffs in progress
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeCoordinations.map(coord => {
                          const fromPill = EXECUTIVE_PILLS.find(p => p.name === coord.from_agent?.name);
                          const toPill = EXECUTIVE_PILLS.find(p => p.name === coord.to_agent?.name);

                          return (
                            <div key={coord.id} className="p-4 bg-[#121412] border border-outline-variant/10 rounded-xl space-y-3 relative overflow-hidden group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                                    <span className="text-xs">{fromPill?.icon || '🏦'}</span>
                                    <span className="text-[9px] font-mono text-white font-bold">{coord.from_agent?.name || 'User'}</span>
                                  </div>
                                  <span className="material-symbols-outlined text-xs text-primary-container">arrow_forward</span>
                                  <div className="flex items-center gap-1 bg-primary-container/10 border border-primary-container/20 px-2 py-0.5 rounded">
                                    <span className="text-xs">{toPill?.icon || '🏦'}</span>
                                    <span className="text-[9px] font-mono text-primary-container font-bold">{coord.to_agent?.name || 'Agent'}</span>
                                  </div>
                                </div>
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
                                </span>
                              </div>
                              <p className="text-[11px] text-on-surface/80 leading-relaxed font-body">
                                {coord.description}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="text-[8px] font-mono text-on-surface/40 uppercase tracking-widest">
                                  {new Date(coord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <button
                                  onClick={() => {
                                    if (coord.to_agent?.name) {
                                      toast.info(`Jumping to ${coord.to_agent.name}'s active thread...`);
                                      fetch(`/api/agents/${coord.to_agent.name}/latest-conversation?orgId=${org?.id}`)
                                        .then(res => res.json())
                                        .then(data => {
                                          if (data.conversationId) router.push(`/dashboard/chat/${data.conversationId}`);
                                          else toast.error('Could not locate coordination workspace');
                                        });
                                    }
                                  }}
                                  className="text-[8px] font-black uppercase tracking-widest text-primary-container hover:underline flex items-center gap-1"
                                >
                                  View Workspace <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tool Execution Logs */}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-container mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">terminal</span> Tool Execution Logs
                    </h3>
                    <div className="bg-[#080908] border border-outline-variant/10 rounded-xl overflow-hidden p-4 font-mono text-[9px] text-[#a9b1d6] leading-relaxed max-h-[250px] overflow-y-auto no-scrollbar space-y-2.5">
                      {messages.flatMap((m: any) => m.toolInvocations || []).length === 0 ? (
                        <div className="text-on-surface/30 italic uppercase text-center py-4">No tools executed in this conversation yet</div>
                      ) : (
                        messages.flatMap((m: any) => (m.toolInvocations || []).map((ti: any, idx: number) => {
                          const statusLabel = ti.state === 'result' ? 'SUCCESS' : 'RUNNING';
                          const statusColor = ti.state === 'result' ? 'text-emerald-400' : 'text-amber-300';
                          return (
                            <div key={ti.toolCallId || idx} className="border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-primary-container font-bold">{ti.toolName.toUpperCase()}</span>
                                <span className={`font-bold ${statusColor}`}>[{statusLabel}]</span>
                              </div>
                              <div className="text-[8px] text-on-surface/40 mb-1">
                                Args: {JSON.stringify(ti.args)}
                              </div>
                              {ti.state === 'result' && (
                                <div className="text-[8px] text-[#737aa2] max-h-16 overflow-y-auto no-scrollbar">
                                  Result: {JSON.stringify(ti.result).slice(0, 150)}...
                                </div>
                              )}
                            </div>
                          );
                        }))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Drawer */}
            <div className="p-6 border-t border-outline-variant/10 bg-surface-container space-y-3">
              {/* Document Download & Share Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={isExportingToDrive}
                  onClick={handleExportToGoogleDrive}
                  className="py-3 bg-[#0f9d58]/10 hover:bg-[#0f9d58]/20 border border-[#0f9d58]/30 rounded-xl font-black text-[9px] uppercase tracking-widest text-[#0f9d58] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isExportingToDrive ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  )}
                  {isExportingToDrive ? 'Exporting...' : 'Send to Drive'}
                </button>

                <button
                  onClick={() => {
                    const rawText = (activeDirectives.metadata?.directive_raw || activeDirectives.content)
                      .split('RESULT:')[0].split('DIRECTIVE_DOCUMENT:')[0].trim();
                    const blob = new Blob([rawText], { type: 'text/markdown;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `ORCA_Executive_Briefing_${activeDirectives.id.substring(0, 8)}.md`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Markdown file downloaded successfully');
                  }}
                  className="py-3 bg-surface-container-high border border-outline-variant/20 text-on-surface font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span> Download MD
                </button>
              </div>

              {/* CEO Direct Action Execution Trigger */}
              <button
                onClick={() => {
                  const content = activeDirectives.metadata?.directive_raw || activeDirectives.content;
                  const mentions = Array.from(content.matchAll(/@([A-Z][a-z]+)/g)).map((m: any) => m[1]);
                  const validExecs = mentions.filter(name =>
                    EXECUTIVE_PILLS.some(p => p.name === name)
                  );
                  toast.success('AUTHORIZING: Dispatching executive orders to entire team...');
                  append({ role: 'user', content: '[APPROVAL_GRANTED] The board has authorized these directives. Execute immediately.' });
                  setActiveDirectives(null);
                }}
                className="w-full py-4 bg-primary-container text-on-primary rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_12px_40px_rgba(0,195,103,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">bolt</span> Authorize & Execute
              </button>
            </div>
          </div>
        )}

        <div
          style={{ right: activeDirectives ? `${sidebarWidth}px` : 0 }}
          className={`fixed bottom-0 left-64 transition-all duration-500 p-8 pt-0 flex flex-col items-center pointer-events-none z-30`}
        >
          <div className="w-full max-w-3xl flex flex-col gap-3 pointer-events-auto">
            <div className="flex justify-center gap-2 mb-1">
              {EXECUTIVE_PILLS.map(exec => {
                const isWorking = activeCoordinations.some(c => c.to_agent?.name === exec.name);
                const status = getExecutiveStatus(exec);
                return (
                  <div
                    key={exec.key}
                    className="relative"
                    onMouseEnter={() => setHoveredExec(exec.key)}
                    onMouseLeave={() => setHoveredExec(null)}
                  >
                    <button onClick={() => {
                      const workingCoord = activeCoordinations.find(c => c.to_agent?.name === exec.name);
                      if (workingCoord) {
                        toast.info(`Jumping to ${exec.name}'s active thread...`);
                        fetch(`/api/agents/${exec.name}/latest-conversation?orgId=${org?.id}`)
                          .then(res => res.json())
                          .then(data => {
                            if (data.conversationId) router.push(`/dashboard/chat/${data.conversationId}`);
                            else setPinnedAgent(pinnedAgent === exec.role ? null : exec.role);
                          });
                      } else {
                        setPinnedAgent(pinnedAgent === exec.role ? null : exec.role);
                      }
                    }}
                      className={`relative flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all duration-300 ${pinnedAgent === exec.role ? 'bg-primary-container/20 border border-primary-container text-primary-container shadow-[0_0_20px_rgba(0,195,103,0.2)] scale-105' : 'bg-surface-container-high border border-outline-variant/20 text-on-surface/30 hover:border-primary-container/40 hover:text-on-surface'}`}
                    >
                      {isWorking && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
                        </span>
                      )}
                      <span className={`text-sm transition-all duration-500 ${pinnedAgent === exec.role ? 'grayscale-0 scale-110' : 'grayscale group-hover:grayscale-0'}`}>{exec.icon}</span> {exec.role}
                    </button>

                    {/* Premium Hover Tooltip */}
                    {hoveredExec === exec.key && (
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-[#121412] border border-[#262a26] p-4 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-left normal-case pointer-events-auto z-[60] animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{exec.icon}</span>
                            <div>
                              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">{exec.name}</h4>
                              <p className="text-[8px] font-mono text-on-surface/40 uppercase tracking-widest">{exec.role}</p>
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase tracking-widest border flex items-center gap-1 ${
                            status === 'Executing' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                            status === 'Thinking' ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' :
                            'text-on-surface/40 border-outline-variant/10 bg-white/5'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              status === 'Executing' ? 'bg-emerald-400' :
                              status === 'Thinking' ? 'bg-amber-300' : 'bg-on-surface/20'
                            } ${status !== 'Idle' ? 'animate-pulse' : ''}`} />
                            {status}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-on-surface/70 leading-relaxed mb-3">
                          {status === 'Executing' ? (
                            <span>
                              Currently working: <span className="text-white font-medium">{activeCoordinations.find(c => c.to_agent?.name === exec.name)?.description}</span>
                            </span>
                          ) : status === 'Thinking' ? (
                            <span>Analyzing directives and processing background pipeline...</span>
                          ) : (
                            <span>{EXECUTIVE_DESCRIPTIONS[exec.key]}</span>
                          )}
                        </p>

                        {status === 'Executing' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Jumping to ${exec.name}'s active thread...`);
                              fetch(`/api/agents/${exec.name}/latest-conversation?orgId=${org?.id}`)
                                .then(res => res.json())
                                .then(data => {
                                  if (data.conversationId) router.push(`/dashboard/chat/${data.conversationId}`);
                                  else toast.error('Could not locate coordination workspace');
                                });
                            }}
                            className="w-full py-1.5 bg-primary-container/20 border border-primary-container/30 hover:bg-primary-container/30 rounded-lg text-[8px] font-black text-primary-container uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                          >
                            Jump to Workspace <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="bg-[#121412] border border-[#262a26] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
              <div className="px-6 py-4 flex items-start gap-4">
                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt,.md,.csv" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInput((prev: any) => prev ? `${prev} [Attached: ${file.name}]` : `[Attached: ${file.name}]`);
                    toast.success(`Attached: ${file.name}`);
                    setShowAddMenu(false);
                  }
                }} />
                {/* Add button with dropdown */}
                <div className="relative mt-1.5">
                  <button
                    onClick={() => setShowAddMenu(v => !v)}
                    className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${showAddMenu ? 'bg-primary-container/20 text-primary-container' : 'hover:bg-white/5 text-on-surface/20 hover:text-on-surface/60'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${showAddMenu ? 'rotate-45' : ''}`}>add</span>
                  </button>
                  {showAddMenu && (
                    <div className="absolute bottom-full mb-2 left-0 min-w-[180px] bg-[#1a1c1a] border border-[#2d312d] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <button onClick={() => { fileInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface/60 hover:text-on-surface hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">image</span> Attach Image
                      </button>
                      <button onClick={() => { fileInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface/60 hover:text-on-surface hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">description</span> Attach Document
                      </button>
                      <button onClick={() => { setShowAddMenu(false); toast.info('Web context coming soon'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface/60 hover:text-on-surface hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">language</span> Add Web Context
                      </button>
                    </div>
                  )}
                </div>
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface/20 text-[15px] font-body resize-none min-h-[44px] max-h-[240px] py-2 overflow-y-auto"
                  placeholder={pinnedAgent ? `Brief your ${pinnedAgent}...` : "Ask anything..."} rows={1} disabled={isLoading}
                />
                <button
                  onClick={handleVoiceInput}
                  className={`mt-1.5 h-8 w-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/5 text-on-surface/20 hover:text-on-surface/60'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{isListening ? 'mic_off' : 'mic'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d0f0d]/30 border-t border-[#262a26]/40 rounded-b-2xl">
                <div className="flex items-center gap-2"><Dropdown value={chatMode} options={MODES} onChange={setChatMode} /><div className="h-1 w-1 rounded-full bg-on-surface/10 mx-1" /><Dropdown value={activeModel} options={MODELS} onChange={setActiveModel} /></div>
                <button onClick={() => handleSendMessage()} disabled={!(input || '').trim() || isLoading} className={`h-9 w-9 flex items-center justify-center rounded-full transition-all ${(input || '').trim() && !isLoading ? 'bg-primary-container text-on-primary shadow-[0_0_20px_rgba(0,195,103,0.3)] hover:scale-105 active:scale-95' : 'bg-[#212421] text-on-surface/20'}`}><span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span></button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showPricingModal && <PricingModal isOpen={showPricingModal} onClose={() => !isLocked && setShowPricingModal(false)} isLocked={isLocked} currentPlan={org?.plan} />}
    </div>
  );
}
