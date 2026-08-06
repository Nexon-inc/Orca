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
import ExecutiveThinkingPanel, {
  assistantHasVisibleContent,
  getAssistantDisplayContent,
} from '@/components/ExecutiveThinkingPanel';
import InChatQuestionCard from '@/components/InChatQuestionCard';
import { parseInChatQuestion } from '@/lib/chat/questionParser';
import {
  DIRECTIVE_RUN_INSTRUCTION,
  isDirectivePaste,
  LONG_PASTE_CHAR_THRESHOLD,
} from '@/lib/chat/pasteConfig';
import { parseExecutiveFromPrompt, AGENT_MAPPING } from '@/lib/chat/agentMapping';


const DEPT_MAP: Record<string, { emoji: string; color: string; label: string; name: string }> = {
  Aria: { emoji: '🎙️', color: '#50ffa0', label: 'MARKETING', name: 'ARIA' },
  Rex: { emoji: '💰', color: '#3b82f6', label: 'SALES', name: 'REX' },
  Purity: { emoji: '🛟', color: '#a855f7', label: 'CUSTOMER SUCCESS', name: 'PURITY' },
  Roman: { emoji: '🏛️', color: '#ec4899', label: 'INTEL', name: 'ROMAN' },
  Ghost: { emoji: '👻', color: '#f5a623', label: 'TECHNOLOGY', name: 'GHOST' },
  Atlas: { emoji: '🗺️', color: '#10b981', label: 'CEO/OPS', name: 'ATLAS' },
};


