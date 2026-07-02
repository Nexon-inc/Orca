'use client';

import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { toast } from 'sonner';

export default function TeamsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/org/members');
      const data = await res.json();
      if (data.members) {
        const mapped = data.members.map((m: any) => {
          const profile = m.profiles || {};
          const initials = profile.avatar_initials || (profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?');
          const fullName = profile.full_name || profile.email || 'TEAM MEMBER';
          let roleStr = m.role.toUpperCase();
          if (m.department_key) roleStr += ` · DEPT_HEAD · ${m.department_key.toUpperCase()}`;
          return {
            id: m.id,
            initials,
            fullName,
            roles: roleStr,
            isOnline: true
          };
        });
        setMembers(mapped);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async () => {
    const email = prompt('Enter candidate email address to invite:');
    if (!email) return;
    try {
      const res = await fetch('/api/org/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'member', department_key: null })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Invite sent successfully to ${email}!`);
        fetchMembers(); // refresh
      } else {
        toast.error(data.error || 'Failed to send invite.');
      }
    } catch (err) {
      toast.error('Network error sending invite');
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/auth/signup`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Registration link copied to clipboard!');
  };

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="team" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-12 no-scrollbar">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase inline-block border-b-2 border-primary-container pb-1">
              TEAM_MGMT
            </h1>
            <p className="font-body text-sm text-on-secondary-container mt-4">
              Manage access to your executive command.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center gap-3 text-[10px] font-mono text-primary-container/40 uppercase tracking-widest animate-pulse">
                <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                Accessing team database...
              </div>
            ) : members.length > 0 ? (
              members.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container-high rounded-lg transition-all border border-transparent hover:border-outline-variant/10"
                >
                  
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-sm bg-primary-container/20 border border-primary-container/30 text-primary-container font-black text-xs flex items-center justify-center font-headline shrink-0">
                    {member.initials}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black font-mono text-on-surface uppercase truncate">
                      {member.fullName}
                    </div>
                    <div className="text-[9px] font-mono text-primary-container/60 uppercase truncate tracking-widest mt-0.5">
                      {member.roles}
                    </div>
                  </div>
                  
                  {/* Status dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${member.isOnline ? 'bg-primary-container shadow-[0_0_8px_rgba(0,255,135,0.6)]' : 'bg-on-surface/20'}`}></span>
                  
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[10px] font-mono text-on-surface/20 uppercase tracking-[0.25em] border border-dashed border-outline-variant/10 rounded-2xl">
                No team members registered
              </div>
            )}
          </div>

          {/* Invite Buttons */}
          <div className="flex gap-3 mt-8">
            <button 
              onClick={handleInvite}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-container/10 border border-primary-container/40 text-[9px] font-black text-primary-container uppercase tracking-widest rounded-sm hover:bg-primary-container hover:text-on-primary transition-colors shadow-[0_4px_12px_rgba(0,255,135,0.1)]"
            >
              <span className="material-symbols-outlined text-[14px]">mail</span>
              INVITE_BY_EMAIL
            </button>
            <button 
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-outline-variant/20 text-[9px] font-black text-on-surface/40 uppercase tracking-widest rounded-sm hover:border-outline-variant/40 hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">link</span>
              COPY_INVITE_LINK
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
