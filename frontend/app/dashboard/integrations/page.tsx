'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { animate, stagger } from 'animejs';
import DashboardSidebar from '@/components/DashboardSidebar';

const INTEGRATIONS_CATALOG = [
  { id: 'marketing', name: 'Marketing', tools: [
    { service_key: 'linkedin', name: 'LinkedIn' },
    { service_key: 'twitter', name: 'X / Twitter' },
    { service_key: 'meta', name: 'Meta (Instagram/FB)' },
    { service_key: 'mailchimp', name: 'Mailchimp' },
    { service_key: 'google_analytics', name: 'Google Analytics' },
  ]},
  { id: 'sales', name: 'Sales & Revenue', tools: [
    { service_key: 'hubspot', name: 'HubSpot' },
    { service_key: 'gmail_outreach', name: 'Gmail (Outreach)' },
  ]},
  { id: 'cs', name: 'Customer Success', tools: [
    { service_key: 'intercom', name: 'Intercom' },
    { service_key: 'zendesk', name: 'Zendesk' },
    { service_key: 'typeform', name: 'Typeform' },
  ]},
  { id: 'tech', name: 'Tech & Security', tools: [
    { service_key: 'github', name: 'GitHub' },
  ]},
  { id: 'hiring', name: 'People & Hiring', tools: [
    { service_key: 'linkedin_hiring', name: 'LinkedIn (Hiring)' },
  ]},
  { id: 'ops', name: 'Operations', tools: [
    { service_key: 'notion', name: 'Notion' },
    { service_key: 'google_calendar', name: 'Google Calendar' },
    { service_key: 'slack', name: 'Slack' },
  ]},
  { id: 'finance', name: 'Finance & Legal', tools: [
    { service_key: 'quickbooks', name: 'QuickBooks' },
    { service_key: 'docusign', name: 'DocuSign' },
  ]},
  { id: 'community', name: 'Community & Growth', tools: [
    { service_key: 'discord', name: 'Discord' },
  ]}
];

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const [connectedTools, setConnectedTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    // Handle URL parameters for OAuth callbacks
    const isSuccess = searchParams.get('success');
    const serviceName = searchParams.get('service');
    const errorParam = searchParams.get('error');

    if (isSuccess === 'true' && serviceName) {
      setAlertMsg({ type: 'success', text: `Successfully connected ${serviceName.replace(/_/g, ' ')}!` });
    } else if (errorParam) {
      setAlertMsg({ type: 'error', text: `Connection failed: ${errorParam.replace(/_/g, ' ')}` });
    }

    // Fetch existing connections from backend
    fetch('/api/integrations')
      .then(res => res.json())
      .then(data => {
        if (data.integrations) setConnectedTools(data.integrations);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      animate('.int-anim', {
        opacity: [0, 1],
        y: [20, 0],
        delay: stagger(60),
        duration: 800,
        ease: 'outExpo'
      });
    }
  }, [loading]);

  const handleConnect = (service_key: string) => {
    window.location.href = `/api/integrations/oauth/${service_key}/initiate`;
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to completely disconnect this integration?')) return;
    
    try {
      const res = await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConnectedTools(prev => prev.filter(t => t.id !== id));
        setAlertMsg({ type: 'success', text: 'Integration legally disconnected.' });
      } else {
        const data = await res.json();
        setAlertMsg({ type: 'error', text: data.error || 'Failed to disconnect.' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Network connection failure.' });
    }
  };

  return (
    <div className="p-8 max-w-7xl overflow-y-auto no-scrollbar">
      {alertMsg && (
        <div className={`mb-8 p-4 rounded-xl border ${alertMsg.type === 'success' ? 'bg-green/10 border-green/30 text-green' : 'bg-red-500/10 border-red-500/30 text-red-400'} font-syne text-sm font-bold uppercase tracking-widest flex justify-between items-center`}>
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="mb-12 int-anim opacity-0">
        <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">System <span className="text-green">Tools</span></h1>
        <p className="font-syne text-[11px] text-white/40 font-[800] uppercase tracking-widest">Automatic tool synchronization across all your departments.</p>
      </div>

      <div className="space-y-16">
         {INTEGRATIONS_CATALOG.map((dept, idx) => (
            <div key={idx} className="int-anim opacity-0">
               <div className="flex items-center justify-between mb-8 border-l-2 border-green/30 pl-6">
                  <h3 className="font-syne text-xl font-[800] text-white uppercase tracking-tight">
                     {dept.name}
                  </h3>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dept.tools.map((tool, tIdx) => {
                     const connectedRecord = connectedTools.find(t => t.service_name === tool.service_key);
                     const isConnected = !!connectedRecord;
                     
                     return (
                        <div 
                          key={tIdx} 
                          className={`p-6 rounded-[2rem] border transition-all duration-300 group relative overflow-hidden ${
                             isConnected 
                             ? 'bg-green/5 border-green/20 shadow-[0_8px_30px_rgba(0,255,135,0.05)]' 
                             : 'bg-surface/30 border-white/5 hover:border-white/10 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                          }`}
                        >
                           {isConnected && (
                             <div className="absolute top-0 right-0 w-24 h-24 bg-green/5 rotate-45 translate-x-12 -translate-y-12" />
                           )}
                           
                           <div className="flex justify-between items-start mb-8 relative z-10">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-[800] text-lg shadow-inner ${isConnected ? 'bg-bg text-green' : 'bg-surface text-white/20'}`}>
                                 {tool.name.charAt(0)}
                              </div>
                              {isConnected ? (
                                 <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                                    <span className="text-[9px] font-[800] text-green uppercase tracking-widest">Connected</span>
                                 </div>
                              ) : (
                                 <span className="text-[9px] font-[800] text-white/20 uppercase tracking-widest">Disconnected</span>
                              )}
                           </div>
                           
                           <div className="relative z-10 text-left">
                              <h4 className={`font-syne font-[800] text-lg mb-1 tracking-tight uppercase ${isConnected ? 'text-white' : 'text-white/40'}`}>{tool.name}</h4>
                              <p className="font-syne text-[9px] text-white/20 font-[800] uppercase tracking-widest mb-6">{isConnected ? 'Syncing Now' : 'Tap to connect'}</p>
                              
                              {isConnected ? (
                                <button 
                                  onClick={() => handleDisconnect(connectedRecord.id)}
                                  className="w-full py-2.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white"
                                >
                                   Disconnect
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleConnect(tool.service_key)}
                                  className="w-full py-2.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest transition-all duration-300 bg-green shadow-[0_4px_15px_rgba(0,255,135,0.2)] text-bg border border-green hover:scale-[1.02]"
                                >
                                   Connect Tool
                                </button>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}

export default function IntegrationsDashboardPage() {
  return (
    <div className="h-screen bg-bg flex text-text-body font-syne overflow-hidden">
      <DashboardSidebar active="integrations" />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-bg/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-syne font-[800] text-white text-[18px] uppercase tracking-tight">Integrations</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green/10 border border-green/20">
              <span className="text-[10px] text-green font-[800] uppercase tracking-widest">Active Connection</span>
            </div>
          </div>
        </header>

        <Suspense fallback={<div className="p-8 text-white/40 font-syne font-bold">Loading Vault...</div>}>
          <IntegrationsContent />
        </Suspense>
      </main>
    </div>
  );
}
