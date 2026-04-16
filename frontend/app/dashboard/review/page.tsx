'use client';

import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function ReviewPage() {
  
  const stats = [
    { label: 'PENDING_APPROVALS', value: '4' },
    { label: 'COORD_EVENTS', value: '12' },
    { label: 'DEPT_REPORTS', value: '2' },
    { label: 'TEAM_ONLINE', value: '5/5' }
  ];

  const approvals = [
    {
      id: 'app_1',
      agent: 'ARIA',
      role: 'CMO',
      time: '10 MIN AGO',
      description: 'Requesting permission to launch LinkedIn Outreach Sequencing targeting 500 VP-level executives in B2B SaaS for the Q2 Market Expansion.'
    },
    {
      id: 'app_2',
      agent: 'REX',
      role: 'CSO',
      time: '25 MIN AGO',
      description: 'Automated follow-up sequence drafted for 15 warm leads from last week\'s webinar. Seeking final sign-off before dispatch via HubSpot.'
    }
  ];

  const logEvents = [
    {
      id: 'ev_1',
      from: 'CMO',
      to: 'CSO',
      action: 'Passing 15 warm leads with campaign context',
      type: 'AUTO'
    },
    {
      id: 'ev_2',
      from: 'CIO',
      to: 'CTO',
      action: 'Forwarding detected vulnerability patch from vendor list',
      type: 'AUTO'
    },
    {
      id: 'ev_3',
      from: 'ATLAS',
      to: 'CMO',
      action: 'Authorized updated brand positioning guidelines',
      type: 'MANUAL_APPROVAL'
    }
  ];

  return (
    <div className="flex h-screen bg-surface">
      <DashboardSidebar active="review" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative grid-bg">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto p-12 no-scrollbar">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface uppercase inline-block border-b-2 border-primary-container pb-1">
              REVIEW
            </h1>
            <p className="font-body text-sm text-on-secondary-container mt-4">
              Decisions waiting for your approval.
            </p>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            {stats.map(stat => (
              <div key={stat.label} className="bg-surface-container px-5 py-4 rounded-lg border border-outline-variant/10">
                <div className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-2 font-black">
                  {stat.label}
                </div>
                <div className="text-3xl font-black font-headline text-on-surface">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-8">
            
            {/* Left 60%: APPROVAL QUEUE */}
            <div className="w-[60%] flex flex-col">
              <div className="text-[10px] font-black font-mono text-on-surface/40 uppercase tracking-[0.2em] mb-4">
                APPROVAL_QUEUE
              </div>
              
              <div className="flex flex-col">
                {approvals.map(app => (
                  <div key={app.id} className="bg-surface-container rounded-lg border border-outline-variant/10 border-l-[3px] border-l-primary-container/60 p-6 mb-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[11px] font-black font-mono text-primary-container uppercase drop-shadow-[0_0_8px_rgba(0,255,135,0.4)]">
                        📣 {app.agent} · {app.role}
                      </span>
                      <span className="text-[9px] font-mono text-on-surface/30 uppercase ml-auto tracking-widest">
                        {app.time}
                      </span>
                    </div>
                    
                    {/* Brief description */}
                    <div className="text-[13px] font-body text-on-secondary-container mb-5 leading-relaxed tracking-wide">
                      {app.description}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button className="px-5 py-2 text-[9px] font-black uppercase tracking-widest bg-primary-container/10 border border-primary-container/40 text-primary-container rounded-sm hover:bg-primary-container hover:text-on-primary transition-colors flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,255,135,0.1)]">
                        <span className="material-symbols-outlined text-xs">check</span>
                        APPROVE
                      </button>
                      <button className="px-5 py-2 text-[9px] font-black uppercase tracking-widest border border-error/30 text-error/60 rounded-sm hover:border-error hover:text-error hover:bg-error/10 transition-colors flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">close</span>
                        REJECT
                      </button>
                      <button className="px-5 py-2 text-[9px] font-black uppercase tracking-widest border border-outline-variant/20 text-on-surface/40 rounded-sm hover:border-outline-variant/40 hover:text-on-surface transition-colors ml-auto">
                        VIEW FULL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 40%: COORD LOG */}
            <div className="w-[40%] flex flex-col">
               <div className="text-[10px] font-black font-mono text-on-surface/40 uppercase tracking-[0.2em] mb-4">
                 COORD_LOG
               </div>
               
               <div className="flex flex-col gap-1">
                 {logEvents.map(ev => (
                   <div key={ev.id} className="flex items-start gap-3 px-4 py-3 bg-surface-container-low border-l-2 border-primary-container/30 hover:bg-surface-container transition-colors">
                     <span className="material-symbols-outlined text-xs text-primary-container/60 mt-0.5">
                       sync_alt
                     </span>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-on-surface/60 uppercase tracking-widest">
                          {ev.from} → {ev.to} <span className="text-on-surface/20 mx-1">·</span> <span className={`${ev.type === 'AUTO' ? 'text-primary-container/50' : 'text-on-surface/40'}`}>{ev.type}</span>
                        </span>
                        <span className="text-[11px] font-body text-on-surface/40 leading-tight">
                          {ev.action}
                        </span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
