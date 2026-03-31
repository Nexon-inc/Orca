'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { animate, stagger } from 'animejs';

export default function ProjectsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  useEffect(() => {
    fetch('/api/user/organizations')
      .then(res => res.json())
      .then(data => {
        setOrgs(data.organizations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    animate('.proj-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 800,
      ease: 'outExpo'
    });
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar active="projects" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-bg/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-syne text-2xl font-[900] text-white uppercase tracking-tight">Project Management</h1>
            <p className="font-syne text-white/30 text-[10px] uppercase tracking-[0.2em] font-black">Manage your portfolio of autonomous companies.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-xl bg-green text-bg text-[11px] font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(0,255,135,0.2)] hover:scale-[1.02] transition-all"
          >
            + Add New Company
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 rounded-[2rem] bg-surface/50 border border-white/5 animate-pulse" />
              ))
            ) : orgs.map(org => (
              <div 
                key={org.id} 
                className="group p-8 rounded-[2rem] bg-surface/50 border border-white/5 hover:border-green/20 transition-all duration-500 flex flex-col relative overflow-hidden proj-anim opacity-0"
              >
                <div className="flex items-center justify-between mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center text-2xl">
                      {org.name.charAt(0).toUpperCase()}
                   </div>
                   <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/30 uppercase tracking-widest">
                     {org.plan} Plan
                   </span>
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-green transition-colors">{org.name}</h3>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-8">Role: {org.role}</p>

                <div className="mt-auto flex gap-3">
                   <button 
                    onClick={() => { window.location.href = `/dashboard/switch/${org.id}`; }}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                   >
                     Switch Workspace
                   </button>
                   <button className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                      ⚙️
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-bg/90 backdrop-blur-xl animate-in fade-in">
           <div className="w-full max-w-md p-10 rounded-[3rem] bg-surface border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-green shadow-[0_0_20px_rgba(0,255,135,0.5)]" />
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2 text-center">New Company</h2>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-8 text-center">Establish a new autonomous entity.</p>
              
              <form onSubmit={handleAddCompany} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Display Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="e.g. Nexonic AI"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-green/50 transition-all font-syne"
                    />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-4 rounded-xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 rounded-xl bg-green text-bg text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
                    >
                      Initialize System
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
