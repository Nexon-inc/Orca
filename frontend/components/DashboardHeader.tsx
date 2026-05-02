'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import IntegrationsVault from './IntegrationsVault';

export default function DashboardHeader() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/org/audit?limit=5');
        const data = await res.json();
        if (data.logs) {
          const mapped = data.logs.map((log: any) => ({
            id: log.id,
            text: `${log.action.replace(/_/g, ' ').toUpperCase()}: ${log.metadata?.conversation_id ? 'Conversation Update' : 'System Protocol Updated'}`,
            time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            important: log.action.includes('error') || log.action.includes('interaction')
          }));
          setNotifications(mapped);
        }
      } catch (e) {
        // Fallback mocks if API fails
        setNotifications([
          { id: 1, text: "Atlas (CEO) initialized Day 1 Protocols", time: "2m ago", important: true },
          { id: 2, text: "Aria (CMO) generated marketing strategy", time: "15m ago", important: false },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 flex items-center justify-end px-8 sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 shrink-0 gap-4">
      {/* New Chat Button */}
      <button 
        onClick={() => router.push('/dashboard/chat')}
        className="w-9 h-9 flex items-center justify-center bg-primary-container text-on-primary rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg group"
        title="New Chat"
      >
        <span className="material-symbols-outlined text-xl font-bold">add</span>
      </button>

      <div className="h-4 w-[1px] bg-outline-variant/20 mx-2" />

      {/* Integrations Quick Access */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="w-9 h-9 flex items-center justify-center text-on-surface/40 hover:text-primary-container transition-colors rounded-lg hover:bg-white/5 group" title="Integrations Vault">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl bg-[#0a0c0a] border-[#1a1c1a] p-0 overflow-hidden rounded-[2.5rem]">
          <div className="p-8 max-h-[85vh] overflow-y-auto no-scrollbar">
            <IntegrationsVault />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Notifications Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-9 h-9 flex items-center justify-center text-on-surface/40 hover:text-primary-container transition-colors relative rounded-lg hover:bg-white/5 group" title="Notifications">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {notifications.some(n => n.important) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-[#0a0c0a]"></span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-[#121412] border-[#262a26] p-2 rounded-2xl shadow-2xl">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface/40 px-3 py-2">
            Intelligence Feed
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#262a26]" />
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 focus:bg-white/5 cursor-pointer rounded-xl transition-colors">
                <div className="flex items-center gap-2 w-full">
                  {n.important && <div className="w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,195,103,0.5)]" />}
                  <span className="text-[11px] text-on-surface font-medium leading-tight">{n.text}</span>
                </div>
                <span className="text-[9px] font-mono text-on-surface/20 uppercase ml-3.5">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator className="bg-[#262a26]" />
          <DropdownMenuItem className="justify-center text-[9px] font-black uppercase tracking-widest text-primary-container py-2 focus:bg-primary-container/10">
            Clear Neural Cache
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
    </header>
  );
}
