'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { animate, stagger } from 'animejs';
import { useRole } from '@/hooks/useRole';
import { createClientSupabaseClient } from '@/lib/supabase/client';

const menuItems = [
  { id: 'overview', name: 'Overview', icon: '⬡', path: '/dashboard' },
  { id: 'departments', name: 'Departments', icon: '📂', path: '/dashboard/dept/marketing' },
  { id: 'review', name: 'Review', icon: '👁', path: '/dashboard/review' },
  { id: 'team', name: 'Teams', icon: '👥', path: '/dashboard/team' },
  { id: 'integrations', name: 'Integrations', icon: '🔌', path: '/dashboard/integrations' },
  { id: 'orcahub', name: 'OrcaHub', icon: '🌊', path: '/dashboard/orcahub' },
  { id: 'upgrade', name: 'Upgrade', icon: '💎', path: '/dashboard/upgrade' },
  { id: 'account', name: 'Account', icon: '⚙️', path: '/dashboard/account' },
];

interface SidebarProps {
  active?: string;
}

export default function DashboardSidebar({ active }: SidebarProps) {
  const pathname = usePathname();
  const { plan, orgId } = useRole();
  const currentActive = active || (pathname === '/dashboard' ? 'overview' : (pathname.includes('/dept/') ? 'departments' : pathname.split('/').pop()));

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    animate('.side-item', {
      opacity: [0, 1],
      x: [-20, 0],
      delay: stagger(40),
      duration: 600,
      ease: 'outExpo'
    });
  }, [isCollapsed]);

  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClientSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={`border-r border-white/5 bg-surface flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out group/sidebar ${isCollapsed ? 'w-20' : 'w-[260px]'} overflow-hidden z-50`}
    >
      {/* Logo & Toggle Section */}
      <div className={`p-5 px-6 border-b border-white/5 flex items-center shrink-0 ${isCollapsed ? 'flex-col gap-6 justify-center' : 'justify-between'}`}>
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => window.location.href = '/dashboard'}
        >
          <div className="w-9 h-9 rounded-xl bg-green/10 border border-green/20 flex items-center justify-center relative shadow-[0_0_20px_rgba(0,255,135,0.1)]">
             <img src="/orca-logo.svg" alt="logo" className="w-5 h-5" />
             <div className="absolute inset-0 bg-green/20 blur-lg rounded-full opacity-40 animate-pulse" />
          </div>
          {!isCollapsed && (
          <div className="flex flex-col">
              <span className="font-syne font-[800] text-green text-[22px] tracking-tight uppercase leading-none">ORCA</span>
              <span className="text-[9px] text-white/40 font-black tracking-[0.2em] uppercase mt-1">Company OS</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 hover:bg-green hover:text-bg hover:border-green transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(0,255,135,0.2)] active:scale-95 ${isCollapsed ? 'w-10 h-10 text-[14px]' : 'w-8 h-8 text-[12px]'}`}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className={`flex-1 p-4 flex flex-col gap-1 overflow-y-auto no-scrollbar overflow-x-hidden ${isCollapsed ? 'items-center' : ''}`}>
        {/* Overview Item */}
        <a
          href="/dashboard"
          className={`side-item flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${currentActive === 'overview' ? 'bg-green/10 border border-green/10 text-green shadow-[0_4px_12px_rgba(0,255,135,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'} ${isCollapsed ? 'w-12 h-12 justify-center p-0' : 'w-full'}`}
        >
          <span className={`text-[16px] ${currentActive === 'overview' ? 'text-green' : 'text-white/40 group-hover:text-white transition-colors'}`}>⬡</span>
          {!isCollapsed && (
            <span className={`font-syne text-[14px] font-[800] uppercase tracking-wider ${currentActive === 'overview' ? 'text-green' : 'text-white/60 group-hover:text-white transition-colors'}`}>Overview</span>
          )}
        </a>



        {menuItems.slice(1).map((item) => (
          <div key={item.id} className="relative group/nav">
            <a
              href={item.path}
              className={`side-item flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${currentActive === item.id ? 'bg-green/10 border border-green/10 text-green shadow-[0_4px_12px_rgba(0,255,135,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'} ${isCollapsed ? 'w-12 h-12 justify-center p-0' : 'w-full'}`}
            >
              <span className={`text-[16px] ${currentActive === item.id ? 'text-green' : 'text-white/40 group-hover:text-white transition-colors'}`}>{item.icon}</span>
              {!isCollapsed && (
                <span className={`font-syne text-[14px] font-[800] uppercase tracking-wider ${currentActive === item.id ? 'text-green' : 'text-white/60 group-hover:text-white transition-colors'}`}>{item.name}</span>
              )}
            </a>
          </div>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/20 hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 group/logout ${isCollapsed ? 'w-12 h-12 justify-center p-0' : 'w-full'}`}
        >
          <span className="text-[16px] group-hover/logout:scale-110 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </span>
          {!isCollapsed && (
            <span className="font-syne text-[12px] font-[800] uppercase tracking-widest">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