const getBriefTitle = (msg: any) => {
  if (!msg) return 'Sprint Brief';
  const content = msg.metadata?.directive_raw || msg.content || '';
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  if (match) return match[1].trim();
  return content.split('\n')[0].replace(/[*#_`>]/g, '').trim() || 'Sprint Brief';
};

const cleanBriefingContent = (raw: string): string => {
  if (!raw) return '';
  let clean = raw
    .split('RESULT:')[0]
    .split('DIRECTIVE_DOCUMENT:')[0]
    .trim();

  const patterns = [
    /\*\*TASK HISTORY & LOGS\*\*/gi,
    /### TASK HISTORY & LOGS/gi,
    /## TASK HISTORY & LOGS/gi,
    /# TASK HISTORY & LOGS/gi,
    /TASK HISTORY & LOGS/gi
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match.index !== undefined) {
      let startIndex = clean.lastIndexOf('\n', match.index);
      if (startIndex === -1) startIndex = 0;
      clean = clean.substring(0, startIndex).trim();
      break;
    }
  }
  
  return clean;
};

const HandoffCard = ({ to, reason, context }: { to: string; reason: string; context: string }) => {
  const dept = DEPT_MAP[to] || { emoji: '🏦', color: '#10b981', label: 'EXEC', name: to.toUpperCase() };
  return (
    <div 
      style={{ borderLeftColor: dept.color }}
      className="my-4 bg-[#111a11] rounded-xl border border-outline-variant/10 border-l-[3px] overflow-hidden select-text"
    >
      <div className="bg-[#0a140a] px-4 py-2 border-b border-outline-variant/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{dept.emoji}</span>
          <span className="text-[10px] font-black text-white uppercase tracking-wider">{dept.name}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[8px] tracking-widest text-on-surface/40 uppercase">
          <span>HANDOFF</span>
          <span 
            style={{ color: dept.color, borderColor: `${dept.color}33` }} 
            className="px-1.5 py-0.5 rounded border bg-white/5 font-bold"
          >
            {dept.label}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-2 text-[11px] leading-relaxed">
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
          <span className="text-on-surface/40 font-mono uppercase tracking-widest w-16 shrink-0">Reason:</span>
          <span className="text-white font-medium flex-1">{reason}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
          <span className="text-on-surface/40 font-mono uppercase tracking-widest w-16 shrink-0">Context:</span>
          <span className="text-on-surface/80 flex-1">{context}</span>
        </div>
      </div>
    </div>
  );
};

const renderContentWithHandoffs = (content: string) => {
  const handoffRegex = /\[HANDOFF:\s*to=["']([^"']+)["']\s*reason=["']([^"']+)["']\s*context=["']([^"']+)["']\]/gi;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = handoffRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push({ type: 'markdown', content: textBefore });
    }
    parts.push({
      type: 'handoff',
      to: match[1],
      reason: match[2],
      context: match[3]
    });
    lastIndex = handoffRegex.lastIndex;
  }
  
  const textAfter = content.substring(lastIndex);
  if (textAfter.trim() || parts.length === 0) {
    parts.push({ type: 'markdown', content: textAfter || content });
  }
  
  return parts;
};

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
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [manualHighlights, setManualHighlights] = useState<{ text: string; color: 'green' | 'yellow' | 'red' }[]>([]);
  const [isExportingToDrive, setIsExportingToDrive] = useState(false);
  const [driveDocUrl, setDriveDocUrl] = useState<string | null>(null);
  const [activeHighlightColor, setActiveHighlightColor] = useState<'green' | 'yellow' | 'red'>('green');
  const [selectionTooltip, setSelectionTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTaskControlModal, setShowTaskControlModal] = useState(false);
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<'ALL' | 'RUNNING' | 'PAUSED' | 'COMPLETED'>('ALL');
  const [isTasksPaused, setIsTasksPaused] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const tasks = activeCoordinations.map(c => {
    const toAgentName = c.to_agent?.name || 'Agent';
    const fromAgentName = c.from_agent?.name || 'Agent';
    const role = c.to_agent?.acronym || 'EXEC';
    
    let icon = '🏦';
    if (toAgentName === 'Aria') icon = '🎙️';
    else if (toAgentName === 'Rex') icon = '💰';
    else if (toAgentName === 'Purity') icon = '🛟';
    else if (toAgentName === 'Roman') icon = '🏛️';
    else if (toAgentName === 'Ghost') icon = '👻';

    let status = 'RUNNING';
    let progress = 40;
    if (c.status === 'complete') {
      status = 'COMPLETE';
      progress = 100;
    } else if (c.status === 'rejected') {
      status = 'FAILED';
      progress = 100;
    } else if (c.status === 'approved') {
      status = 'COMPLETE';
      progress = 100;
    } else if (c.status === 'pending') {
      status = 'RUNNING';
      progress = 10;
    }

    const elapsed = Math.max(0, Math.floor((Date.now() - new Date(c.created_at).getTime()) / 1000));

    return {
      id: c.id,
      icon,
      title: c.description,
      status,
      progress,
      elapsed,
      dept: role,
      description: `Coordination handoff from ${fromAgentName} to ${toAgentName}. Type: ${c.type}.`,
      input: c.context ? JSON.stringify(c.context, null, 2) : 'No payload.',
      output: c.chain_summary || (c.status === 'complete' ? 'Execution finished.' : 'Awaiting worker output...'),
      created_at: c.created_at
    };
  });
  const runningTasks = tasks.filter(t => t.status === 'RUNNING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETE' || t.status === 'FAILED');
  const [sidebarWidth, setSidebarWidth] = useState(600);
  const isResizing = useRef(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const historyInitialized = useRef(false);
  const isFirstMessage = useRef(true);
  const initialMessageSent = useRef(false);
  const [pastedDocContent, setPastedDocContent] = useState<string | null>(null);
  const pastedDocRef = useRef<string | null>(null);

  const setPastedDocument = (value: string | null) => {
    pastedDocRef.current = value;
    setPastedDocContent(value);
  };

  const mapDbMessagesToChat = (dbMessages: any[]) =>
    dbMessages.map((m: any) => ({
      id: m.id,
      role: (m.sender_type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: String(m.content || ''),
      createdAt: new Date(m.created_at),
      metadata: m.metadata || {},
      result_items: m.result_items || [],
      toolInvocations: m.metadata?.tool_results
        ? m.metadata.tool_results.map((tr: any) => ({
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
            args: tr.args,
            state: 'result',
            result: tr.result,
          }))
        : [],
    }));

  const reloadMessagesFromDb = async () => {
    if (!conversationId) return;
    try {
      const msgRes = await fetch(`/api/conversations/${conversationId}/messages`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!msgRes.ok) return;
      const msgData = await msgRes.json();
      if (msgData.messages?.length) {
        const transformed = mapDbMessagesToChat(msgData.messages);
        setMessages(transformed);
        const lastAgentMsg = [...msgData.messages].reverse().find((m: any) => m.sender_type === 'agent');
        if (lastAgentMsg?.metadata?.directive_raw) {
          const lastChat = transformed[transformed.length - 1];
          if (lastChat?.role === 'assistant') setActiveDirectives(lastChat);
        }
      }
    } catch (err) {
      console.error('Failed to reload messages:', err);
    }
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
    streamProtocol: 'data',
    keepLastMessageOnError: true,
    body: {
      model: typeof activeModel === 'string' ? activeModel : (activeModel as any).id,
      mode: chatMode.toLowerCase(),
      pastedDocumentContent: pastedDocRef.current || undefined,
    },
    onResponse: (response: any) => {
      if (!response.ok) {
        response.text().then((text: any) => {
          console.error('[ORCA_RAW_ERROR]', text);
          toast.error(`Server Error: ${text.slice(0, 150)}`);
        });
      }
    },
    onFinish: async (message) => {
      await reloadMessagesFromDb();
      // Retry DB reload if stream arrived empty but server saved a reply
      if (!message?.content?.trim()) {
        setTimeout(() => reloadMessagesFromDb(), 1500);
        setTimeout(() => reloadMessagesFromDb(), 4000);
      }
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      if (isFirstMessage.current && conversationId) {
        isFirstMessage.current = false;
        window.dispatchEvent(new Event('conversation_created'));
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
              const rawContent = lastData.assistant_content || newMessages[i].content || '';
              const cleanContent = String(rawContent)
                .replace(/(?:\[|<)ACTION:\s*tool=["']([^"']+)["']\s*params=({[\s\S]+?})(?:\]|>(?:<\/ACTION>)?)/gi, (_m: string, tool: string) => `\n> ✓ **${formatUserFriendlyBadge(tool)}**\n`)
                .replace(/\[HANDOFF:\s*to=["']([^"']+)["']\s*reason=["']([^"']+)["']\s*context=["']([^"']+)["']\]/gi, (_m: string, toAgent: string, reason: string) => `\n> 🔄 **Coordinating with ${toAgent}:** ${reason}\n`)
                .replace(/(?:\[|<)ACTION:[\s\S]*?(?:\]|>(?:<\/ACTION>)?)/gi, '')
                .replace(/<\/ACTION>/gi, '');

              newMessages[i].content = cleanContent;

              newMessages[i].metadata = {
                ...newMessages[i].metadata,
                directive_raw: lastData.directive_raw,
                result_items: lastData.result_items,
                agent_name: lastData.agent_name,
                provider: lastData.provider || newMessages[i].metadata?.provider,
                model: lastData.model || newMessages[i].metadata?.model,
              };

              if (i === newMessages.length - 1 && lastData.directive_raw) {
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


  // 1. Text Selection listener for Manual Highlights floating tooltip
  useEffect(() => {
    const handleSelection = () => {
      if (typeof window === 'undefined') return;
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = document.getElementById('briefing-preview-container');
        if (container && container.contains(range.commonAncestorContainer)) {
          const rect = range.getBoundingClientRect();
          setSelectionTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 40,
            text
          });
          return;
        }
      }
      setSelectionTooltip(null);
    };

    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  const applyHighlightColor = (text: string, color: 'green' | 'yellow' | 'red') => {
    if (!manualHighlights.some(h => h.text.toLowerCase() === text.toLowerCase())) {
      setManualHighlights(prev => [...prev, { text, color }]);
      toast.success(`Highlighted selection in ${color === 'green' ? 'Action' : color === 'yellow' ? 'Insight' : 'Risk'}`);
    }
  };

  const getProgressBarText = (status: string, progress: number) => {
    if (status === 'QUEUED') return '──────';
    if (status === 'COMPLETE' || status === 'FAILED') return '██████';
    const filledCount = Math.floor(progress / 16.66);
    const emptyCount = 6 - filledCount;
    return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
  };

  const formatElapsedTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

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

  const getRequestBody = () => ({
    model: typeof activeModel === 'string' ? activeModel : (activeModel as any).id,
    mode: chatMode.toLowerCase(),
    pastedDocumentContent: pastedDocRef.current || undefined,
  });

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
      if (historyInitialized.current) return;
      historyInitialized.current = true;
      try {
        const userRes = await fetch('/api/user');
        const userData = await userRes.json();
        if (userData?.user) {
          setUser(userData.user);
          
          try {
            const orgRes = await fetch('/api/org');
            const orgData = await orgRes.json();
            if (orgData?.member?.organizations) {
              setOrg(orgData.member.organizations);
            }
          } catch (err) {}

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
                  const transformed = mapDbMessagesToChat(msgData.messages);
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

  // Handle auto-submitting initialMessage from URL (after pasted doc is restored)
  useEffect(() => {
    const initMsg = searchParams?.get('initialMessage');
    if (!initMsg || !historyInitialized.current || initialMessageSent.current) return;

    initialMessageSent.current = true;

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/dashboard/chat/${conversationId}`);
    }

    const stored = sessionStorage.getItem('orca_pasted_doc');
    if (stored) {
      pastedDocRef.current = stored;
      setPastedDocContent(stored);
      sessionStorage.removeItem('orca_pasted_doc');
    }

    const timer = setTimeout(() => {
      if (isFirstMessage.current && conversationId) {
        const titleSlug = initMsg.trim().split(/\s+/).slice(0, 6).join(' ');
        fetch(`/api/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titleSlug }),
        }).catch(() => {});
      }

      const targetRole = parseExecutiveFromPrompt(initMsg);
      if (targetRole) {
        setPinnedAgent(targetRole);
      }

      append(
        { role: 'user', content: initMsg },
        {
          body: {
            model: typeof activeModel === 'string' ? activeModel : (activeModel as any).id,
            mode: chatMode.toLowerCase(),
            pastedDocumentContent: pastedDocRef.current || undefined,
          },
        }
      );
      if (pastedDocRef.current) setPastedDocument(null);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams, conversationId, append, activeModel, chatMode]);

  const isChatLoading = isLoading && messages && messages.length > 0;

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

    if (!conversationId) {
      toast('Workspace initializing... please wait a second or refresh');
      return;
    }

    setInput('');

    // Dynamically set pinned agent if prompt contains a mention
    const targetRole = parseExecutiveFromPrompt(messageText);
    if (targetRole) {
      setPinnedAgent(targetRole);
    }

    if (isFirstMessage.current) {
      const titleSlug = messageText.split(/\s+/).slice(0, 6).join(' ');
      fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleSlug }),
      }).catch(() => {});
    }

    append({ role: 'user', content: messageText }, { body: getRequestBody() });
    // Clear pasted doc only after body was captured by append
    setPastedDocument(null);
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

    const cleanContent = cleanBriefingContent(rawContent);

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
      } else if (trimmed.startsWith('> ')) {
        blocks.push({ type: 'quote', content: trimmed.slice(2) });
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
      const rawText = cleanBriefingContent(activeDirectives.metadata?.directive_raw || activeDirectives.content);
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

  const handleDownloadMarkdown = (msg: any) => {
    if (!msg) return;
    const rawText = cleanBriefingContent(msg.metadata?.directive_raw || msg.content);
    const blob = new Blob([rawText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `briefing-${msg.id.substring(0, 8)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Markdown downloaded');
  };

  const handleDownloadPlainText = (msg: any) => {
    if (!msg) return;
    const rawText = cleanBriefingContent(msg.metadata?.directive_raw || msg.content);
    const stripped = rawText
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/>/g, '');
    const blob = new Blob([stripped], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `briefing-${msg.id.substring(0, 8)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Plain text downloaded');
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
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-[10px] font-black font-headline text-primary-container uppercase tracking-[0.25em]">{msg.agent?.role || pinnedAgent || 'ATLAS'}</span>
                          <span className="w-1 h-1 rounded-full bg-on-surface/10" />
                          <span className="text-[9px] font-mono text-on-surface/40 uppercase tracking-widest">{msg.agent?.title || 'EXECUTIVE AGENT'}</span>
                          {msg.metadata?.provider && (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-container/20 animate-pulse" />
                              <span className="text-[8px] font-mono text-white/30 border border-white/5 bg-white/[0.02] px-2 py-0.5 rounded uppercase tracking-widest">
                                ⬡ {msg.metadata.provider === 'nvidia' ? 'NIM' : msg.metadata.provider.toUpperCase()}
                                {msg.metadata.model && ` · ${msg.metadata.model.split('/').pop()?.slice(0, 20)}`}
                              </span>
                            </>
                          )}
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

                        {(() => {
                          const rawAssistant = msg.content || '';
                          const parsedQuestion = parseInChatQuestion(rawAssistant);
                          const displayContent = getAssistantDisplayContent(msg);
                          return (
                            <>
                              <div className="text-sm text-on-secondary-container font-body leading-relaxed whitespace-pre-wrap">
                                {parsedQuestion?.contentWithoutQuestion
                                  ? getAssistantDisplayContent({
                                      ...msg,
                                      content: parsedQuestion.contentWithoutQuestion,
                                    })
                                  : displayContent || rawAssistant}
                              </div>
                              {parsedQuestion && (
                                <InChatQuestionCard
                                  question={parsedQuestion.question}
                                  options={parsedQuestion.options}
                                  disabled={isChatLoading}
                                  onSelect={(option) => {
                                    append({ role: 'user', content: option }, { body: getRequestBody() });
                                  }}
                                />
                              )}
                            </>
                          );
                        })()}
                        {(msg.metadata?.directive_raw || (msg.result_items && msg.result_items.length > 0)) && (
                          <div 
                            onClick={() => setActiveDirectives(msg)}
                            className="mt-4 bg-[#111a11] rounded-xl border border-[#50ffa0]/15 p-4 flex items-center justify-between cursor-pointer hover:border-[#50ffa0]/30 transition-all select-none shadow-[0_0_15px_rgba(80,255,160,0.05)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-[#50ffa0] shrink-0">
                                <span className="material-symbols-outlined text-lg">hexagon</span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#50ffa0] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#50ffa0]"></span>
                                  </span>
                                  <span className="text-xs font-bold text-white uppercase tracking-wide truncate max-w-[240px] sm:max-w-[340px]">
                                    {getBriefTitle(msg)}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-on-surface/40 uppercase tracking-widest mt-0.5">
                                  Executive Brief · ORCA
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => handleExportToGoogleDrive(msg)}
                                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-on-surface/60 hover:text-[#50ffa0] hover:bg-[#50ffa0]/10 transition-all"
                                title="Send to Google Drive"
                              >
                                🔺
                              </button>
                              <button 
                                onClick={() => handleDownloadMarkdown(msg)}
                                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-on-surface hover:text-[#50ffa0] hover:border-[#50ffa0]/30 transition-all"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        )}
                        <div className={`flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant/10 transition-opacity ${assistantHasVisibleContent(msg) ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
                          {chatMode.toLowerCase() !== 'automate' && assistantHasVisibleContent(msg) && (
                            <><button onClick={() => {
                                append({ role: 'user', content: 'Approved. Proceed.' }, { body: getRequestBody() });
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
              {isLoading && (() => {
                const exec = EXECUTIVE_PILLS.find((p) => p.role === pinnedAgent) || EXECUTIVE_PILLS[0];
                return (
                  <ExecutiveThinkingPanel
                    executiveRole={exec.role}
                    executiveIcon={exec.icon}
                    executiveName={exec.title}
                    stepLabel={getThinkingMessages()[thinkingStep]}
                    mode={chatMode}
                  />
                );
              })()}
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

            {/* Claude-Style Replicated Header */}
            <div className="h-10 bg-[#0a140a] border-b border-[#50ffa0]/15 px-4 flex items-center justify-between select-none relative z-50">
              
              {/* Left View Switching Icons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBriefingTab('preview')}
                  className={`w-7 h-7 flex items-center justify-center rounded transition-all text-xs ${briefingTab === 'preview' ? 'text-[#50ffa0] bg-[#50ffa0]/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                  title="Document View"
                >
                  👁
                </button>
                <button
                  onClick={() => setBriefingTab('code')}
                  className={`w-7 h-7 flex items-center justify-center rounded transition-all text-xs font-mono font-bold ${briefingTab === 'code' ? 'text-[#50ffa0] bg-[#50ffa0]/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                  title="Raw Markdown Source"
                >
                  &lt;&gt;
                </button>
                <button
                  onClick={() => setBriefingTab('tasks')}
                  className={`w-7 h-7 flex items-center justify-center rounded transition-all text-xs ${briefingTab === 'tasks' ? 'text-[#50ffa0] bg-[#50ffa0]/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                  title="Tasks & Logs"
                >
                  ☰
                </button>
              </div>

              {/* Center Text */}
              <div className="text-[10px] text-white/50 tracking-wider font-body truncate max-w-[280px]">
                {getBriefTitle(activeDirectives)} <span className="text-white/30 mx-1.5">·</span> {activeDirectives.metadata?.agent_name ? `${activeDirectives.metadata.agent_name} Brief` : 'Executive Brief'}
              </div>

              {/* Right Action Icons */}
              <div className="flex items-center gap-1.5 relative">
                
                {/* Google Drive Export (🔺) */}
                <button
                  disabled={isExportingToDrive}
                  onClick={() => handleExportToGoogleDrive()}
                  className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-[#50ffa0] hover:bg-white/5 transition-all disabled:opacity-35"
                  title="Send to Google Drive"
                >
                  🔺
                </button>

                {/* Dropdown Action (⚡▾) */}
                <div className="relative flex items-center bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-all">
                  <button
                    onClick={() => {
                      const content = activeDirectives.metadata?.directive_raw || activeDirectives.content;
                      toast.success('AUTHORIZING: Dispatching executive orders to entire team...');
                      append({ role: 'user', content: '[APPROVAL_GRANTED] The board has authorized these directives. Execute immediately.' });
                      setActiveDirectives(null);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-[#50ffa0] hover:scale-105 active:scale-95 transition-all"
                    title="Authorize & Execute"
                  >
                    ⚡
                  </button>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-4 h-7 flex items-center justify-center text-white/40 hover:text-white/80 transition-all border-l border-white/10 pr-1"
                    title="More Actions"
                  >
                    ▾
                  </button>
                  
                  {/* Actions Dropdown Popover */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#111a11] border border-[#50ffa0]/20 rounded-xl shadow-2xl py-1.5 z-[999] animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          const content = activeDirectives.metadata?.directive_raw || activeDirectives.content;
                          toast.success('AUTHORIZING: Dispatching executive orders to entire team...');
                          append({ role: 'user', content: '[APPROVAL_GRANTED] The board has authorized these directives. Execute immediately.' });
                          setActiveDirectives(null);
                        }}
                        className="w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#50ffa0] hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <span className="text-xs">⚡</span> Authorize & Execute
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          append({ role: 'user', content: 'Approved. Proceed.' });
                          toast.success('Approved & Executing');
                          setActiveDirectives(null);
                        }}
                        className="w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#50ffa0] hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-xs">check</span> Approve
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleExportToGoogleDrive();
                        }}
                        className="w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-[#50ffa0] hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-xs flex-shrink-0">cloud_upload</span> Send to Drive
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleDownloadMarkdown(activeDirectives);
                        }}
                        className="w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-xs flex-shrink-0">download</span> Download MD
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleDownloadPlainText(activeDirectives);
                        }}
                        className="w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-xs flex-shrink-0">download</span> Download TXT
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          toast.error('Rejected');
                          setActiveDirectives(null);
                        }}
                        className="w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#ff4f4f] hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/5 mt-1 pt-2"
                      >
                        <span className="material-symbols-outlined text-xs">close</span> Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Refresh Icon (↺) */}
                <button
                  onClick={() => {
                    toast.info('Refreshing document workspace...');
                    reloadMessagesFromDb();
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white/80 hover:bg-white/5 transition-all text-sm font-bold"
                  title="Refresh / Re-run"
                >
                  ↺
                </button>

                {/* Close Icon (×) */}
                <button
                  onClick={() => setActiveDirectives(null)}
                  className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-[#ff4f4f] hover:bg-white/5 transition-all text-sm font-bold"
                  title="Close Briefing Room"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Sidebar Content Pane */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[#0f110f] relative selection:bg-[#00c3672d]">
              {briefingTab === 'preview' && (
                <div className="p-6 lg:p-8 bg-[#111a11] border border-[#50ffa0]/15 rounded-2xl shadow-[0_0_15px_rgba(80,255,160,0.05)] flex flex-col animate-in fade-in zoom-in-95 duration-300 select-text relative">
                  {renderBriefingMarkdown(activeDirectives.metadata?.directive_raw || activeDirectives.content)}
                  
                  {/* Floating Manual Highlight Tooltip Selector */}
                  {selectionTooltip && (
                    <div 
                      style={{ 
                        position: 'fixed', 
                        left: `${selectionTooltip.x}px`, 
                        top: `${selectionTooltip.y}px`, 
                        transform: 'translate(-50%, -100%)' 
                      }}
                      className="bg-[#121412] border border-[#50ffa0]/30 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-1.5 flex items-center gap-2 z-[9999] animate-in zoom-in-95 duration-100 select-none"
                    >
                      <button
                        onClick={() => {
                          applyHighlightColor(selectionTooltip.text, 'green');
                          setSelectionTooltip(null);
                          window.getSelection()?.removeAllRanges();
                        }}
                        className="w-4.5 h-4.5 rounded-full bg-[#50ffa0] hover:scale-110 active:scale-95 transition-all border border-white/20"
                        title="Apply Mint Green Highlight (Action)"
                      />
                      <button
                        onClick={() => {
                          applyHighlightColor(selectionTooltip.text, 'yellow');
                          setSelectionTooltip(null);
                          window.getSelection()?.removeAllRanges();
                        }}
                        className="w-4.5 h-4.5 rounded-full bg-[#f5a623] hover:scale-110 active:scale-95 transition-all border border-white/20"
                        title="Apply Amber Highlight (Insight)"
                      />
                      <button
                        onClick={() => {
                          applyHighlightColor(selectionTooltip.text, 'red');
                          setSelectionTooltip(null);
                          window.getSelection()?.removeAllRanges();
                        }}
                        className="w-4.5 h-4.5 rounded-full bg-[#ff4f4f] hover:scale-110 active:scale-95 transition-all border border-white/20"
                        title="Apply Red Highlight (Risk)"
                      />
                    </div>
                  )}
                </div>
              )}

              {briefingTab === 'code' && (
                <div className="relative h-full flex flex-col">
                  <button
                    onClick={() => {
                      const rawText = cleanBriefingContent(activeDirectives.metadata?.directive_raw || activeDirectives.content);
                      navigator.clipboard.writeText(rawText);
                      toast.success('Raw markdown copied to clipboard');
                    }}
                    className="absolute top-4 right-4 bg-[#1e221e] border border-[#50ffa0]/20 rounded-lg px-3 py-2 text-[8px] font-black text-[#50ffa0] uppercase tracking-widest hover:bg-[#282d28] transition-colors flex items-center gap-1.5 z-10"
                  >
                    Copy Raw
                  </button>
                  <textarea
                    readOnly
                    value={cleanBriefingContent(activeDirectives.metadata?.directive_raw || activeDirectives.content)}
                    className="w-full h-[85%] bg-[#080908] border border-[#50ffa0]/10 rounded-2xl p-6 font-mono text-[10px] text-on-surface/70 leading-relaxed outline-none resize-none"
                  />
                </div>
              )}

              {briefingTab === 'tasks' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Section 1: Background Tasks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#50ffa0]/15 pb-2">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#50ffa0] flex items-center gap-2">
                        BACKGROUND TASKS
                        <span className="flex items-center gap-1.5 text-[8px] font-mono text-white/50 tracking-wider font-normal lowercase">
                          ● <span className="text-[#50ffa0] animate-pulse">{runningTasks.length} running</span>
                        </span>
                      </h3>
                      <button 
                        onClick={() => setIsTasksPaused(!isTasksPaused)}
                        className="text-white/40 hover:text-white transition-colors text-xs border border-white/10 rounded px-1.5 py-0.5 bg-white/5 cursor-pointer font-bold"
                        title={isTasksPaused ? "Resume All Tasks" : "Pause All Tasks"}
                      >
                        {isTasksPaused ? '▶' : '⏸'}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {runningTasks.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-outline-variant/10 rounded-xl">
                          <p className="text-[10px] font-mono text-on-surface/30 uppercase tracking-widest">No active background tasks.</p>
                          <p className="text-[9px] font-mono text-on-surface/20 uppercase tracking-widest mt-1">Instruct your AI team to trigger autonomous workflows.</p>
                        </div>
                      ) : (
                        runningTasks.map(task => {
                          const isExpanded = expandedTaskId === task.id;
                          const progressBar = getProgressBarText(task.status, task.progress);
                          const progressText = `[RUNNING ${progressBar}]`;
                          
                          const statusColor = 'text-[#50ffa0] animate-pulse font-semibold';
                                              
                          const timeText = formatElapsedTime(task.elapsed);

                          return (
                            <div 
                              key={task.id}
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                              className="bg-[#111a11] border border-outline-variant/5 rounded-xl hover:border-outline-variant/15 transition-all select-none p-3.5 cursor-pointer"
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono tracking-tighter">
                                <div className="flex items-center gap-2.5 truncate max-w-[50%]">
                                  <span className="text-xs shrink-0">{task.icon}</span>
                                  <span className="text-white truncate">{task.title}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 shrink-0">
                                  <span className={statusColor}>{progressText}</span>
                                  <span className="text-white/50 w-14 text-right">{timeText}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 text-[8px]">
                                    {task.dept}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Expandable details */}
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-[9px] font-mono text-on-surface/60 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
                                  <p><span className="text-white font-bold uppercase mr-1">[Desc]:</span> {task.description}</p>
                                  <p><span className="text-[#50ffa0] font-bold uppercase mr-1">[Input]:</span> {task.input}</p>
                                  <p><span className="text-[#f5a623] font-bold uppercase mr-1">[Output]:</span> {task.output}</p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-[8px] font-mono text-on-surface/40 uppercase tracking-widest pt-1 px-1">
                      <button onClick={() => toast.info('Navigating to full task logs...')} className="hover:text-[#50ffa0] transition-colors">View all →</button>
                      <button onClick={() => toast.info('Opening scheduler...')} className="hover:text-[#50ffa0] transition-colors">+ Schedule ⊕</button>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <hr className="border-outline-variant/10" />

                  {/* Section 2: Task History & Logs */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#50ffa0]">
                      TASK HISTORY & LOGS
                    </h3>
                    <div className="space-y-2 font-mono text-[9px] leading-relaxed bg-[#080c08] border border-outline-variant/5 rounded-xl p-3.5 max-h-[280px] overflow-y-auto no-scrollbar">
                      {completedTasks.length === 0 ? (
                        <p className="text-on-surface/20 text-center py-4">No historical logs recorded yet.</p>
                      ) : (
                        completedTasks.map((task) => {
                          const dateObj = new Date(task.created_at);
                          const timeText = isNaN(dateObj.getTime()) ? '00:00' : `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                          return (
                            <div key={task.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-b-0 last:pb-0">
                              <div className="flex items-center gap-3 truncate max-w-[85%]">
                                <span className="text-white/30 shrink-0">{timeText}</span>
                                <span className="shrink-0">{task.icon}</span>
                                <span className="text-white/50 shrink-0">{task.dept}</span>
                                <span className="text-on-surface/80 truncate">{task.title}</span>
                              </div>
                              <span className={`shrink-0 font-bold ${task.status === 'COMPLETE' ? 'text-[#50ffa0]' : 'text-[#ff4f4f]'}`}>
                                [{task.status}]
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

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
                      <button onClick={() => { setShowAddMenu(false); toast('Web context coming soon'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface/60 hover:text-on-surface hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">language</span> Add Web Context
                      </button>
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
                <button
                  onClick={handleVoiceInput}
                  className={`mt-1.5 h-8 w-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/5 text-on-surface/20 hover:text-on-surface/60'}`}
                >
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

      {showTaskControlModal && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="w-full max-w-3xl bg-[#0c0e0c] border border-outline-variant/20 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-on-surface">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <div>
                  <h2 className="font-headline text-lg font-black uppercase tracking-tight text-white">Task Coordination & Control Center</h2>
                  <p className="font-body text-[11px] text-on-surface/40">Manage active board tasks, cross-executive handoffs, logs & cron schedules</p>
                </div>
              </div>
              <button onClick={() => setShowTaskControlModal(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-on-surface/60 hover:text-white flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 my-6">
              {(['ALL', 'RUNNING', 'PAUSED', 'COMPLETED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTaskFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    selectedTaskFilter === tab
                      ? 'bg-primary-container/15 text-primary-container border border-primary-container/30'
                      : 'bg-surface-container border border-outline-variant/10 text-on-surface/40 hover:text-on-surface'
                  }`}
                >
                  {tab} ({tab === 'ALL' ? tasks.length : tab === 'RUNNING' ? tasks.filter(t => !isTasksPaused && t.status === 'RUNNING').length : tab === 'PAUSED' ? (isTasksPaused ? tasks.filter(t => t.status === 'RUNNING').length : 0) : tasks.filter(t => t.status === 'COMPLETE' || t.status === 'FAILED').length})
                </button>
              ))}
            </div>

            {/* Task List */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
              {tasks.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-outline-variant/20 rounded-2xl text-on-surface/30 font-mono text-xs">
                  No active task coordinations recorded for this organization yet.
                </div>
              ) : (
                tasks
                  .filter(t => {
                    if (selectedTaskFilter === 'RUNNING') return !isTasksPaused && t.status === 'RUNNING';
                    if (selectedTaskFilter === 'PAUSED') return isTasksPaused && t.status === 'RUNNING';
                    if (selectedTaskFilter === 'COMPLETED') return t.status === 'COMPLETE' || t.status === 'FAILED';
                    return true;
                  })
                  .map(task => {
                    const isExpanded = expandedTaskId === task.id;
                    const isTaskPaused = isTasksPaused && task.status === 'RUNNING';

                    return (
                      <div key={task.id} className="p-4 bg-[#141714] border border-outline-variant/15 rounded-2xl hover:border-outline-variant/30 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{task.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-headline text-xs font-black uppercase text-white">{task.title}</span>
                                <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-on-surface/50 border border-white/10 uppercase">{task.dept}</span>
                              </div>
                              <p className="text-[11px] text-on-surface/50 font-body mt-0.5">{task.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest border ${
                              isTaskPaused
                                ? 'bg-amber-500/10 text-amber-300 border-amber-400/30'
                                : task.status === 'RUNNING'
                                ? 'bg-primary-container/10 text-primary-container border-primary-container/30 animate-pulse'
                                : task.status === 'FAILED'
                                ? 'bg-error/10 text-error border-error/30'
                                : 'bg-white/5 text-on-surface/40 border-white/10'
                            }`}>
                              {isTaskPaused ? 'PAUSED' : task.status}
                            </span>

                            {task.status === 'RUNNING' && (
                              <button
                                onClick={() => setIsTasksPaused(!isTasksPaused)}
                                className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border transition-all ${
                                  isTasksPaused
                                    ? 'bg-primary-container/20 text-primary-container border-primary-container/40'
                                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                }`}
                              >
                                {isTasksPaused ? '▶ Resume' : '⏸ Pause'}
                              </button>
                            )}

                            <button
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface/70 text-[9px] font-mono font-bold uppercase tracking-wider border border-white/10 transition-colors"
                            >
                              {isExpanded ? 'Hide Details' : 'Logs & Payload'}
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 bg-surface-container h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${isTaskPaused ? 'bg-amber-400' : 'bg-primary-container'}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>

                        {/* Expanded Payload & Logs */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-outline-variant/10 space-y-3 font-mono text-[11px] animate-in fade-in duration-150">
                            <div>
                              <span className="text-[9px] text-on-surface/40 uppercase tracking-widest block mb-1">Payload Context</span>
                              <pre className="p-3 bg-[#090b09] rounded-xl text-[#a9b1d6] overflow-x-auto text-[10px]">{task.input}</pre>
                            </div>
                            <div>
                              <span className="text-[9px] text-on-surface/40 uppercase tracking-widest block mb-1">Execution Summary & Log</span>
                              <div className="p-3 bg-[#090b09] rounded-xl text-primary-container/90 text-[10px]">{task.output}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

            {/* Footer Control */}
            <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-center justify-between text-[11px] font-mono text-on-surface/40">
              <span>Auto-Syncing with Inngest Engine</span>
              <button
                onClick={() => setIsTasksPaused(!isTasksPaused)}
                className="text-primary-container hover:underline font-bold uppercase text-[10px]"
              >
                {isTasksPaused ? 'Resume All Tasks' : 'Pause All Board Tasks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
