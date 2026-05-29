'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';
import { createClient } from '@/lib/supabase/client';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { toast } from 'sonner';

const EXECUTIVE_DETAILS: Record<string, { role: string; icon: string; border: string; key: string }> = {
  CMO: { role: 'Marketing', icon: '🎙️', border: 'border-l-[#00FF87]', key: 'cmo' },
  CSO: { role: 'Sales', icon: '💰', border: 'border-l-[#3b82f6]', key: 'cso' },
  CCO: { role: 'Customer Success', icon: '🛟', border: 'border-l-[#a855f7]', key: 'cco' },
  CIO: { role: 'Intelligence', icon: '🏛️', border: 'border-l-[#ec4899]', key: 'cio' },
  CTO: { role: 'Technology', icon: '👻', border: 'border-l-[#f59e0b]', key: 'cto' },
  CEO: { role: 'Atlas (CEO/Ops)', icon: '🏦', border: 'border-l-[#10b981]', key: 'ceo' },
  User: { role: 'CEO Document', icon: '📄', border: 'border-l-[#6b7280]', key: 'user' },
};

export default function BriefingRoomPage() {
  const router = useRouter();
  const { orgId, loading: roleLoading } = useRole();
  const [briefings, setBriefings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    if (roleLoading || !orgId) return;

    const fetchBriefings = async () => {
      try {
        const { data, error } = await supabase
          .from('briefings')
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false });

        if (error) {
          toast.error(`Error loading briefings: ${error.message}`);
        } else {
          setBriefings(data || []);
        }
      } catch (err) {
        toast.error('Failed to load briefings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBriefings();
  }, [orgId, roleLoading]);

  // Download plain text function
  const handleDownload = (e: React.MouseEvent, title: string, content: string) => {
    e.stopPropagation();
    e.preventDefault();
    const stripped = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/>/g, '');
    const blob = new Blob([stripped], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Briefing downloaded successfully');
  };

  // Export to Google Drive function
  const handleSendToDrive = async (e: React.MouseEvent, id: string, title: string, content: string) => {
    e.stopPropagation();
    e.preventDefault();
    const promise = fetch('/api/integrations/google/drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefingId: id, title, content })
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

  const getCardDetails = (brief: any) => {
    if (brief.document_type === 'user_document' || brief.agent_acronym === 'CEO') {
      if (brief.document_type === 'user_document') {
        return EXECUTIVE_DETAILS.User;
      }
      return EXECUTIVE_DETAILS.CEO;
    }
    return EXECUTIVE_DETAILS[brief.agent_acronym] || EXECUTIVE_DETAILS.CEO;
  };

  // Filter logic
  const filteredBriefings = briefings.filter(brief => {
    const details = getCardDetails(brief);
    const matchesTab = activeTab === 'All' || details.key.toUpperCase() === activeTab.toUpperCase();
    const matchesSearch = 
      brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (brief.agent_name && brief.agent_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  const filterTabs = ['All', 'CMO', 'CSO', 'CCO', 'CIO', 'CTO', 'Atlas'];

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="briefing-room" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto p-12 no-scrollbar space-y-8 pb-32">
          {/* Header & Top Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase flex items-center gap-3">
                BRIEFING ROOM
                <span className="text-[10px] font-mono border border-outline-variant/20 px-2 py-0.5 rounded text-on-surface/30 tracking-[0.2em] font-normal uppercase">
                  Vault
                </span>
              </h1>
              <p className="font-body text-xs text-on-secondary-container mt-2 max-w-xl">
                Your executive intelligence. Structured and searchable.
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              {/* Search */}
              <div className="bg-[#121412] border border-outline-variant/10 rounded-xl px-4 py-2 flex items-center gap-2 w-64 focus-within:border-primary-container/40 transition-all">
                <span className="material-symbols-outlined text-[16px] text-on-surface/30">search</span>
                <input 
                  type="text" 
                  placeholder="Search briefings..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 text-xs font-body w-full text-on-surface placeholder:text-on-surface/20"
                />
              </div>

              {/* New Brief Button */}
              <Link 
                href="/dashboard/chat"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-container text-on-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(0,195,103,0.15)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">add</span> New Brief
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-outline-variant/10 gap-6 overflow-x-auto no-scrollbar">
            {filterTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all shrink-0 ${activeTab === tab ? 'border-primary-container text-primary-container' : 'border-transparent text-on-surface/40 hover:text-on-surface'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Briefings List */}
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center gap-3 text-[10px] font-mono text-primary-container/40 uppercase tracking-widest animate-pulse">
                <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                Accessing briefing archives...
              </div>
            ) : filteredBriefings.length > 0 ? (
              filteredBriefings.map(brief => {
                const details = getCardDetails(brief);
                const isUserDoc = brief.document_type === 'user_document';
                const createdDate = new Date(brief.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }).toUpperCase();
                
                // Content preview text
                const previewText = brief.content
                  .replace(/#{1,6}\s/g, '')
                  .replace(/[*_`>]/g, '')
                  .substring(0, 140) + '...';

                // Highlights length
                const highlightCount = Array.isArray(brief.highlights) ? brief.highlights.length : 0;
                
                // Tasks length
                const taskCount = Array.isArray(brief.tasks) ? brief.tasks.length : 0;

                return (
                  <Link 
                    key={brief.id}
                    href={`/dashboard/briefing-room/${brief.id}`}
                    className={`bg-[#1b211d] rounded-xl border border-outline-variant/5 border-l-2 ${details.border} p-6 flex flex-col justify-between hover:bg-[#343b36] hover:border-outline-variant/15 transition-all duration-300 group relative cursor-pointer`}
                  >
                    <div>
                      {/* Top Header info */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black font-mono text-primary-container uppercase tracking-[0.25em] flex items-center gap-1.5">
                          <span>{details.icon}</span>
                          <span>{isUserDoc ? 'CEO DOCUMENT' : `${brief.agent_name} · ${details.role}`}</span>
                        </span>
                        <span className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest">{createdDate}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold font-headline text-white mb-2 uppercase group-hover:text-primary-container transition-colors tracking-wide">
                        {brief.title}
                      </h3>

                      {/* Content Preview */}
                      <p className="text-[11px] font-body text-on-surface/40 leading-relaxed line-clamp-2 pr-12 mb-4">
                        "{previewText}"
                      </p>
                    </div>

                    {/* Metadata Pills and Actions */}
                    <div className="flex flex-wrap items-center justify-between border-t border-outline-variant/5 pt-4 gap-4">
                      {/* Metadata Pills */}
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 bg-surface/40 border border-outline-variant/10 rounded-full text-[8px] font-mono text-on-surface/40 uppercase tracking-wider">
                          ● {brief.word_count || 0} WORDS
                        </div>
                        <div className="px-2.5 py-1 bg-surface/40 border border-outline-variant/10 rounded-full text-[8px] font-mono text-on-surface/40 uppercase tracking-wider">
                          ● {taskCount} TASKS
                        </div>
                        <div className="px-2.5 py-1 bg-surface/40 border border-outline-variant/10 rounded-full text-[8px] font-mono text-on-surface/40 uppercase tracking-wider">
                          ● {highlightCount} HIGHLIGHTS
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 relative z-10">
                        <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary-container bg-primary-container/10 border border-primary-container/20 rounded-lg group-hover:bg-primary-container group-hover:text-on-primary transition-all flex items-center gap-1">
                          Open <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </span>
                        <button 
                          onClick={(e) => handleDownload(e, brief.title, brief.content)}
                          className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-on-surface/40 hover:text-on-surface bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                        >
                          Download
                        </button>
                        <button 
                          onClick={(e) => handleSendToDrive(e, brief.id, brief.title, brief.content)}
                          className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-on-surface/40 hover:text-on-surface bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">google_wifi</span> Send to Drive
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-24 text-center text-[10px] font-mono text-on-surface/20 uppercase tracking-[0.25em] border border-dashed border-outline-variant/10 rounded-2xl">
                No briefings saved in the vault yet
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
