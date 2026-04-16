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

    const map: any = { 
      Aria: <svg key="aria" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"></path><path d="m18 8 4-4v16l-4-4"></path><line x1="12" y1="12" x2="12" y2="12.01"></line></svg>,
      Rex: <svg key="rex" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>,
      Purity: <svg key="purity" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
      Roman: <svg key="roman" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="12" x2="9" y2="12"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="12" y1="3" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="21"></line></svg>,
      Ghost: <svg key="ghost" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>,
      Atlas: <svg key="atlas" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
    };
    return map[agentName] || <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
  };

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen bg-surface-container-lowest border-r border-outline-variant/10 py-8 px-4 flex flex-col z-50 overflow-y-auto no-scrollbar">
      {/* 1. Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="text-xl font-black text-primary-container font-headline uppercase">ORCA_CMD</div>
        <svg className="w-4 h-4 text-primary-container/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg>
      </div>

      {/* 2. Main Navigation */}
      <nav className="flex flex-col gap-1 mb-8">
        {navItems.map((item) => {
          const isActive = currentActive === item.id;
          return (
            <Link 
              key={item.id} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 font-label text-[11px] tracking-widest uppercase transition-all ${
                isActive 
                  ? 'text-primary-container bg-surface-container' 
                  : 'text-on-surface/40 hover:text-primary-container'
              }`}
            >
              {item.id === 'chat' && (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
              )}
              {item.id === 'projects' && (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              )}
              {item.id === 'archives' && (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              )}
              {item.id === 'orcahub' && (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              )}
              {item.id === 'settings' && (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. Recent Sessions */}
      <div className="mb-4 px-2 tracking-[0.2em]">
        <h3 className="text-[9px] font-black text-on-surface/30 uppercase font-mono mb-2">RECENT_SESSIONS</h3>
        <div className="flex flex-col gap-1 -mx-1">
          {recents.length > 0 ? (
            recents.map(conv => (
              <Link 
                key={conv.id}
                href={`/dashboard/chat/${conv.id}`}
                className="flex items-center w-full gap-2 px-3 py-1.5 text-[10px] text-on-surface/60 hover:text-primary-container uppercase font-mono group"
              >
                <span className="text-primary-container/40 group-hover:text-primary-container">
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

      {/* 4. User Profile */}
      <div className="mt-auto pt-6 px-2 border-t border-outline-variant/10 flex items-center gap-3 group relative cursor-pointer" onClick={handleLogout}>
        <div className="w-8 h-8 rounded-sm bg-primary-container/20 border border-primary-container/30 text-primary-container font-black flex items-center justify-center font-headline relative flex-shrink-0">
          {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'K'}
          {/* Hover state for logout icon */}
          <div className="absolute inset-0 bg-error/90 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-on-surface" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </div>
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black text-on-surface uppercase tracking-wider truncate font-headline pb-[2px]">
            {profile?.full_name?.replace(' ', '_') || 'KALE_FRANCIS'}
          </span>
          <span className="text-[8px] text-primary-container/60 uppercase font-mono truncate">
            SESSION: 042
          </span>
        </div>
        
        <button className="ml-auto text-on-surface/30 hover:text-on-surface transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
        </button>
      </div>
    </aside>
  );
}
