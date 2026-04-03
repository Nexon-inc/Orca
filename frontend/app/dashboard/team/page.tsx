'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function TeamsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState('');
  const [inviting, setInviting] = useState(false);
  const [copying, setCopying] = useState(false);
  
  // Create a join link based on the user's org info (will fetch in useEffect)
  const [org, setOrg] = useState<any>(null);

  useEffect(() => {
    // Fetch members
    fetch('/api/org/members')
      .then(res => res.json())
      .then(data => {
        setMembers(data.members || []);
        setLoading(false);
      });

    // Fetch org details for the invite link
    fetch('/api/org')
      .then(res => res.json())
      .then(data => {
        if (data.member?.organizations) {
          setOrg(data.member.organizations);
        }
      });
  }, []);

  const handleSendInvites = async () => {
    if (!emails.trim()) return;
    setInviting(true);
    const emailList = emails.split(/[\n,]+/).map(e => e.trim()).filter(Boolean);
    
    try {
      for (const email of emailList) {
        await fetch('/api/org/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: 'member' })
        });
      }
      setEmails('');
      alert('Invitations sent!');
    } catch {
      alert('Failed to send some invitations.');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${org?.id || 'pending'}`;
    navigator.clipboard.writeText(link);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  useEffect(() => {
    animate('.team-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar active="team" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Team</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-[800] uppercase tracking-widest">{members.length} PEOPLE</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl overflow-y-auto no-scrollbar">
          <div className="mb-12 team-anim opacity-0">
            <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">Team <span className="text-green">Management</span></h1>
            <p className="font-syne text-[11px] text-white/40 uppercase tracking-widest font-[800]">Control who has access to your company dashboard.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 team-anim opacity-0">
             {/* Email Invite */}
             <div className="p-8 rounded-[2rem] border border-white/5 bg-surface/30 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green/5 rounded-bl-[3rem] pointer-events-none" />
                <h3 className="font-syne text-lg font-[800] text-white mb-2 uppercase tracking-tight">Invite by Email</h3>
                <p className="font-syne text-[11px] text-white/40 mb-6 uppercase tracking-widest font-[800]">Add multiple emails separated by commas or lines.</p>
                
                <textarea 
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="john@company.com, sarah@company.com"
                  className="w-full h-32 bg-bg/50 border border-white/5 rounded-2xl p-4 font-syne text-sm text-white placeholder:text-white/10 focus:border-green/50 outline-none transition-all resize-none mb-4"
                />
                
                <button 
                  onClick={handleSendInvites}
                  disabled={inviting || !emails.trim()}
                  className="w-full py-4 rounded-xl bg-green text-bg font-syne font-[800] text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {inviting ? 'Sending...' : 'Send Invitations →'}
                </button>
             </div>

             {/* Link Invite */}
             <div className="p-8 rounded-[2rem] border border-white/5 bg-surface/30 backdrop-blur-md relative overflow-hidden group flex flex-col">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green/5 rounded-bl-[3rem] pointer-events-none" />
                <h3 className="font-syne text-lg font-[800] text-white mb-2 uppercase tracking-tight">Invite Link</h3>
                <p className="font-syne text-[11px] text-white/40 mb-6 uppercase tracking-widest font-[800]">Anyone with this link can join your organization.</p>
                
                <div className="flex-1 flex flex-col justify-center">
                   <div className="bg-bg/50 border border-white/5 rounded-2xl p-4 mb-4 flex items-center justify-between">
                      <code className="text-[11px] text-white/40 truncate mr-4">
                        {org ? `${window.location.origin}/join/${org.id}` : 'Generating link...'}
                      </code>
                      <button 
                        onClick={handleCopyLink}
                        className="shrink-0 font-syne text-[10px] text-green font-[800] uppercase tracking-widest hover:text-white transition-colors"
                      >
                        {copying ? 'Copied!' : 'Copy'}
                      </button>
                   </div>
                   <div className="flex items-center gap-2 mb-8">
                      <div className="w-1.5 h-1.5 rounded-full bg-green/50 animate-pulse" />
                      <span className="font-syne text-[10px] text-white/20 uppercase tracking-[0.2em] font-[800]">Active Link Mode</span>
                   </div>
                </div>

                <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                   <p className="font-syne text-[10px] text-white/40 uppercase tracking-widest font-[800]">
                     Only admins can manage this link.
                   </p>
                </div>
             </div>
          </div>

          <div className="mb-6 team-anim opacity-0">
             <h2 className="font-syne text-sm font-[800] text-white/40 uppercase tracking-[0.3em]">Active Members</h2>
          </div>

          <div className="grid gap-4 team-anim opacity-0">
             {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-6 rounded-[2rem] border border-white/5 bg-surface/50 animate-pulse h-28" />
                ))
             ) : members.length > 0 ? members.map(member => (
                <div key={member.id} className="p-6 rounded-[2rem] border border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between group hover:border-green/20 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center font-[800] text-green shadow-[0_4px_20px_rgba(0,255,135,0.1)] uppercase">
                         {member.profiles?.avatar_initials || '??'}
                      </div>
                       <div className="text-left">
                          <div className="flex items-center gap-3 mb-1">
                             <h3 className="font-syne text-lg font-[800] text-white group-hover:text-green transition-colors uppercase tracking-tight">
                               {member.profiles?.full_name || 'Anonymous User'}
                             </h3>
                             <div className="flex gap-1">
                                <span className="text-[8px] font-[800] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 tracking-widest leading-none uppercase">
                                  {member.role}
                                </span>
                                {member.department_key && (
                                  <span className="text-[8px] font-[800] px-1.5 py-0.5 rounded bg-green/10 border border-green/20 text-green tracking-widest leading-none uppercase">
                                    {member.department_key} Executive
                                  </span>
                                )}
                             </div>
                          </div>
                          <p className="font-syne text-[12px] text-white/40 font-[800] uppercase tracking-widest">
                            {member.profiles?.email}
                          </p>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-8">
                       <div className="text-right flex flex-col items-end gap-1 hidden sm:flex">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                             <span className="font-syne text-[10px] text-green font-[800] uppercase tracking-widest">Active Now</span>
                          </div>
                          <span className="text-[9px] text-white/20 uppercase font-[800] tracking-widest">Full Access</span>
                       </div>
                       <button className="px-4 py-2 rounded-xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100">
                          <span className="text-[9px] text-red-500 font-[800] uppercase tracking-widest font-black">Remove</span>
                       </button>
                   </div>
                </div>
             )) : (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                   <p className="font-syne text-[11px] text-white/20 font-[800] uppercase tracking-widest">No team members added yet.</p>
                </div>
             )}
          </div>

          <div className="mt-12 p-12 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center max-w-2xl mx-auto team-anim opacity-0">
             <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 opacity-40"><div className="w-4 h-4 border border-white/20 rounded-sm" /></div>
             <p className="font-syne text-[13px] text-white/40 leading-relaxed uppercase tracking-tighter">
                {loading ? 'Initializing roster...' : 'Manage your team and their access levels here.'}
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
