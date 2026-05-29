'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INTEGRATION_CATALOG } from '@/lib/integrations/catalog';

/** Chat vault — same catalog as Dashboard → Integrations */
const INTEGRATIONS_CATALOG = INTEGRATION_CATALOG.map((group) => ({
  id: group.id,
  name: group.name,
  tools: group.tools.map((tool) => ({
    service_key: tool.service_key,
    name: tool.name,
    auth_method: 'oauth' as const,
    color: tool.color,
  })),
}));

export default function IntegrationsVault() {
  return (
    <Suspense fallback={<div className="p-8 text-white/40 font-syne font-bold uppercase tracking-widest text-[10px]">Accessing Vault...</div>}>
      <IntegrationsInner />
    </Suspense>
  );
}

function IntegrationsInner() {  const searchParams = useSearchParams();
  const [connectedTools, setConnectedTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [apikeyModal, setApikeyModal] = useState<{service: any} | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [submittingKey, setSubmittingKey] = useState(false);

  useEffect(() => {
    const isSuccess = searchParams.get('success');
    const serviceName = searchParams.get('service');
    const errorParam = searchParams.get('error');

    if (isSuccess === 'true' && serviceName) {
      setAlertMsg({ type: 'success', text: `Successfully connected ${serviceName.replace(/_/g, ' ')}!` });
    } else if (errorParam) {
      const serviceLabel = (searchParams.get('service') || '').replace(/_/g, ' ')
      const toolkit = searchParams.get('toolkit') || ''
      const errorMessages: Record<string, string> = {
        composio_missing_api_key:
          'Composio is not configured. Add COMPOSIO_API_KEY to your environment.',
        no_composio_auth_config: toolkit
          ? `No Composio auth config for "${toolkit}". Create one in composio.dev for this toolkit.`
          : 'No Composio auth config found for this integration.',
        composio_api_error: 'Composio API rejected the request. Check COMPOSIO_API_KEY and toolkit slug.',
        composio_link_failed: 'Composio could not start the OAuth link session.',
        composio_connect_exception: 'Unexpected error while connecting via Composio.',
      }
      const detail =
        errorMessages[errorParam] ||
        `Connection failed: ${errorParam.replace(/_/g, ' ')}${serviceLabel ? ` (${serviceLabel})` : ''}`
      setAlertMsg({ type: 'error', text: detail })
    }

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

  const handleConnect = (tool: any) => {
    if (tool.auth_method === 'oauth') {
      window.location.href = `/api/integrations/oauth/${tool.service_key}/initiate`;
    } else {
      setApikeyModal({ service: tool });
      setApiKeyValue('');
    }
  };

  const submitApiKey = async () => {
    if (!apiKeyValue || !apikeyModal) return;
    setSubmittingKey(true);
    try {
      const res = await fetch('/api/integrations/apikey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_key: apikeyModal.service.service_key, api_key: apiKeyValue })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: ` connected successfully!` });
        setApikeyModal(null);
        const fresh = await fetch('/api/integrations').then(r => r.json());
        if (fresh.integrations) setConnectedTools(fresh.integrations);
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Failed to connect.' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Network failure.' });
    } finally {
      setSubmittingKey(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect?')) return;
    try {
      const res = await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConnectedTools(prev => prev.filter(t => t.id !== id));
        setAlertMsg({ type: 'success', text: 'Integration disconnected.' });
      } else {
        const data = await res.json();
        setAlertMsg({ type: 'error', text: data.error || 'Failed to disconnect.' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Network failure.' });
    }
  };

  return (
    <div className="p-0 overflow-y-auto no-scrollbar relative">
      {alertMsg && (
        <div className="mb-8 p-4 rounded-xl border font-syne text-sm font-bold uppercase tracking-widest flex justify-between items-center">
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {apikeyModal && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-surface border border-white/5 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl" style={{ color: apikeyModal.service.color }}>
                   {apikeyModal.service.name.charAt(0)}
                </div>
                <div>
                   <h3 className="font-syne text-xl font-[800] text-white uppercase tracking-tight">Connect {apikeyModal.service.name}</h3>
                   <p className="text-[10px] text-white/40 font-[800] uppercase tracking-widest">Enter your API key to sync tools.</p>
                </div>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="block text-[10px] text-white/40 font-[800] uppercase tracking-[0.2em] mb-3 ml-1">API Secret Key</label>
                   <input 
                     type="password"
                     value={apiKeyValue}
                     onChange={(e) => setApiKeyValue(e.target.value)}
                     placeholder="Paste key here..."
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-syne text-sm focus:border-green transition-all outline-none"
                   />
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setApikeyModal(null)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white/40 font-[800] text-[11px] uppercase tracking-widest rounded-xl hover:text-white transition-all">Cancel</button>
                   <button disabled={!apiKeyValue || submittingKey} onClick={submitApiKey} className="flex-1 py-4 bg-green text-bg font-[800] text-[11px] uppercase tracking-widest rounded-xl shadow-[0_4px_20px_rgba(0,255,135,0.2)] disabled:opacity-50 transition-all hover:scale-[1.02]">
                     {submittingKey ? 'Verifying...' : 'Establish link →'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="font-syne text-3xl font-[800] text-white mb-2 tracking-tight uppercase">Platform <span className="text-green">Integrations</span></h1>
        <p className="font-syne text-[11px] text-white/40 font-[800] uppercase tracking-widest">
          {INTEGRATIONS_CATALOG.reduce((n, g) => n + g.tools.length, 0)} platforms via Composio · OAuth connect
        </p>
      </div>

      <div className="space-y-16 pb-24">
         {INTEGRATIONS_CATALOG.map((dept, idx) => (
            <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
               <div className="flex items-center justify-between mb-8 border-l-2 border-green/30 pl-6">
                  <h3 className="font-syne text-xl font-[800] text-white uppercase tracking-tight">{dept.name}</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dept.tools.map((tool, tIdx) => {
                     const connectedRecord = connectedTools.find(t => t.service_name === tool.service_key);
                     const isConnected = !!connectedRecord;
                     return (
                        <div key={tIdx} className="p-8 min-h-[280px] rounded-[2.5rem] border border-white/5 bg-white/[0.02] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between hover:border-green/20 hover:bg-white/[0.04]">
                           <div className="flex justify-between items-start mb-10">
                               <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 shadow-xl group-hover:scale-110" style={{ backgroundColor: `${tool.color}15`, color: tool.color, border: '1px solid currentColor' }}>
                                 {tool.name.charAt(0)}
                               </div>
                               {isConnected ? (
                                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 border border-green/20 shadow-[0_0_15px_rgba(0,255,135,0.1)]">
                                   <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                                   <span className="text-[9px] font-black text-green uppercase tracking-widest">LINKED</span>
                                 </div>
                               ) : (
                                 <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] pt-1">UNLINKED</span>
                               )}
                           </div>
                           <div className="text-left">
                              <h4 className="font-syne font-black text-xl mb-1.5 tracking-tight uppercase text-white">{tool.name}</h4>
                              <p className="font-syne text-[9px] text-white/30 font-black uppercase tracking-[0.15em] mb-8">
                                {isConnected ? 'Link Secure & Operational' : 'Ready for Neural Link'}
                              </p>
                              {isConnected ? (
                                <button onClick={() => handleDisconnect(connectedRecord.id)} className="w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 bg-white/5 text-white/20 border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20">
                                  Disconnect
                                </button>
                              ) : (
                                <button onClick={() => handleConnect(tool)} className="w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 bg-green/5 text-green border border-green/20 group-hover:bg-green group-hover:text-bg group-hover:border-green group-hover:shadow-[0_8px_25px_rgba(0,255,135,0.3)]">
                                  Establish Link →
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