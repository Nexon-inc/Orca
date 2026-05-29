'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';
import { createClient } from '@/lib/supabase/client';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const EXECUTIVE_DETAILS: Record<string, { role: string; icon: string; border: string; key: string }> = {
  CMO: { role: 'Marketing', icon: '🎙️', border: 'border-l-[#00FF87]', key: 'cmo' },
  CSO: { role: 'Sales', icon: '💰', border: 'border-l-[#3b82f6]', key: 'cso' },
  CCO: { role: 'Customer Success', icon: '🛟', border: 'border-l-[#a855f7]', key: 'cco' },
  CIO: { role: 'Intelligence', icon: '🏛️', border: 'border-l-[#ec4899]', key: 'cio' },
  CTO: { role: 'Technology', icon: '👻', border: 'border-l-[#f59e0b]', key: 'cto' },
  CEO: { role: 'Atlas (CEO/Ops)', icon: '🏦', border: 'border-l-[#10b981]', key: 'ceo' },
  User: { role: 'CEO Document', icon: '📄', border: 'border-l-[#6b7280]', key: 'user' },
};

export default function BriefingDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { orgId, loading: roleLoading } = useRole();
  const [brief, setBrief] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extractedHighlights, setExtractedHighlights] = useState<string[]>([]);
  const [parsedTasks, setParsedTasks] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    if (roleLoading || !orgId || !id) return;

    const fetchBriefingDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('briefings')
          .select('*')
          .eq('id', id)
          .eq('org_id', orgId)
          .single();

        if (error) {
          toast.error(`Error loading briefing details: ${error.message}`);
        } else if (data) {
          setBrief(data);
          
          // 1. Dynamic Highlights Extraction
          // Rules: bullet points containing numbers with % or $ signs,
          // words like "urgent", "immediately", "critical", "warning", "opportunity",
          // or list items in the first 200 words.
          const lines = data.content.split('\n');
          const highlightsList: string[] = [];
          const listItemsFirst200Words: string[] = [];
          
          let totalWordsProcessed = 0;

          lines.forEach((line: string) => {
            const trimmed = line.trim();
            const words = trimmed.split(/\s+/);
            const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');

            if (isBullet) {
              const textContent = trimmed.substring(2).trim();
              const hasPercentageOrCash = /[\d%]|[\d\$]/.test(textContent) && (textContent.includes('%') || textContent.includes('$'));
              const hasUrgentWords = /\b(urgent|immediately|critical|warning|opportunity|danger|attention)\b/i.test(textContent);
              const isFirst200 = totalWordsProcessed < 200;

              if (hasPercentageOrCash || hasUrgentWords) {
                highlightsList.push(textContent);
              } else if (isFirst200) {
                listItemsFirst200Words.push(textContent);
              }
            }

            if (trimmed !== '') {
              totalWordsProcessed += words.length;
            }
          });

          // Combine specific matches with early bullets up to a max of 5
          const finalHighlights = [...new Set([...highlightsList, ...listItemsFirst200Words])].slice(0, 5);
          setExtractedHighlights(finalHighlights);

          // 2. Parse Tasks in Progress
          // Try to load tasks from jsonb field first. Fallback to parsing from markdown if empty.
          if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
            setParsedTasks(data.tasks);
          } else {
            // Find task items like "- [ ] task" or "- [x] task" in markdown
            const tasksList: any[] = [];
            lines.forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
                const checked = trimmed.startsWith('- [x] ');
                const title = trimmed.substring(6).trim();
                tasksList.push({ title, status: checked ? 'done' : 'pending' });
              }
            });
            setParsedTasks(tasksList);
          }
        }
      } catch (err) {
        toast.error('Failed to load briefing details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBriefingDetails();
  }, [orgId, id, roleLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-surface">
        <DashboardSidebar active="briefing-room" />
        <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg items-center justify-center text-[10px] font-mono text-primary-container/40 uppercase tracking-widest animate-pulse">
          <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin mb-3" />
          Synchronizing document feed...
        </main>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="flex h-screen bg-surface">
        <DashboardSidebar active="briefing-room" />
        <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg items-center justify-center text-center p-8">
          <span className="material-symbols-outlined text-4xl text-error/30 animate-pulse">warning</span>
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-on-surface/30 mt-4">Document Not Found</h3>
          <p className="text-[9px] font-mono text-on-surface/20 uppercase mt-2 max-w-sm leading-relaxed">
            The requested briefing file does not exist or has been removed from this organization's database tier.
          </p>
          <Link href="/dashboard/briefing-room" className="mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-on-surface hover:bg-white/10 transition-all">
            ← Back to Briefing Room
          </Link>
        </main>
      </div>
    );
  }

  const details = brief.document_type === 'user_document' || brief.agent_acronym === 'CEO' 
    ? (brief.document_type === 'user_document' ? EXECUTIVE_DETAILS.User : EXECUTIVE_DETAILS.CEO)
    : (EXECUTIVE_DETAILS[brief.agent_acronym] || EXECUTIVE_DETAILS.CEO);

  const formattedDate = new Date(brief.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();

  const formattedTime = new Date(brief.created_at).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Export to Google Drive
  const handleSendToDrive = async () => {
    const promise = fetch('/api/integrations/google/drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefingId: brief.id, title: brief.title, content: brief.content })
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send to Google Drive');
      return data;
    });

    toast.promise(promise, {
      loading: 'Exporting briefing to Google Drive...',
      success: (data) => data.message || 'Sent to Google Drive ✓',
      error: (err) => err.message || 'Failed to export'
    });
  };

  // Download plain text
  const handleDownload = () => {
    const stripped = brief.content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/>/g, '');
    const blob = new Blob([stripped], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded successfully');
  };

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="briefing-room" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-12 no-scrollbar pb-32">
          {/* Back Button */}
          <Link 
            href="/dashboard/briefing-room"
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-on-surface/40 hover:text-primary-container transition-colors mb-8 cursor-pointer w-fit"
          >
            <span className="material-symbols-outlined text-xs">arrow_back</span> Back to Briefing Room
          </Link>

          {/* Document container */}
          <div className="bg-[#0f110f] border border-outline-variant/10 rounded-2xl p-8 shadow-2xl relative select-text selection:bg-[#00c3672d] space-y-6">
            
            {/* Header info */}
            <div className="border-b border-outline-variant/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black font-mono text-primary-container uppercase tracking-[0.25em] flex items-center gap-1.5">
                  <span>{details.icon}</span>
                  <span>{brief.document_type === 'user_document' ? 'CEO DOCUMENT' : `${brief.agent_name} · ${details.role}`}</span>
                </span>
                <h1 className="text-xl font-bold font-headline text-white mt-2 uppercase tracking-wide">
                  {brief.title}
                </h1>
              </div>
              <div className="text-left sm:text-right font-mono text-[9px] text-on-surface/40 uppercase tracking-widest shrink-0">
                <div>{formattedDate}</div>
                <div className="mt-1">{formattedTime}</div>
              </div>
            </div>

            {/* Feature 1 highlights parsing */}
            {extractedHighlights.length > 0 && (
              <div className="bg-primary-container/5 border border-primary-container/10 border-l-[3px] border-l-[#00FF87] rounded-xl p-5 space-y-3">
                <div className="text-[9px] font-black text-primary-container uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">bolt</span> Key Highlights
                </div>
                <ul className="space-y-1.5 pl-1">
                  {extractedHighlights.map((hl, i) => (
                    <li key={i} className="text-[11px] text-[#AEB8B0] flex items-start gap-2">
                      <span className="text-[#00FF87] mt-0.5">•</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feature 1 Tasks in Progress list */}
            {parsedTasks.length > 0 && (
              <div className="bg-surface-container-high/40 border border-outline-variant/10 rounded-xl p-5 space-y-3">
                <div className="text-[9px] font-black text-primary-container uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">rule</span> Tasks in Progress
                </div>
                <div className="space-y-2">
                  {parsedTasks.map((task, i) => {
                    const isDone = task.status === 'done' || task.status === 'completed';
                    
                    return (
                      <div key={i} className="flex items-start justify-between gap-4 border-b border-outline-variant/5 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start gap-2.5 text-[11px] text-[#AEB8B0]">
                          <span className={`material-symbols-outlined text-xs mt-0.5 select-none ${isDone ? 'text-[#00FF87]' : 'text-on-surface/20'}`}>
                            {isDone ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span className={isDone ? 'line-through opacity-45' : ''}>{task.title}</span>
                        </div>
                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isDone ? (
                            <span className="px-2 py-0.5 rounded bg-green/10 border border-green/20 text-[#00FF87] text-[8px] font-mono uppercase tracking-wider">
                              [Done]
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-primary-container/10 border border-primary-container/20 text-primary-container text-[8px] font-mono uppercase tracking-wider flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-spin" style={{ borderRightColor: 'transparent' }} />
                              [Live]
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Markdown Body */}
            <div className="prose prose-invert max-w-none pt-4 text-[#AEB8B0] text-[13px] leading-relaxed select-text space-y-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h2 className="text-lg font-bold font-headline text-white border-b border-[#3b4b3d] pb-2 mt-6 mb-4 uppercase tracking-wide">
                      {children}
                    </h2>
                  ),
                  h2: ({ children }) => (
                    <h3 className="text-md font-bold font-headline text-white mt-5 mb-3 uppercase tracking-wide">
                      {children}
                    </h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className="text-sm font-semibold font-headline text-white mt-4 mb-2 uppercase tracking-wide">
                      {children}
                    </h4>
                  ),
                  strong: ({ children }) => <strong className="text-white font-black">{children}</strong>,
                  em: ({ children }) => <em className="text-[#AEB8B0] italic">{children}</em>,
                  ul: ({ children }) => <ul className="space-y-1.5 my-3 pl-4 list-disc marker:text-[#00FF87]">{children}</ul>,
                  ol: ({ children }) => <ol className="space-y-1.5 my-3 pl-4 list-decimal marker:text-[#00FF87]">{children}</ol>,
                  li: ({ children }) => <li className="text-[#AEB8B0] pl-1">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#00FF87]/40 bg-[#0d1f13] px-5 py-3 rounded-r-xl italic my-4 text-[#AEB8B0]">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-6 border-[#3b4b3d]" />,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#00FF87] hover:underline transition-all">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border border-[#3b4b3d] rounded-xl bg-[#0d1f13] shadow-md">
                      <table className="min-w-full divide-y divide-[#3b4b3d] text-[11px] font-mono tracking-tighter uppercase font-black">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-[#121412] text-white/50">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-[#3b4b3d]/30 text-white/70">{children}</tbody>,
                  tr: ({ children }) => <tr className="hover:bg-white/[0.01] odd:bg-[#0d1f13] even:bg-[#121412]/30">{children}</tr>,
                  th: ({ children }) => <th className="px-4 py-3 text-left font-semibold">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-2 leading-relaxed">{children}</td>,
                  code: ({ inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <div className="my-4 border border-[#00FF87]/30 border-l-[3px] border-l-[#00FF87] rounded-xl overflow-hidden bg-[#0a100c] shadow-md animate-in fade-in duration-300">
                        <div className="bg-[#0d130e] px-4 py-2 border-b border-[#3b4b3d]/10 flex items-center justify-between">
                          <span className="text-[9px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-[#00FF87] uppercase font-bold font-mono">{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                              toast.success('Code block copied');
                            }}
                            className="p-1 hover:bg-white/5 rounded text-[#00FF87] hover:text-[#00FF87]/80 transition-all flex items-center gap-1 text-[8px] uppercase tracking-wider font-bold"
                          >
                            <span className="material-symbols-outlined text-[10px]">content_copy</span> Copy
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-[11px] font-mono text-[#a9b1d6] leading-relaxed max-h-[300px] overflow-y-auto no-scrollbar select-text selection:bg-[#00c3672d]">
                          <code>{children}</code>
                        </pre>
                      </div>
                    ) : (
                      <code className="px-1.5 py-0.5 bg-[#0a100c] border border-outline-variant/10 rounded font-mono text-xs text-white" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {brief.content}
              </ReactMarkdown>
            </div>

            {/* Bottom Actions footer */}
            <div className="border-t border-outline-variant/10 pt-6 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-on-surface transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">download</span> Download .txt
                </button>
                <button 
                  onClick={handleSendToDrive}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-on-surface transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">google_wifi</span> Send to Drive
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    toast.success('Briefing approved ✓');
                    router.push('/dashboard/briefing-room');
                  }}
                  className="px-5 py-2 bg-primary-container text-on-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(0,195,103,0.15)] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">check</span> Approve
                </button>
                <button 
                  onClick={() => {
                    toast.error('Briefing rejected ✗');
                    router.push('/dashboard/briefing-room');
                  }}
                  className="px-5 py-2 border border-error/30 text-error hover:bg-error/15 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">close</span> Reject
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
