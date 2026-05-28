'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
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

interface DashboardHeaderProps {
  floating?: boolean;
  activeDirectives?: any;
}

export default function DashboardHeader({ floating = false, activeDirectives = null }: DashboardHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback mocks instead of API polling to prevent 404 spam
    setNotifications([
      { id: 1, text: "Atlas (CEO) initialized Day 1 Protocols", time: "2m ago", important: true },
      { id: 2, text: "Aria (CMO) generated marketing strategy", time: "15m ago", important: false },
    ]);
  }, []);

  if (activeDirectives) return null;

  return (
    <header className={
      floating 
        ? "absolute top-4 right-4 z-40 h-10 px-3 bg-[#0a0c0a]/60 backdrop-blur-md border border-outline-variant/10 rounded-full flex items-center justify-end gap-2 shadow-lg transition-all duration-300"
        : "h-11 flex items-center justify-end px-5 sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 shrink-0 gap-4"
    }>
      {/* New Chat Button */}
      <button 
        onClick={() => router.push('/dashboard/chat')}
        className={`${floating ? 'w-7 h-7' : 'w-9 h-9'} flex items-center justify-center bg-primary-container text-on-primary rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg group`}
        title="New Chat"
      >
        <span className={`material-symbols-outlined ${floating ? 'text-lg' : 'text-xl'} font-bold`}>add</span>
      </button>

      <div className="h-4 w-[1px] bg-outline-variant/20 mx-1" />

      {/* Integrations Quick Access */}
      <Dialog>
        <DialogTrigger asChild>
          <button className={`${floating ? 'w-7 h-7 rounded-full' : 'w-9 h-9 rounded-lg'} flex items-center justify-center text-on-surface/40 hover:text-primary-container transition-colors hover:bg-white/5 group`} title="Integrations Vault">
            <span className={`material-symbols-outlined ${floating ? 'text-[18px]' : 'text-[22px]'}`}>hub</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1200px] w-full bg-[#0a0c0a] border-[#1a1c1a] p-0 overflow-hidden rounded-[2.5rem]">
          <DialogTitle className="sr-only">Integrations Vault</DialogTitle>
          <DialogDescription className="sr-only">Manage your connected applications and tools.</DialogDescription>
          <div className="p-8 max-h-[85vh] overflow-y-auto no-scrollbar">
            <IntegrationsVault />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Notifications Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`${floating ? 'w-7 h-7 rounded-full' : 'w-9 h-9 rounded-lg'} flex items-center justify-center text-on-surface/40 hover:text-primary-container transition-colors relative hover:bg-white/5 group`} title="Notifications">
            <span className={`material-symbols-outlined ${floating ? 'text-[18px]' : 'text-[22px]'}`}>notifications</span>
            {notifications.some(n => n.important) && (
              <span className={`absolute ${floating ? 'top-1.5 right-1.5 w-1.5 h-1.5' : 'top-2 right-2 w-2 h-2'} bg-error rounded-full border-2 border-[#0a0c0a]`}></span>
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
