'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { getAgentsByDept, Agent } from '@/lib/agents';
import DashboardSidebar from '@/components/DashboardSidebar';
import VideoResultCard from '@/components/VideoResultCard';
import WrenCodeCard from '@/components/WrenCodeCard';

export default function DeptWorkspacePage() {
  const params = useParams();
  const deptKey = params.key as string;
  
  const agents = useMemo(() => getAgentsByDept(deptKey?.toLowerCase() || ''), [deptKey]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showNewBriefMenu, setShowNewBriefMenu] = useState(false);
  const [attachments, setAttachments] = useState<{name: string, type: string, data: string, text?: string}[]>([]);
  const [messages, setMessages] = useState<{ role: 'user' | 'agent', content: string, video?: any, wrenCode?: any }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = '52px';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const ATTACH_SUGGESTIONS: Record<string, string[]> = {
    marketing: ['Brand guidelines PDF', 'Previous content examples', 'Campaign brief'],
    sales: ['Lead list CSV', 'Product one-pager', 'CRM export'],
    customer: ['Customer feedback CSV', 'Support ticket export', 'NPS results'],
    tech: ['Code file', 'Repository doc', 'Error logs TXT'],
    people: ['Job description', 'Candidate CV PDF', 'Interview scorecard'],
    ops: ['Project brief', 'Meeting notes', 'Process SOP'],
    finance: ['Invoice PDF', 'Expense CSV', 'Contract PDF'],
    intelligence: ['Research PDF', 'Market data CSV', 'Industry report'],
    community: ['Partnership proposal', 'Influencer list CSV', 'Growth brief'],
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);
    const isImage = file.type.startsWith('image/');
    const isCode = ['ts', 'js', 'py', 'go', 'json'].some(ext => file.name.endsWith(`.${ext}`));

    if (isImage && sizeInMB > 5) { alert('Images must be under 5MB'); return; }
    if (isCode && sizeInMB > 2) { alert('Code files must be under 2MB'); return; }
    if (!isImage && !isCode && sizeInMB > 10) { alert('Documents must be under 10MB'); return; }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      let typeStr = 'pdf'; 
      if (isImage) typeStr = 'image';
      else if (isCode) typeStr = 'code';
      else if (file.name.endsWith('.csv')) typeStr = 'csv';
      else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) typeStr = 'txt';
      
      let textContent = '';
      if (!isImage) {
          try {
             textContent = file.type.includes('pdf') || file.type.includes('word') 
                 ? `[Extracted simulated text content for document ${file.name}]` 
                 : decodeURIComponent(escape(atob(base64Data)));
          } catch {
             textContent = `[Could not extract text from document ${file.name}]`;
          }
      }
      
      setAttachments(prev => [...prev, {
        name: file.name,
        type: typeStr,
        data: base64Data,
        text: textContent
      }]);
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  const parseVideoTag = (text: string) => {
    const regex = /\[GENERATE_VIDEO: template=([^,]+), (.*)\]/;
    const match = text.match(regex);
    if (match) {
      const template = match[1].trim();
      const propsStr = match[2].trim();
      const props: any = {};
      
      propsStr.split(', ').forEach(pair => {
        const [key, val] = pair.split('=');
        if (!key || !val) return;
        try {
          props[key.trim()] = JSON.parse(val.trim());
        } catch {
          props[key.trim()] = val.trim().replace(/^"(.*)"$/, '$1');
        }
      });
      return { template, props };
    }
    return null;
  };

  const parseWrenCode = (text: string) => {
    const fileMatch = text.match(/FILE:\s*(.+?)\n/);
    const codeMatch = text.match(/```(?:typescript|tsx|javascript|js)?\n([\s\S]+?)```/);
    const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]+?)(?:HOW TO USE|$)/);
    const prMatch = text.includes('[OPEN_PR:');

    if (fileMatch && codeMatch) {
      return {
        filePath: fileMatch[1].trim(),
        code: codeMatch[1].trim(),
        explanation: explanationMatch ? explanationMatch[1].trim() : 'Code generated by Wren.',
        hasPr: prMatch
      };
    }
    return null;
  };

  const handleSend = async () => {
    if (!inputText.trim() && attachments.length === 0) return;

    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      let agentResponse = `Acknowledged. Processing strategic directive for the ${deptKey} department.`;
      
      if (selectedAgent?.id === 'eric' && userMsg.toLowerCase().includes('video')) {
        agentResponse = `Understood. I have designed a high-converting Ad video for the current campaign. [GENERATE_VIDEO: template=AdTemplate, headline="Revolutionize Workflow", subheadline="AI Autonomy for your entire team.", cta="Start Trial"]`;
      } else if (selectedAgent?.id === 'aria' && userMsg.toLowerCase().includes('video')) {
         agentResponse = `I have scripted a dynamic social teaser for our next update. [GENERATE_VIDEO: template=SocialTemplate, text="Major Update Incoming"]`;
      } else if (selectedAgent?.id === 'jackie' && userMsg.toLowerCase().includes('video')) {
         agentResponse = `I've prepared a concise video summary of our latest research insights. [GENERATE_VIDEO: template=BlogSummary, title="The Future of AI", points=["Autonomous Agents", "Ecosystem Scaling"]]`;
      }

      const videoData = parseVideoTag(agentResponse);
      const wrenData = parseWrenCode(agentResponse);
      
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: agentResponse
          .replace(/\[GENERATE_VIDEO: .*\]/, '')
          .replace(/FILE:[\s\S]*?EXPLANATION:[\s\S]*?(?:HOW TO USE|$)/, '') // Hide the raw code blocks if card is shown
          .trim(),
        video: videoData,
        wrenCode: wrenData
      }]);
      setIsTyping(false);
      
      setTimeout(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1500);
  };


  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  useEffect(() => {
    if (selectedAgent) {
      animate('.workspace-anim', {
        opacity: [0, 1],
        y: [20, 0],
        delay: stagger(100),
        duration: 800,
        ease: 'outExpo'
      });
    }
  }, [selectedAgent]);

  if (!selectedAgent && agents.length === 0) {
    return (
      <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
        <DashboardSidebar />
        <div className="p-20 text-white/20 font-dm-mono uppercase tracking-widest font-black">Department protocol not found...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Workspace Header */}
        <header className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 workspace-anim shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-green/10 border border-green/20 flex items-center justify-center text-4xl relative group">
              <span className="group-hover:scale-110 transition-transform duration-500">{selectedAgent?.icon}</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green border-4 border-bg" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-syne text-3xl font-[800] text-white uppercase tracking-tight">{selectedAgent?.name}</h1>
                <span className="font-dm-mono text-[9px] text-green border border-green/20 bg-green/10 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Autonomous</span>
              </div>
               <p className="font-dm-mono text-[11px] text-white/40 font-[900] uppercase tracking-[0.2em]">{selectedAgent?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="btn-secondary text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-widest border border-white/10 hover:bg-white/5 outline-none">History</button>
             <div className="relative">
               <button 
                 onClick={() => setShowNewBriefMenu(!showNewBriefMenu)}
                 className="btn-primary text-[10px] font-black px-8 py-2.5 rounded-xl uppercase tracking-widest shadow-[0_4px_20px_rgba(0,255,135,0.2)] active:scale-95 transition-all outline-none"
               >
                 New Brief +
               </button>
               {showNewBriefMenu && (
                 <div className="absolute top-12 right-0 w-48 bg-surface rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-2 z-50 font-dm-mono animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => { setShowNewBriefMenu(false); document.querySelector('textarea')?.focus(); }} className="w-full text-left px-3 py-2 text-[10px] font-black tracking-widest uppercase text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3">
                       <span className="text-sm opacity-70">📄</span> Blank Brief
                    </button>

                 </div>
               )}
             </div>
          </div>
        </header>

        {/* Agent Roster Tab Bar */}
        <div className="px-8 bg-surface/30 border-b border-white/5 flex gap-1 overflow-x-auto no-scrollbar pt-4 shrink-0">
          {agents.map(agent => (
            <button 
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`flex flex-col items-center gap-2 px-6 py-3 rounded-t-2xl border-x border-t transition-all duration-300 min-w-[100px] outline-none ${
                selectedAgent?.id === agent.id 
                ? 'bg-bg border-white/5 text-white shadow-[0_-10px_20px_rgba(0,0,0,0.2)]' 
                : 'bg-transparent border-transparent text-white/40 hover:text-white'
              }`}
            >
              <span className="text-xl">{agent.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{agent.name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Message Thread */}
            <div className="flex-1 flex flex-col border-r border-white/5 overflow-hidden">
              <div className="flex-1 p-8 overflow-y-auto space-y-10 messenger-thread no-scrollbar">
                {messages.length === 0 ? (
                  <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01] workspace-anim">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-xl mx-auto mb-6 opacity-20">💬</div>
                    <p className="font-dm-mono text-[11px] text-white/10 font-black uppercase tracking-[0.3em]">Initialize mission parameters to begin coordination</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} workspace-anim`}>
                       <div className={`max-w-[80%] p-6 rounded-[2rem] ${
                         msg.role === 'user' ? 'bg-green/10 border border-green/20' : 'bg-surface/30 border border-white/5'
                       }`}>
                          <p className="text-[13px] text-white/80 leading-relaxed font-dm-mono italic whitespace-pre-wrap">
                            {msg.content}
                          </p>
                       </div>
                       {msg.video && (
                         <VideoResultCard 
                           id={`vid-${i}`}
                           template={msg.video.template}
                           props={msg.video.props}
                           orgId="demo-org-123" 
                         />
                       )}
                       {msg.wrenCode && (
                         <WrenCodeCard
                           id={`wren-${i}`}
                           filePath={msg.wrenCode.filePath}
                           code={msg.wrenCode.code}
                           explanation={msg.wrenCode.explanation}
                           hasPr={msg.wrenCode.hasPr}
                         />
                       )}
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex items-center gap-2 opacity-40">
                    <div className="w-2 h-2 rounded-full bg-green animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-green animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-green animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={threadEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-8 pb-8 pt-4 border-t border-white/5 bg-surface/20 shrink-0">
                 <div className="relative max-w-4xl mx-auto flex flex-col items-start gap-2">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar w-full">
                      {selectedAgent?.prompts.slice(0, 3).map(p => (
                        <button key={p} 
                          onClick={() => setInputText(p)}
                          className="px-4 py-2 rounded-full border border-white/10 bg-bg hover:bg-white/5 text-[11px] font-dm-mono font-black text-white/60 hover:text-white uppercase tracking-tight whitespace-nowrap transition-all"
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    {attachments.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-1 w-full">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-white/10 bg-white/5 font-dm-mono text-[11px] text-white/80">
                             📄 {file.name}
                            <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="hover:text-red-400 opacity-60 hover:opacity-100 ml-1">✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="relative w-full flex items-end bg-bg/50 border border-white/10 focus-within:border-green/30 rounded-[1.5rem] shadow-inner transition-all p-2 gap-2">
                      <div className="relative shrink-0">
                        <button 
                          onClick={() => setShowAttachMenu(!showAttachMenu)}
                          className="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center text-2xl font-light transition-all"
                        >
                          +
                        </button>
                        {showAttachMenu && (
                          <div className="absolute bottom-12 left-0 w-64 bg-surface rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-2 z-50 font-dm-mono animate-in fade-in slide-in-from-bottom-2 duration-200">
                             <div className="px-3 py-2 border-b border-white/5 mb-1">
                               <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Suggested Uploads</p>
                             </div>
                             {ATTACH_SUGGESTIONS[selectedAgent?.dept || '']?.map(sug => (
                               <button key={sug} className="w-full text-left px-3 py-2 text-[11px] text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors truncate">
                                 {sug}
                               </button>
                             ))}
                             <div className="my-1 border-t border-white/5"></div>
                             <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-white hover:bg-white/5 rounded-lg transition-colors">
                               <span className="opacity-70 text-base">📎</span> Upload file
                             </button>
                             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileAttach} />
                          </div>
                        )}
                      </div>
                      <textarea 
                        value={inputText}
                        onChange={handleInput}
                        placeholder={`Command ${selectedAgent?.name}...`}
                        className="flex-1 bg-transparent font-dm-mono text-[14px] text-white placeholder:text-white/20 resize-none outline-none no-scrollbar py-2.5 leading-relaxed"
                        style={{ minHeight: '52px', maxHeight: '120px', height: '52px', overflowY: 'auto' }}
                      />
                      <button 
                        onClick={handleSend}
                        className="w-10 h-10 shrink-0 rounded-xl bg-green text-bg flex items-center justify-center text-lg font-bold shadow-[0_4px_15px_rgba(0,255,135,0.3)] hover:scale-105 active:scale-95 transition-all outline-none"
                      >
                         ↑
                      </button>
                    </div>
                 </div>
                 <p className="mt-4 text-center text-[9px] text-white/10 font-black uppercase tracking-[0.3em]">Foundational Intelligence Layer Active</p>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
