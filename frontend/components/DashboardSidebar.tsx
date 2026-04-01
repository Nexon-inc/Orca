'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { animate, stagger } from 'animejs';
import { useRole } from '@/hooks/useRole';
import { createClientSupabaseClient } from '@/lib/supabase/client';

const DEPARTMENTS = [
  { key: 'marketing', name: 'Marketing', icon: 'ðŸ“£' },
  { key: 'sales',     name: 'Sales & Revenue', icon: 'ðŸ’¼' },
  { key: 'cs',        name: 'Customer Success', icon: 'ðŸ¤' },
  { key: 'intel',     name: 'Intelligence & Research', icon: 'ðŸ”' },
  { key: 'tech',      name: 'Tech & Vibe Coding', icon: 'ðŸ›¡ï¸' },
];

interface SidebarProps {
  active?: string;
}

export default function DashboardSidebar({ active }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, orgId, autonomousMode } = useRole();
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recents, setRecents] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [isAutonomous, setIsAutonomous] = useState(autonomousMode);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const currentActive = active || pathname.split('/').pop() || 'chat';

  useEffect(() => {
    setMounted(true);
    fetch('/api/user/organizations')
      .then(res => res.json())
      .then(data => setOrgs(data.organizations || []))
      .catch(() => {});

    fetch('/api/conversations/recent')
      .then(res => res.json())
      .then(data => setRecents(data.conversations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsAutonomous(autonomousMode);
  }, [autonomousMode]);

  useEffect(() => {
    animate('.side-item', {
      opacity: [0, 1],
      x: [-10, 0],
      delay: stagger(30),
      duration: 400,
      ease: 'outExpo'
    });
  }, [isCollapsed, active]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleToggleAutonomy = async () => {
    const newVal = !isAutonomous;
    setIsAutonomous(newVal);
    try {
      await fetch('/api/org', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autonomous_mode: newVal })
      });
    } catch (err) {
      console.error(err);
      setIsAutonomous(!newVal);
    }
  };

  const currentOrg = orgs.find(o => o.id === orgId);

  // Helper for recent executive emojis
  const getExecEmoji = (agentName: string) => {
    const map: any = { Aria: 'ðŸ“£', Rex: 'ðŸ’¼', Purity: 'ðŸ›Ÿ', Roman: 'ðŸ›ï¸', Ghost: 'ðŸ›¡ï¸', Atlas: 'â¬¡' };
    return map[agentName] || 'ðŸ’¬';
  };

  return (
    <aside 
      className={`border-r border-white/5 bg-surface flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out group/sidebar ${isCollapsed ? 'w-[56px]' : 'w-[240px]'} overflow-hidden z-50 shadow-2xl`}
    >
      {/* 1. Header: Logo & Org Switcher */}
      <div className={`p-3 flex flex-col gap-4 border-b border-white/5 ${isCollapsed ? 'items-center' : ''}`}>
        <div className="flex items-center justify-between w-full px-1">
          {!isCollapsed && (
            <div className="relative group/org">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-all"
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              >
                <div className="w-8 h-8 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center">
                  <img src="/orca-logo.svg" alt="logo" className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-syne font-[900] text-green text-[14px] tracking-tighter uppercase truncate max-w-[120px]">
                    {currentOrg?.name || 'ORCA'}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-green animate-pulse" />
                    <span className="text-[7px] text-white/30 uppercase font-black tracking-widest">Autonomous OS</span>
                  </div>
                </div>
                <span className="text-[10px] text-white/20 ml-2">â–¼</span>
              </div>

              {showOrgDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-surface border border-white/10 rounded-2xl shadow-2xl z-[100] p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <span className="px-3 py-2 text-[8px] text-white/30 uppercase font-black tracking-widest block font-syne">Switch Business</span>
                  {orgs.map(o => (
                    <button 
                      key={o.id}
                      onClick={() => { window.location.href = `/dashboard/switch/${o.id}`; }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] flex flex-col gap-0.5 hover:bg-white/5 transition-all ${o.id === orgId ? 'border border-green/20 bg-green/5' : ''}`}
                    >
                      <span className={o.id === orgId ? 'text-green font-[800]' : 'text-white/60'}>{o.name}</span>
                      <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">{o.plan} Plan</span>
                    </button>
                  ))}
                  <div className="my-2 border-t border-white/5" />
                  <button onClick={() => router.push('/dashboard/projects?new=true')} className="w-full text-left px-3 py-2 rounded-lg text-[11px] text-green font-bold hover:bg-green/5">+ Add Company</button>
                </div>
              )}
            </div>
          )}
          {isCollapsed && (
            <div className="w-9 h-9 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center cursor-pointer mb-2" onClick={toggleSidebar}>
               <img src="/orca-logo.svg" alt="logo" className="w-6 h-6" />
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className={`flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 hover:bg-green hover:text-bg transition-all w-6 h-6 absolute -right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/sidebar:opacity-100 z-[60]`}
          >
            {isCollapsed ? 'â€º' : 'â€¹'}
          </button>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={() => router.push('/dashboard/chat?new=true')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green text-bg font-syne font-[900] text-[12px] uppercase tracking-wider transition-all hover:shadow-[0_4px_30px_rgba(0,255,135,0.3)] active:scale-95 ${isCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full'}`}
        >
          <span className="text-xl font-black">+</span>
          {!isCollapsed && <span>New Context</span>}
        </button>
      </div>

      {/* 2. Main Navigation */}
      <nav className={`flex-1 p-2 flex flex-col gap-1 overflow-y-auto no-scrollbar ${isCollapsed ? 'items-center' : ''}`}>
        
        <SidebarItem href="/dashboard/chat" icon="â¬¡" label="Chat" active={currentActive === 'chat'} isCollapsed={isCollapsed} />
        <SidebarItem href="/dashboard/orcahub" icon="ðŸŒŠ" label="OrcaHub" active={currentActive === 'orcahub'} isCollapsed={isCollapsed} />
        <SidebarItem href="/dashboard/projects" icon="ðŸ“" label="Projects" active={currentActive === 'projects'} isCollapsed={isCollapsed} />
        <SidebarItem href="/dashboard/team" icon="ðŸ‘¥" label="Team" active={currentActive === 'team'} isCollapsed={isCollapsed} />
        <SidebarItem href="/dashboard/upgrade" icon="ðŸ’Ž" label="Upgrade" active={currentActive === 'upgrade'} isCollapsed={isCollapsed} />
        <SidebarItem href="/dashboard/review" icon="ðŸ‘ï¸" label="Review" active={currentActive === 'review'} isCollapsed={isCollapsed} />

        {!isCollapsed && recents.length > 0 && (
          <>
            <div className="my-6 h-px bg-white/5 w-full" />
            <span className="px-3 text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-4">Recents</span>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[240px] no-scrollbar px-1">
              {recents.map(conv => (
                <a 
                  key={conv.id}
                  href={`/dashboard/chat/${conv.id}`}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-[11px] text-white/40 hover:text-white flex items-center gap-3 group/item border border-transparent hover:border-white/5"
                >
                  <span className="text-sm opacity-50 group-hover/item:opacity-100 transition-opacity">
                    {getExecEmoji(conv.agents?.name)}
                  </span>
                  <span className="truncate font-semibold tracking-tight">
                    {conv.agents?.name ? `${conv.agents.name} â€” ` : ''}{conv.title || 'Untitled'}
                  </span>
                </a>
              ))}
            </div>
          </>
        )}

        <div className="mt-auto pt-6 flex flex-col gap-2">
           {/* Autonomous Toggle */}
           {!isCollapsed && (
             <div className="px-4 py-3 mb-4 rounded-2xl bg-green/5 border border-green/10 flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-green uppercase tracking-[0.2em]">Full Autonomy</span>
                  <span className="text-[8px] text-white/30 uppercase font-black">{isAutonomous ? 'Operating' : 'Manual Approval'}</span>
                </div>
                <button 
                  onClick={handleToggleAutonomy}
                  className={`w-9 h-5 rounded-full transition-all relative ${isAutonomous ? 'bg-green' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isAutonomous ? 'right-1' : 'left-1'} shadow-md`} />
                </button>
             </div>
           )}
        </div>
      </nav>

      {/* 3. Bottom: User Profile & Popup */}
      <div className={`p-4 border-t border-white/5 bg-bg/50 relative ${isCollapsed ? 'items-center flex flex-col' : ''}`}>
        {showProfilePopup && (
          <div className="absolute bottom-full left-4 mb-2 w-[208px] bg-surface border border-white/10 rounded-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in slide-in-from-bottom-2 fade-in p-2 overflow-hidden">
             <div className="px-3 py-2 border-b border-white/5 mb-2">
                <span className="text-[10px] text-white font-bold block">{profile?.full_name || 'Founder'}</span>
                <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">{currentOrg?.name || 'ORCA'}</span>
             </div>
             <PopupLink href="/dashboard/account" icon="ðŸ‘¤" label="Account Settings" />
             <PopupLink href="/dashboard/account?tab=billing" icon="ðŸ’³" label="Billing & Plan" />
             <PopupLink href="/dashboard/account?tab=ai-models" icon="âš¡" label="AI Models" />
             <PopupLink href="/dashboard/account?tab=security" icon="ðŸ›¡ï¸" label="Security & Audit" />
             <div className="my-2 border-t border-white/5" />
             <button 
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-xl text-[11px] text-red-400 hover:bg-red-400/5 transition-all flex items-center gap-3 font-bold"
             >
               <span>ðŸšª</span> Logout
             </button>
          </div>
        )}

        <div 
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group/profile border border-transparent hover:border-white/5" 
          onClick={() => setShowProfilePopup(!showProfilePopup)}
        >
          <div className="w-9 h-9 rounded-full bg-green/20 border border-green/30 flex items-center justify-center text-[13px] font-syne font-black text-green shadow-[0_0_20px_rgba(0,255,135,0.1)] group-hover/profile:scale-105 transition-transform">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-[900] text-white truncate tracking-tight">{profile?.full_name?.split(' ')[0] || 'Founder'}</span>
              <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-black">{currentOrg?.role || 'Founder'}</span>
            </div>
          )}
          {!isCollapsed && <span className="text-[10px] text-white/10 shrink-0">â¬¡</span>}
        </div>
      </div>
    </aside>
  );
}

function PopupLink({ href, icon, label }: any) {
  return (
    <a href={href} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] text-white/60 hover:text-white hover:bg-white/5 transition-all font-bold">
      <span>{icon}</span> {label}
    </a>
  );
}

function SidebarItem({ href, icon, label, active, isCollapsed }: any) {
  return (
    <a
      href={href}
      className={`side-item flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group ${active ? 'bg-green/10 text-green border border-green/20 shadow-[0_0_20px_rgba(0,255,135,0.05)]' : 'text-white/30 hover:text-white hover:bg-white/5 border border-transparent'} ${isCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full'}`}
    >
      <span className={`text-[16px] ${active ? 'text-green drop-shadow-[0_0_8px_rgba(0,255,135,0.5)]' : 'text-white/30 group-hover:text-white'}`}>{icon}</span>
      {!isCollapsed && (
        <span className={`font-syne text-[12px] font-[900] uppercase tracking-[0.2em] ${active ? 'text-green' : 'text-white/60 group-hover:text-white'}`}>
          {label}
        </span>
      )}
    </a>
  );
}
