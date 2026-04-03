'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { getAgentsByDept, Agent, AGENT_ROSTER } from '@/lib/agents';
import DashboardSidebar from '@/components/DashboardSidebar';
import VideoResultCard from '@/components/VideoResultCard';
import WrenCodeCard from '@/components/WrenCodeCard';
import { useMission } from '@/context/MissionContext';

export default function DeptWorkspacePage() {
  const params = useParams();
  const deptKey = (params.key as string) || 'marketing';
  const { processingDepts, startMission, completeMission } = useMission();
  
  const DEPT_MAP: Record<string, string> = {
    'marketing': 'marketing',
    'sales': 'sales',
    'customer': 'cs',
    'cs': 'cs',
    'tech': 'tech',
    'intelligence': 'intel',
    'intel': 'intel',
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
  const [techMode, setTechMode] = useState<'build_for_me' | 'build_with_me' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const ATTACH_SUGGESTIONS: Record<string, string[]> = {
    marketing: ['Brand guidelines PDF', 'Previous content examples', 'Campaign brief'],
    sales: ['Lead list CSV', 'Product one-pager', 'CRM export'],
    customer: ['Customer feedback CSV', 'Support ticket export', 'NPS results'],
    tech: ['Code file', 'Repository doc', 'Error logs TXT', 'Vibe coding spec'],
    intelligence: ['Research PDF', 'Market data CSV', 'Industry report'],
  };

  // Static list for UI consistency (includes Coming Soon depts)
  const UI_DEPTS = [
    { key: 'marketing', name: 'Marketing', icon: '📣' },
    { key: 'sales', name: 'Sales & Revenue', icon: '💼' },
    { key: 'cs', name: 'Customer Success', icon: '🤝' },
    { key: 'intel', name: 'Intelligence & Research', icon: '🔍' },
    { key: 'tech', name: 'Tech & Vibe Coding', icon: '🛡️' },
    { key: 'hiring', name: 'People & Hiring', icon: '🧠', comingSoon: true },
    { key: 'ops', name: 'Operations', icon: '📋', comingSoon: true },
    { key: 'finance', name: 'Finance & Legal', icon: '📊', comingSoon: true },
    { key: 'community', name: 'Community & Growth', icon: '🌐', comingSoon: true },
  ];

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        if (data.departments) {
          setDbDepts(data.departments);
          const thisDept = data.departments.find((d: any) => d.key === apiDeptKey);
          if (thisDept?.tech_mode) {
            setTechMode(thisDept.tech_mode);
          }
        }
      } catch (err) {
        console.error('Failed to load depts:', err);
      }
    };
    fetchDepts();
  }, [apiDeptKey]);

  useEffect(() => {
    const fetchAgents = async () => {
      if (UI_DEPTS.find(d => d.key === deptKey)?.comingSoon) return;
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
        if (!historyRes.ok) throw new Error('Failed to fetch conversation history');
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

  useEffect(() => {
    if (isTyping || isRouting) {
      startMission(deptKey);
    } else {
      completeMission(deptKey);
    }
  }, [isTyping, isRouting, deptKey, startMission, completeMission]);

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
      let targetAgent = selectedAgent;
      if (!targetAgent) {
         const routeRes = await fetch(`/api/departments/${apiDeptKey}`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ content: brief })
         });
         if (!routeRes.ok) throw new Error('Routing failure');
         const routeData = await routeRes.json();
         if (routeData.agent) {
            targetAgent = dbAgents.find(a => a.id === routeData.agent.id) || routeData.agent;
            setSelectedAgent(targetAgent);
         }
      }

      if (!targetAgent) throw new Error('Coordination Error');

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
      console.error('Action Failed:', err);
      setMessages(prev => [...prev, { role: 'agent', content: `CRITICAL ERROR: ${err.message}`, senderName: 'SYSTEM', senderIcon: '⚠️' }]);
    } finally {
      setIsRouting(false);
      setIsTyping(false);
      setAttachments([]);
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleModeSelect = async (mode: 'build_for_me' | 'build_with_me') => {
    setTechMode(mode);
    try {
      await fetch(`/api/departments/${apiDeptKey}/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
    } catch (err) {
      console.error('Failed to save tech mode:', err);
    }
  };

  const hasStarted = messages.length > 0;
  const currentDeptIsLocked = UI_DEPTS.find(d => d.key === deptKey)?.comingSoon;

  return (
    <div className="h-screen bg-bg flex text-text-body font-dm-mono overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Department Navigation Header */}
        <header className="px-8 py-5 border-b border-white/5 bg-surface/30 workspace-anim shrink-0">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            {UI_DEPTS.map(dept => {
              const isActive = dept.key === deptKey;
              const isWorking = processingDepts.includes(dept.key.toLowerCase());
              const isLocked = dept.comingSoon;
              
              return (
                <a 
                  key={dept.key} 
                  href={isLocked ? '#' : `/dashboard/dept/${dept.key}`} 
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 whitespace-nowrap relative ${
                    isActive 
                    ? 'bg-green/10 border-green/30 text-green shadow-[0_4px_20px_rgba(0,255,135,0.15)] ring-1 ring-green/20' 
                    : isLocked 
                      ? 'bg-white/2 border-white/5 text-white/20 cursor-not-allowed grayscale'
                      : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isWorking && !isActive && (
                     <div className="absolute -top-1 -right-1 flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-green"></span>
                     </div>
                  )}
                  <span className={`text-xl transition-all ${isActive ? 'text-green opacity-100 filter drop-shadow-[0_0_8px_rgba(0,255,135,0.5)]' : 'opacity-50 grayscale hover:grayscale-0'} ${isLocked ? 'opacity-20 grayscale' : ''}`}>
                    {isLocked ? '🔒' : dept.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-green' : isLocked ? 'text-white/20' : 'text-white/40'}`}>
                      {dept.name}
                    </span>
                    {isLocked && <span className="text-[7px] uppercase font-bold text-white/30 tracking-tighter -mt-1">Coming Soon</span>}
                  </div>
                  {isWorking && isActive && (
                    <div className="ml-2 flex items-center gap-1">
                       <div className="w-1 h-1 rounded-full bg-green animate-pulse" />
                       <div className="w-1 h-1 rounded-full bg-green animate-pulse [animation-delay:0.2s]" />
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </header>

        {/* Messenger Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* LOCKED STATE FOR COMING SOON DEPTS */}
          {currentDeptIsLocked && (
            <div className="absolute inset-0 z-50 bg-bg/60 backdrop-blur-md flex items-center justify-center p-8">
              <div className="max-w-md w-full p-12 bg-surface/50 border border-white/10 rounded-[3rem] text-center space-y-6">
                <div className="text-6xl mb-6 grayscale opacity-30 font-syne font-black text-white/20">[ LOCKED ]</div>
                <h2 className="text-2xl font-bold font-syne text-white tracking-widest uppercase">Coming Soon</h2>
                <p className="text-white/40 text-sm leading-relaxed italic">
                  The {UI_DEPTS.find(d => d.key === deptKey)?.name} department is currently under development. 
                  Join our waitlist to be first to know when it goes live.
                </p>
                <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold text-xs tracking-widest uppercase">
                  Join Waitlist
                </button>
              </div>
            </div>
          )}

          {/* CONVERSATION THREAD */}
          <div className={`flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar scroll-smooth transition-all duration-700 ${hasStarted ? 'pb-72 pt-12' : 'hidden'}`}>
            {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} workspace-anim animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  {(msg.role === 'agent' || msg.senderName === 'SYSTEM') && (
                    <div className="flex items-center gap-3 mb-4 ml-4">
                      <span className="text-2xl">{msg.senderIcon}</span>
                      <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${msg.senderName === 'SYSTEM' ? 'text-red-500/50' : 'text-white/20'}`}>{msg.senderName} Responded</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] p-10 rounded-[3.5rem] shadow-2xl backdrop-blur-md ${msg.role === 'user' ? 'bg-green/10 border border-green/20' : msg.senderName === 'SYSTEM' ? 'bg-red-500/10 border border-red-500/20' : 'bg-surface/50 border border-white/5'}`}>
                     <p className={`text-[15px] leading-relaxed italic whitespace-pre-wrap ${msg.senderName === 'SYSTEM' ? 'text-red-400 font-bold' : 'text-white/90'}`}>{msg.content}</p>
                  </div>
                </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-4 opacity-30 ml-10">
                <div className="w-2.5 h-2.5 rounded-full bg-green animate-bounce" />
                <div className="w-2.5 h-2.5 rounded-full bg-green animate-bounce [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 rounded-full bg-green animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          {/* UNIFIED INTERACTION UNIT */}
          {!currentDeptIsLocked && (
            <div className={`flex flex-col items-center transition-all duration-1000 ease-out px-8 w-full max-w-4xl mx-auto z-50 ${hasStarted ? 'absolute bottom-20 left-1/2 -translate-x-1/2' : 'flex-1 justify-center'}`}>
               <div className="w-full relative group">
                 
                 {/* Agent Personnel Unit */}
                 <div className="flex gap-4 p-4 px-6 bg-surface/90 backdrop-blur-3xl rounded-t-[2.5rem] border border-white/10 border-b-0 shadow-2xl overflow-x-auto no-scrollbar">
                   {dbAgents.map(agent => (
                     <button 
                       key={agent.id} 
                       onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)} 
                       className={`group relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-500 shrink-0 ${
                         selectedAgent?.id === agent.id 
                         ? 'bg-green/10 border-green/30 text-green shadow-[0_0_15px_rgba(0,255,135,0.1)] ring-1 ring-green/20' 
                         : 'bg-white/5 border-white/5 grayscale hover:grayscale-0 hover:bg-white/10'
                       }`}
                     >
                       <span className="text-xl transition-transform duration-500 group-hover:scale-110">{agent.icon}</span>
                       <span className={`text-[9px] font-black uppercase tracking-wider ${selectedAgent?.id === agent.id ? 'text-green' : 'text-white/30 group-hover:text-white'}`}>{agent.name}</span>
                     </button>
                   ))}
                 </div>

                 {/* Primary Input Unit */}
                 <div className="relative">
                   <textarea 
                     value={deptInputText} 
                     onChange={(e) => setDeptInputText(e.target.value)} 
                     onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDeptSend(); } }} 
                     placeholder={selectedAgent ? `Command ${selectedAgent.name}...` : `Brief your ${deptKey} team...`} 
                     className={`w-full bg-surface/90 backdrop-blur-3xl border border-white/10 focus:border-green/50 rounded-b-[2.5rem] p-8 pl-8 pr-16 text-white placeholder:text-white/10 resize-none outline-none shadow-3xl transition-all leading-relaxed ${hasStarted ? 'min-h-[100px] text-[14px]' : 'min-h-[160px] text-[18px]'}`} 
                   />
                   <div className="absolute right-4 bottom-4 flex items-center gap-2">
                     <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="w-10 h-10 rounded-xl bg-white/5 text-white/30 hover:text-white hover:bg-white/10 flex items-center justify-center text-xl transition-all active:scale-90">+</button>
                     <button onClick={handleDeptSend} disabled={isRouting} className="w-10 h-10 rounded-xl bg-green text-bg flex items-center justify-center text-xl font-bold shadow-lg hover:scale-110 active:scale-95 transition-all">{isRouting ? '...' : '↑'}</button>
                   </div>
                   
                   {showAttachMenu && (
                     <div className="absolute bottom-16 right-0 w-72 bg-surface rounded-2xl border border-white/10 shadow-3xl p-3 z-50 text-left animate-in fade-in slide-in-from-bottom-2">
                         {ATTACH_SUGGESTIONS[deptKey?.toLowerCase()]?.map(sug => (<button key={sug} onClick={() => { setDeptInputText(sug); setShowAttachMenu(false); }} className="w-full text-left px-4 py-3 text-[12px] text-white/40 hover:text-white hover:bg-white/5 rounded-xl truncate">{sug}</button>))}
                         <div className="my-2 border-t border-white/5" />
                         <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-4 px-4 py-3.5 text-[12px] font-bold text-white hover:bg-white/5 rounded-xl">Upload file</button>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          )}

          {/* TECH MODE SELECTION OVERLAY */}
          {deptKey === 'tech' && !techMode && !hasStarted && !currentDeptIsLocked && (
            <div className="absolute inset-0 z-[100] bg-bg/95 flex items-center justify-center p-8 backdrop-blur-xl">
              <div className="max-w-4xl w-full p-12 bg-surface/50 border border-white/10 rounded-[4rem] shadow-3xl text-center space-y-12 workspace-anim">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold font-syne text-white tracking-widest uppercase">Tech & Vibe Coding</h2>
                  <p className="text-white/40 text-lg">How do you want to work with your tech team?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => handleModeSelect('build_for_me')}
                    className="group p-10 bg-white/5 border border-white/5 rounded-[3rem] text-left space-y-6 hover:bg-green/10 hover:border-green/30 transition-all duration-500"
                  >
                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center text-xs font-black text-white/30 uppercase tracking-widest group-hover:bg-green/20 group-hover:text-green group-hover:scale-110 transition-all">BUILD</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase tracking-widest text-white">Build It For Me</h3>
                      <p className="text-sm text-white/40 leading-relaxed">Describe what you want in plain English. Agents build and deploy it for you.</p>
                      <p className="text-[10px] font-bold text-green/60 uppercase pt-2">For: Non-technical founders</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleModeSelect('build_with_me')}
                    className="group p-10 bg-white/5 border border-white/5 rounded-[3rem] text-left space-y-6 hover:bg-green/10 hover:border-green/30 transition-all duration-500"
                  >
                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center text-xs font-black text-white/30 uppercase tracking-widest group-hover:bg-green/20 group-hover:text-green group-hover:scale-110 transition-all">COLLAB</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase tracking-widest text-white">Build With Me</h3>
                      <p className="text-sm text-white/40 leading-relaxed">You write code. Agents debug, review, suggest, and keep your docs updated.</p>
                      <p className="text-[10px] font-bold text-green/60 uppercase pt-2">For: Developers wanting backup</p>
                    </div>
                  </button>
                </div>
                
                <p className="text-xs text-white/20">You can change this anytime in department settings.</p>
              </div>
            </div>
          )}

          {/* MISSION DISCLAIMER */}
          <div className="absolute bottom-5 left-0 right-0 py-2 flex items-center justify-center gap-2 pointer-events-none opacity-60">
             <span className="text-[14px] text-white/30">⬡</span>
             <p className="text-[11px] font-syne text-white/30 tracking-tight">ORCA can make mistakes. Always review outputs before approving actions.</p>
          </div>

        </div>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileAttach} />
      </main>
    </div>
  );
}
