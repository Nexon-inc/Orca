'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';
import { createClientSupabaseClient } from '@/lib/supabase/client';

interface SidebarProps {
  active?: string;
}

export default function DashboardSidebar({ active }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useRole();
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [isCollapsed]);

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  const [recents, setRecents] = useState<any[]>([]);

  // Calculate current active route if not explicitly passed
  const currentActive = active || pathname.split('/').pop() || 'chat';

  useEffect(() => {
    const fetchRecents = () => {
      fetch('/api/conversations')
        .then(res => res.json())
        .then(data => setRecents(data.conversations || []))
        .catch(() => {});
    };

    fetchRecents();

    window.addEventListener('conversation_created', fetchRecents);
    return () => window.removeEventListener('conversation_created', fetchRecents);
  }, [pathname]);

  const navItems = [
    { id: 'chat', label: 'Chat', icon: 'terminal', href: '/dashboard/chat' },
    { id: 'projects', label: 'Projects', icon: 'layers', href: '/dashboard/projects' },
    { id: 'orcahub', label: 'Orca Hub', icon: 'hub', href: '/dashboard/orcahub' },
    { id: 'archives', label: 'Archives', icon: 'database', href: '/dashboard/archives' }
  ];

  const getExecIcon = (agentName?: string) => {
    if (!agentName) return 'chat_bubble';
    const map: any = { 
      Aria: 'campaign', 
      Rex: 'payments', 
      Purity: 'support_agent', 
      Roman: 'hub', 
      Ghost: 'memory', 
      Atlas: 'leaderboard' 
    };
    return map[agentName] || 'chat_bubble';
  };

  if (!mounted) return null;

  return (
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out bg-surface-container-lowest border-r border-outline-variant/10 py-8 px-4 flex flex-col z-50 overflow-y-auto no-scrollbar ${isCollapsed ? 'w-20 items-center' : 'w-64'}`}>
      
      {/* 1. Logo */}
      <div className="relative flex w-full mb-8 items-center justify-center cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <img src="/logo.png" alt="ORCA" className={`rounded shrink-0 hover:opacity-80 transition-all ${isCollapsed ? 'w-10 h-10' : 'w-14 h-14'}`} />
        {!isCollapsed && <span className="absolute right-0 material-symbols-outlined text-lg text-on-surface/40 hover:text-on-surface transition-colors">menu_open</span>}
      </div>

      {/* 2. Main Navigation */}
      <nav className="flex flex-col w-full gap-1 mb-8">
        {navItems.map((item) => {
          const isActive = currentActive === item.id;
          return (
            <Link 
              key={item.id} 
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center py-3 font-label text-[11px] tracking-widest uppercase transition-all rounded-md ${
                isCollapsed ? 'justify-center px-0 gap-0 mx-auto w-10 h-10' : 'gap-3 px-3'
              } ${
                isActive 
                  ? 'text-primary-container bg-surface-container' 
                  : 'text-on-surface/40 hover:text-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 3. Recent Sessions */}
      {!isCollapsed && (
        <div className="mb-4 px-2 tracking-[0.2em] w-full">
          <h3 className="text-[9px] font-black text-on-surface/30 uppercase font-mono mb-2">RECENT_SESSIONS</h3>
          <div className="flex flex-col gap-1 -mx-1">
            {recents.length > 0 ? (
              recents.map(conv => (
                <Link 
                  key={conv.id}
                  href={`/dashboard/chat/${conv.id}`}
                  className="flex items-center w-full gap-2 px-3 py-1.5 text-[10px] text-on-surface/60 hover:text-primary-container uppercase font-mono group"
                >
                  <span className="material-symbols-outlined text-xs text-primary-container/40 group-hover:text-primary-container">
                    {getExecIcon(Array.isArray(conv.agents) ? conv.agents[0]?.name : conv.agents?.name)}
                  </span>
                  <span className="truncate">
                    {conv.title || `SESSION_${conv.id.split('-')[0].toUpperCase()}`}
                  </span>
                </Link>
              ))
            ) : (
              <div className="px-3 py-2 text-[8px] text-on-surface/20 uppercase font-mono italic">
                NO_ACTIVE_SESSIONS
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacer to push profile to bottom if recents is small */}
      <div className="mt-auto"></div>

      {/* Popover Settings Menu */}
      {showUserMenu && (
        <div className={`mb-4 w-full bg-[#1a1c1a] border border-[#2d312d] rounded-lg shadow-xl py-2 z-50 flex flex-col`} style={{ minWidth: isCollapsed ? '160px' : 'auto' }}>
          <div className="px-4 py-2 border-b border-[#2d312d]/50 mb-1">
            <div className="text-[9px] text-on-surface/50 font-mono tracking-widest uppercase">Signed In As</div>
            <div className="text-[10px] font-black text-on-surface truncate">{user?.email || 'user@nexonic.ai'}</div>
          </div>
          <a href="/dashboard/settings#setup" onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2 text-[10px] font-black text-on-surface/60 hover:text-primary-container hover:bg-white/5 uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer block">
            <span className="material-symbols-outlined text-[14px]">settings</span> Setup & Env
          </a>
          <a href="/dashboard/settings#billing" onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2 text-[10px] font-black text-on-surface/60 hover:text-primary-container hover:bg-white/5 uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer block">
            <span className="material-symbols-outlined text-[14px]">credit_card</span> Billing
          </a>
          <a href="/dashboard/settings#account" onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2 text-[10px] font-black text-on-surface/60 hover:text-primary-container hover:bg-white/5 uppercase tracking-widest flex items-center gap-2 transition-colors border-b border-[#2d312d]/50 pb-3 cursor-pointer block">
            <span className="material-symbols-outlined text-[14px]">manage_accounts</span> Account
          </a>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 mt-1 text-[10px] font-black text-error/80 hover:text-error hover:bg-white/5 uppercase tracking-widest flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[14px]">logout</span> Disconnect
          </button>
        </div>
      )}

      {/* 4. User Profile */}
      <div 
        ref={menuRef}
        className={`pt-6 border-t border-outline-variant/10 flex items-center group relative cursor-pointer w-full transition-colors hover:bg-white/5 rounded-lg py-2 ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-2'}`} 
        onClick={() => setShowUserMenu(!showUserMenu)}
        title={isCollapsed ? "Profile & Settings" : undefined}
      >
        <div className="w-8 h-8 rounded-sm bg-primary-container/20 border border-primary-container/30 text-primary-container font-black flex items-center justify-center font-headline relative flex-shrink-0">
          {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'K'}
        </div>
        
        {!isCollapsed && (
          <>
            <div className="flex flex-col min-w-0 flex-1 ml-1">
              <span className="text-[10px] font-black text-on-surface uppercase tracking-wider truncate font-headline pb-[2px]">
                {profile?.full_name?.replace(' ', '_') || 'KALE_FRANCIS'}
              </span>
              <span className="text-[8px] text-primary-container/60 uppercase font-mono truncate">
                SESSION: 042
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
