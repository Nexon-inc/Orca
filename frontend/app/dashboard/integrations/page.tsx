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
  { id: 'ecommerce', name: 'E-commerce', tools: [
    { service_key: 'shopify', name: 'Shopify' },
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

const SERVICE_ICONS: Record<string, JSX.Element> = {
  slack: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.523-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.52 2.522v2.52h-2.522zM8.834 6.313a2.527 2.527 0 0 1 2.52 2.521 2.527 2.527 0 0 1-2.52 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.958 8.834a2.528 2.528 0 0 1 2.52-2.523A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.522 2.52h-2.52v-2.52zM17.688 8.834a2.527 2.527 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.167 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.167 18.958a2.528 2.528 0 0 1 2.523 2.52A2.528 2.528 0 0 1 15.167 24a2.527 2.527 0 0 1-2.52-2.522v-2.52h2.52zM15.167 17.688a2.527 2.527 0 0 1-2.52-2.521 2.527 2.527 0 0 1 2.52-2.521h6.312A2.528 2.528 0 0 1 24 15.167a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/></svg>,
  discord: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
  hubspot: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M21.573 9.493a3.507 3.507 0 0 0-2.31 6.138l-2.028 2.027a4.667 4.667 0 1 1-2.956-6.421V7.07a3.501 3.501 0 1 0-2.333 0v4.167a4.667 4.667 0 0 1 2.333 8.35v1.274a3.501 3.501 0 1 0 2.333 0v-1.274a4.667 4.667 0 0 1 2.483-7.551l2.027-2.027a3.501 3.501 0 1 0 0-4.667l-.549.548zm-11.072-5.99a1.167 1.167 0 1 1 1.166 1.166 1.167 1.167 0 0 1-1.166-1.166zm1.166 17.5a1.167 1.167 0 1 1 1.167-1.167 1.167 1.167 0 0 1-1.167 1.167zm8.75-10.5a1.167 1.167 0 1 1 0-2.333 1.167 1.167 0 0 1 0 2.333z"/></svg>,
  shopify: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M19.141 5.923l-3.328-1.07c-.118-.035-.246-.035-.364 0l-3.328 1.07c-.237.076-.237.408 0 .484l3.328 1.07c.118.035.246.035.364 0l3.328-1.07c.237-.076.237-.408 0-.484zM24 8.783v12.2c0 .542-.44 1.017-1.017 1.017H1.017C.44 22 0 21.525 0 20.983v-12.2c0-.542.44-1.017 1.017-1.017h21.966c.576 0 1.017.475 1.017 1.017zM18.814 11.237l-5.322-1.712c-.237-.076-.492-.076-.73 0l-5.32 1.712c-.44 1.017-.44 2.119 0 3.051l5.32 1.712a1.325 1.325 0 0 0 .73 0l5.322-1.712c.44-.949.44-2.051 0-3.051z"/></svg>,
  intercom: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm0 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-1-4a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/></svg>,
  notion: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M4.459 4.208c.539-.306 1.73-.787 3.326-.787 2.114 0 3.303 1.026 3.303 3.018v1.076h.111c.427-.674 1.442-1.341 2.924-1.341 1.956 0 3.344.966 3.344 2.996v7.351h-2.181v-7.01c0-1.076-.495-1.571-1.485-1.571-1.011 0-1.888.63-1.888 2.023v6.558h-2.179V8.922c0-1.123-.427-1.549-1.417-1.549-.9 0-1.755.72-1.755 1.933v7.215H2.278V7.509c0-1.842 1.056-2.903 2.181-3.301z"/></svg>,
  github: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
};

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
                                 {SERVICE_ICONS[tool.service_key] || tool.name.charAt(0)}
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
