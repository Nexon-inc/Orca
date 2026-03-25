'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { getAgentsByDept, Agent, AGENT_ROSTER } from '@/lib/agents';
import DashboardSidebar from '@/components/DashboardSidebar';
import VideoResultCard from '@/components/VideoResultCard';
import WrenCodeCard from '@/components/WrenCodeCard';

export default function DeptWorkspacePage() {
  const params = useParams();
  const deptKey = params.key as string;
  
   const DEPT_MAP: Record<string, string> = {
     'marketing': 'marketing',
     'sales': 'sales',
     'customer': 'cs',
     'cs': 'cs',
     'tech': 'tech',
     'people': 'hiring',
     'hiring': 'hiring',
     'ops': 'ops',
     'finance': 'finance',
     'intelligence': 'intel',
     'intel': 'intel',
     'community': 'community'
   };

   const apiDeptKey = DEPT_MAP[deptKey?.toLowerCase()] || deptKey?.toLowerCase();

   const [dbAgents, setDbAgents] = useState<any[]>([]);
   const [dbDepts, setDbDepts] = useState<any[]>([]);
   const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
   const [conversationId, setConversationId] = useState<string | null>(null);
   const [deptInputText, setDeptInputText] = useState('');
   const [isRouting, setIsRouting] = useState(false);
   const [isLoadingAgents, setIsLoadingAgents] = useState(true);
   const [showAttachMenu, setShowAttachMenu] = useState(false);
   const [attachments, setAttachments] = useState<{name: string, type: string, data: string, text?: string}[]>([]);
   const [messages, setMessages] = useState<{ role: 'user' | 'agent', content: string, senderName?: string, senderIcon?: string, video?: any, wrenCode?: any }[]>([]);
   const [isTyping, setIsTyping] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const threadEndRef = useRef<HTMLDivElement>(null);

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

   useEffect(() => {
     const fetchDepts = async () => {
       try {
         const res = await fetch('/api/departments');
         const data = await res.json();
         if (data.departments) setDbDepts(data.departments);
       } catch (err) {
         console.error('Failed to load depts:', err);
       }
     };
     fetchDepts();
   }, []);

   useEffect(() => {
     const fetchAgents = async () => {
       setIsLoadingAgents(true);
       try {
         const res = await fetch(`/api/departments/${apiDeptKey}/agents`);
         const data = await res.json();
         if (data.agents) {
           const merged = data.agents.map((dbA: any) => {
             const staticA = AGENT_ROSTER.find((s: Agent) => s.id.toLowerCase() === dbA.acronym?.toLowerCase());
             return {
               ...dbA,
               role: dbA.role_description || staticA?.role || 'Agent',
               icon: dbA.icon || staticA?.icon || '🤖',
               prompts: staticA?.prompts || ['Help me with a task'],
               dept: deptKey
             };
           });
           setDbAgents(merged);
           if (merged.length > 0) setSelectedAgent(merged[0]);
         }
       } catch (err) {
         console.error('Failed to load DB agents:', err);
       } finally {
         setIsLoadingAgents(false);
       }
     };
     fetchAgents();
   }, [deptKey, apiDeptKey]);

   useEffect(() => {
     if (!selectedAgent) return;
     const syncConversation = async () => {
       try {
         const historyRes = await fetch(`/api/agents/${selectedAgent.id}/history`);
         const historyData = await historyRes.json();
         if (historyData.history && historyData.history.length > 0) {
           const latestConv = historyData.history[0];
           setConversationId(latestConv.id);
           const formatted = latestConv.messages.map((m: any) => ({
             role: m.sender_type === 'user' ? 'user' : 'agent',
             content: m.content,
             senderName: m.sender_type === 'agent' ? selectedAgent.name : undefined,
             senderIcon: m.sender_type === 'agent' ? selectedAgent.icon : undefined
           }));
           setMessages(formatted.reverse());
         } else {
            setMessages([]);
         }
       } catch (err) {
         console.error('Conversation sync failed:', err);
       }
     };
     syncConversation();
     
     animate('.workspace-anim', {
       opacity: [0, 1],
       y: [20, 0],
       delay: stagger(100),
       duration: 800,
       ease: 'outExpo'
     });
   }, [selectedAgent, deptKey]);

   const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = (event) => {
       const base64Data = (event.target?.result as string).split(',')[1];
       setAttachments(prev => [...prev, { name: file.name, type: 'file', data: base64Data }]);
     };
     reader.readAsDataURL(file);
     setShowAttachMenu(false);
   };

   const handleDeptSend = async () => {
     if (!deptInputText.trim() && attachments.length === 0) return;
     const brief = deptInputText;
     setDeptInputText('');
     setIsRouting(true);
     setMessages(prev => [...prev, { role: 'user', content: brief }]);

     try {
       // 1. Route to agent
       let targetAgent = selectedAgent;
       if (!selectedAgent) {
          const routeRes = await fetch(`/api/departments/${apiDeptKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: brief })
          });
          const routeData = await routeRes.json();
          if (routeData.agent) {
            targetAgent = routeData.agent;
            setSelectedAgent(targetAgent);
          }
       }

       if (!targetAgent) throw new Error('Could not route to an agent');

       // 2. Send message
       setIsTyping(true);
       const historyRes = await fetch(`/api/agents/${targetAgent.id}/history`);
       const historyData = await historyRes.json();
       let activeConvId = historyData.history?.[0]?.id;

       if (!activeConvId) {
         const createRes = await fetch('/api/conversations', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ agent_id: targetAgent.id, department_key: apiDeptKey })
         });
         const createData = await createRes.json();
         activeConvId = createData.conversation?.id;
       }

       const msgRes = await fetch(`/api/conversations/${activeConvId}/messages`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ content: brief, attachments })
       });
       const msgData = await msgRes.json();
       if (msgData.message) {
         setMessages(prev => [...prev, { 
           role: 'agent', 
           content: msgData.message.content,
           senderName: targetAgent.name,
           senderIcon: targetAgent.icon
         }]);
       }
     } catch (err: any) {
       console.error('Send failed:', err);
       setMessages(prev => [...prev, { role: 'agent', content: `Error: ${err.message}` }]);
     } finally {
       setIsRouting(false);
       setIsTyping(false);
       setAttachments([]);
       setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
     }
   };

   return (
     <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
       <DashboardSidebar />
       <main className="flex-1 flex flex-col min-w-0 h-full relative">
         {/* Department Navigation Header */}
         <header className="p-6 border-b border-white/5 bg-surface/30 workspace-anim shrink-0">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
             {dbDepts.map(dept => {
               const isActive = dept.key === deptKey;
               return (
                 <a key={dept.id} href={`/dashboard/dept/${dept.key}`} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 whitespace-nowrap ${isActive ? 'bg-green/10 border-green/20 text-green shadow-[0_4px_15px_rgba(0,255,135,0.15)]' : 'bg-transparent border-transparent text-white/30 hover:text-white hover:bg-white/5'}`}>
                   <span className={`text-xl ${isActive ? 'opacity-100' : 'opacity-40'}`}>{dept.icon || '🏢'}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest">{dept.name}</span>
                 </a>
               );
             })}
           </div>
         </header>

         {/* Messenger Content */}
         <div className="flex-1 flex flex-col overflow-hidden">
           {/* Briefing Input (TOP) */}
           <div className="px-8 py-8 border-b border-white/5 bg-surface/10 workspace-anim shrink-0">
             <div className="max-w-4xl mx-auto space-y-4">
               {attachments.length > 0 && (
                 <div className="flex gap-2 flex-wrap mb-1 animate-in fade-in slide-in-from-top-2 duration-300">
                   {attachments.map((file, idx) => (
                     <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/80">📄 {file.name}
                       <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="ml-1 hover:text-red-400 opacity-60">✕</button>
                     </div>
                   ))}
                 </div>
               )}
               <div className="relative group">
                 <div className="absolute left-3 bottom-3 flex items-center gap-2">
                   <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 hover:text-white hover:bg-white/10 flex items-center justify-center text-2xl transition-all shadow-xl active:scale-95">+</button>
                   {showAttachMenu && (
                     <div className="absolute bottom-14 left-0 w-64 bg-surface rounded-2xl border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                        {ATTACH_SUGGESTIONS[deptKey?.toLowerCase()]?.map(sug => (<button key={sug} onClick={() => { setDeptInputText(sug); setShowAttachMenu(false); }} className="w-full text-left px-3 py-2 text-[11px] text-white/40 hover:text-white hover:bg-white/5 rounded-lg truncate">{sug}</button>))}
                        <div className="my-1 border-t border-white/5" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-white hover:bg-white/5 rounded-lg"><span className="opacity-70">📎</span> Upload file</button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileAttach} />
                     </div>
                   )}
                 </div>
                 <textarea value={deptInputText} onChange={(e) => setDeptInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDeptSend(); } }} placeholder={selectedAgent ? `Command ${selectedAgent.name}...` : `Brief your ${deptKey} team...`} className="w-full bg-bg/40 border border-white/5 focus:border-green/20 rounded-[2.5rem] p-7 pl-16 pr-16 text-[14px] text-white placeholder:text-white/10 resize-none outline-none shadow-inner transition-all min-h-[120px] leading-relaxed" />
                 <button onClick={handleDeptSend} disabled={isRouting} className="absolute right-3 bottom-3 w-12 h-12 rounded-2xl bg-green text-bg flex items-center justify-center text-xl font-bold shadow-[0_4px_25px_rgba(0,255,135,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50">{isRouting ? '...' : '↑'}</button>
               </div>
             </div>
           </div>

           {/* Conversation Thread */}
           <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar pb-40">
             {messages.length === 0 ? (
               <div className="py-24 text-center border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01] flex flex-col items-center opacity-40">
                 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-6 opacity-20">💬</div>
                 <p className="text-[10px] font-black uppercase tracking-[0.5em]">Ready for Command Input</p>
               </div>
             ) : (
               messages.map((msg, i) => (
                 <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} workspace-anim animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                   {msg.role === 'agent' && (
                     <div className="flex items-center gap-3 mb-3 ml-4">
                       <span className="text-2xl">{msg.senderIcon}</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{msg.senderName} Responded</span>
                     </div>
                   )}
                   <div className={`max-w-[80%] p-8 rounded-[3rem] shadow-2xl backdrop-blur-sm ${msg.role === 'user' ? 'bg-green/10 border border-green/20' : 'bg-surface/50 border border-white/5'}`}>
                      <p className="text-[14px] text-white/90 leading-relaxed italic whitespace-pre-wrap">{msg.content}</p>
                   </div>
                 </div>
               ))
             )}
             {isTyping && (
               <div className="flex items-center gap-3 opacity-30 ml-8">
                 <div className="w-2 h-2 rounded-full bg-green animate-bounce" />
                 <div className="w-2 h-2 rounded-full bg-green animate-bounce [animation-delay:0.2s]" />
                 <div className="w-2 h-2 rounded-full bg-green animate-bounce [animation-delay:0.4s]" />
               </div>
             )}
             <div ref={threadEndRef} />
           </div>

           {/* Team Personnel (FOOTER) */}
           <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-bg via-bg/95 to-transparent pointer-events-none">
             <div className="max-w-4xl mx-auto flex flex-col items-center gap-5 pointer-events-auto">
               <div className="flex items-center gap-5 w-full opacity-10">
                 <div className="h-px flex-1 bg-white" />
                 <span className="text-[9px] font-black uppercase tracking-[0.8em] text-white">Personnel</span>
                 <div className="h-px flex-1 bg-white" />
               </div>
               <div className="flex gap-4 p-3 bg-surface/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-3xl">
                 {isLoadingAgents ? [1,2,3].map(i => <div key={i} className="w-16 h-16 bg-white/5 rounded-[1.5rem] animate-pulse" />) : dbAgents.map(agent => (
                   <button key={agent.id} onClick={() => setSelectedAgent(agent)} title={agent.role} className={`group relative flex items-center justify-center w-16 h-16 rounded-[1.75rem] border transition-all duration-500 hover:scale-110 active:scale-90 ${selectedAgent?.id === agent.id ? 'bg-green/10 border-green/40 shadow-[0_0_30px_rgba(0,255,135,0.2)] ring-1 ring-green/30' : 'bg-white/5 border-transparent grayscale hover:grayscale-0 hover:border-white/10 hover:bg-white/10'}`}>
                     <span className="text-3xl transition-transform duration-500 group-hover:scale-110 group-active:scale-95">{agent.icon}</span>
                     <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-bg border border-white/10 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all shadow-3xl translate-y-2 group-hover:translate-y-0 pointer-events-none z-50 whitespace-nowrap">
                       {agent.name}
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           </div>
         </div>
       </main>
     </div>
   );
}
