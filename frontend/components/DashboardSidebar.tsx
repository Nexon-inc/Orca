'use client';

import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    // Cleanup incase component unmounts
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [isCollapsed]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  const [recents, setRecents] = useState<any[]>([]);

  // Calculate current active route if not explicitly passed
  const currentActive = active || pathname.split('/').pop() || 'chat';

  useEffect(() => {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => setRecents(data.conversations || []))
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { id: 'chat', label: 'Chat', icon: 'terminal', href: '/dashboard/chat' },
    { id: 'projects', label: 'Projects', icon: 'layers', href: '/dashboard/projects' },
    { id: 'archives', label: 'Archives', icon: 'database', href: '/dashboard/archives' },
    { id: 'orcahub', label: 'Orca Hub', icon: 'hub', href: '/dashboard/orcahub' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/dashboard/settings' },
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

  if (!mounted) return null; // Avoid hydration mismatch on initial body class sync needed

  return (
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out bg-surface-container-lowest border-r border-outline-variant/10 py-8 px-4 flex flex-col z-50 overflow-y-auto no-scrollbar ${isCollapsed ? 'w-20 items-center' : 'w-64'}`}>
      
      {/* 1. Logo */}
      <div className={`flex w-full mb-8 ${isCollapsed ? 'justify-center cursor-pointer px-0' : 'items-center justify-between px-2 cursor-pointer'}`} onClick={() => setIsCollapsed(!isCollapsed)}>
        <img src="/favicon.ico" alt="ORCA" className="w-8 h-8 rounded shrink-0 brightness-150 hover:opacity-80 transition-opacity" />
        {!isCollapsed && <span className="material-symbols-outlined text-sm text-primary-container/40">unfold_more</span>}
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
                    {getExecIcon(conv.agents?.name)}
                  </span>
                  <span className="truncate">
                    {conv.title || 'UNTITLED_SESSION'}
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

      {/* 4. User Profile */}
      <div 
        className={`mt-auto pt-6 border-t border-outline-variant/10 flex items-center group relative cursor-pointer w-full ${isCollapsed ? 'justify-center' : 'gap-3 px-2'}`} 
        onClick={handleLogout}
        title={isCollapsed ? "Logout" : undefined}
      >
        <div className="w-8 h-8 rounded-sm bg-primary-container/20 border border-primary-container/30 text-primary-container font-black flex items-center justify-center font-headline relative flex-shrink-0">
          {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'K'}
          {/* Hover state for logout icon */}
          <div className="absolute inset-0 bg-error/90 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-[14px] text-on-surface">logout</span>
          </div>
        </div>
        
        {!isCollapsed && (
          <>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-on-surface uppercase tracking-wider truncate font-headline pb-[2px]">
                {profile?.full_name?.replace(' ', '_') || 'KALE_FRANCIS'}
              </span>
              <span className="text-[8px] text-primary-container/60 uppercase font-mono truncate">
                SESSION: 042
              </span>
            </div>
            
            <button className="ml-auto text-on-surface/30 hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
