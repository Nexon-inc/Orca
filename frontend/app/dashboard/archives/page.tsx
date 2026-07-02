'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { toast } from 'sonner';

export default function ArchivesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const EXECUTIVE_PILLS = [
    { key: 'ceo', role: 'CEO', icon: '🏦', name: 'Atlas' },
    { key: 'cmo', role: 'CMO', icon: '🎙️', name: 'Aria' },
    { key: 'cso', role: 'CSO', icon: '💰', name: 'Rex' },
    { key: 'cco', role: 'CCO', icon: '🛟', name: 'Purity' },
    { key: 'cio', role: 'CIO', icon: '🏛️', name: 'Roman' },
    { key: 'cto', role: 'CTO', icon: '👻', name: 'Ghost' },
  ];

  // Fetch conversations history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        } else {
          toast.error('Failed to load archive sessions');
        }
      } catch (err) {
        toast.error('Network failure loading archives');
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchHistory();
  }, []);

  const getExecDetails = (conv: any) => {
    const agentData = Array.isArray(conv.agents) ? conv.agents[0] : conv.agents;
    if (agentData) {
      return {
        name: agentData.name,
        role: EXECUTIVE_PILLS.find(p => p.name === agentData.name)?.role || 'AGENT',
        icon: agentData.icon || '🏦'
      };
    }
    return { name: 'Atlas', role: 'CEO', icon: '🏦' };
  };

  const filteredConversations = conversations.filter(conv => {
    const exec = getExecDetails(conv);
    const title = conv.title || `SESSION_${conv.id.split('-')[0].toUpperCase()}`;
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exec.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Premium Markdown rendering helper
  const renderMessageContent = (rawContent: string) => {
    if (!rawContent) return null;

    const lines = rawContent.split('\n');
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

    const applyHighlights = (text: string) => {
      // Auto highlight metrics and handles
      const pattern = /(@[A-Za-z]+|\b(?:\d+x|\d+%\.?\d*|100%|reference customers?|milestones? completed|caution|warning|critical)\b)/gi;
      const parts = text.split(pattern);
      const matches = text.match(pattern) || [];
      let matchIdx = 0;

      return parts.map((part, i) => {
        if (i % 2 !== 0) {
          const m = matches[matchIdx++];
          const isYellow = m.startsWith('@') || m.toLowerCase() === 'caution' || m.toLowerCase() === 'warning' || m.toLowerCase() === 'critical';
          return (
            <span
              key={i}
              className={`${isYellow ? 'bg-amber-500/20 text-amber-300 border-amber-400/20' : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/20'} px-1 rounded-sm border font-semibold inline-block`}
            >
              {m}
            </span>
          );
        }
        return part;
      });
    };

    return blocks.map((block, blockIdx) => {
      if (block.type === 'h1') {
        return (
          <h1 key={blockIdx} className="text-sm font-black text-white font-headline border-b border-outline-variant/10 pb-1.5 mb-3 mt-4 uppercase tracking-[0.1em]">
            {applyHighlights(block.content)}
          </h1>
        );
      }

      if (block.type === 'h2') {
        return (
          <h2 key={blockIdx} className="text-xs font-extrabold text-primary-container font-headline mb-2.5 mt-4 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1 h-2.5 bg-primary-container/60 rounded-sm" />
            {applyHighlights(block.content)}
          </h2>
        );
      }

      if (block.type === 'h3') {
        return (
          <h3 key={blockIdx} className="text-[10px] font-black text-on-surface/80 font-headline uppercase tracking-widest mb-1.5 mt-3">
            {applyHighlights(block.content)}
          </h3>
        );
      }

      if (block.type === 'checklist') {
        const isChecked = block.content.includes('[x]');
        const text = block.content.slice(6);
        return (
          <div key={blockIdx} className="flex items-start gap-2.5 my-1.5 text-[11px] text-on-surface/85 pl-0.5">
            <span className={`material-symbols-outlined text-[13px] mt-0.5 select-none ${isChecked ? 'text-primary-container' : 'text-on-surface/20'}`}>
              {isChecked ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span className={isChecked ? 'line-through opacity-45' : ''}>
              {applyHighlights(text)}
            </span>
          </div>
        );
      }

      if (block.type === 'list') {
        return (
          <div key={blockIdx} className="flex items-start gap-2 my-1 text-[11px] text-on-surface/85 pl-2">
            <span className="w-1 h-1 rounded-full bg-primary-container/40 mt-1.5 flex-shrink-0" />
            <span>{applyHighlights(block.content)}</span>
          </div>
        );
      }

      if (block.type === 'empty') {
        return <div key={blockIdx} className="h-2" />;
      }

      if (block.type === 'hr') {
        return <hr key={blockIdx} className="my-4 border-outline-variant/10" />;
      }

      if (block.type === 'code') {
        const codeText = block.content;
        const language = block.lang || 'typescript';

        return (
          <div key={blockIdx} className="my-4 border border-outline-variant/10 rounded-xl overflow-hidden bg-[#080908] shadow-md animate-in fade-in duration-300">
            <div className="bg-[#121412] px-3.5 py-2 border-b border-outline-variant/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-primary-container">code</span>
                <span className="text-[9px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-on-surface/40 uppercase font-bold">{language}</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  toast.success('Code copied to clipboard');
                }}
                className="p-1 hover:bg-white/5 rounded text-on-surface/50 hover:text-primary-container transition-all flex items-center gap-1 text-[8px] uppercase tracking-wider font-bold"
              >
                <span className="material-symbols-outlined text-[10px]">content_copy</span> Copy
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-[10px] font-mono text-[#a9b1d6] leading-relaxed max-h-[240px] overflow-y-auto no-scrollbar selection:bg-[#00c3672d]">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      return (
        <p key={blockIdx} className="text-[11px] text-on-surface/85 leading-relaxed font-body my-1">
          {applyHighlights(block.content)}
        </p>
      );
    });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="archives" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg overflow-hidden">
        <DashboardHeader />
        
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar space-y-8 max-w-4xl mx-auto w-full">
          {/* Title & Description */}
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase flex items-center gap-3">
              ARCHIVES
              <span className="text-[10px] font-mono border border-outline-variant/20 px-2 py-0.5 rounded text-on-surface/30 tracking-[0.2em] font-normal uppercase">
                History
              </span>
            </h1>
            <p className="font-body text-xs text-on-secondary-container mt-2 max-w-xl">
              Access your organization's entire operational pipeline. Review past executive handoffs, briefs, code blueprints, and deliverables.
            </p>
          </div>

          {/* Search Input */}
          <div className="border-b border-outline-variant/30 pb-2.5 focus-within:border-primary-container/50 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface/30">search</span>
            <input 
              className="w-full bg-transparent text-xs font-body text-on-surface placeholder:text-on-surface/20 border-none outline-none focus:ring-0" 
              placeholder="SEARCH_HISTORICAL_SESSIONS..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Session List */}
          <div className="flex flex-col gap-2 pb-24">
            {isLoadingList ? (
              <div className="py-12 flex flex-col items-center gap-3 text-[10px] font-mono text-primary-container/40 uppercase tracking-widest animate-pulse">
                <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                Accessing operational records...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => {
                const exec = getExecDetails(conv);
                const title = conv.title || `SESSION_${conv.id.split('-')[0].toUpperCase()}`;
                
                return (
                  <div 
                    key={conv.id} 
                    onClick={() => router.push(`/dashboard/chat/${conv.id}`)}
                    className="flex items-center gap-4 px-5 py-4 border rounded-xl cursor-pointer transition-all duration-300 group bg-surface-container-high/40 border-outline-variant/10 hover:border-primary-container/30 hover:bg-surface-container-high"
                  >
                    {/* Executive Avatar */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base border transition-all shadow-inner bg-surface-container-highest border-outline-variant/15 text-on-surface/50 group-hover:text-primary-container">
                      {exec.icon}
                    </div>
                    
                    {/* Session Title & Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-black font-mono text-on-surface uppercase tracking-wider group-hover:text-primary-container transition-colors truncate">
                        {title}
                      </div>
                      <div className="text-[9px] font-mono text-on-surface/30 uppercase mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-primary-container/60">{exec.role} ({exec.name})</span>
                        <span className="w-1 h-1 rounded-full bg-on-surface/10" />
                        <span>{formatDate(conv.updated_at || conv.created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-on-surface/10" />
                        <span className="font-mono text-[8px] opacity-75">{conv.id.substring(0, 8)}</span>
                      </div>
                    </div>
                    
                    {/* Directional Indicator */}
                    <span className="material-symbols-outlined text-[16px] transition-all text-on-surface/20 group-hover:text-primary-container/60 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-[10px] font-mono text-on-surface/20 uppercase tracking-[0.25em] border border-dashed border-outline-variant/10 rounded-2xl">
                No matching sessions archived
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
