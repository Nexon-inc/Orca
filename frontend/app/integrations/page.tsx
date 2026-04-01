'use client';

import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const IntegrationTable = ({ title, data }: { title: string, data: any[] }) => (
  <div className="integrations-anim opacity-0 space-y-6">
    <h3 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">{title} Ecosystem</h3>
    <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
      <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
        <thead>
          <tr className="border-b border-white/10 text-white/20">
            <th className="py-8 font-black">Service</th>
            <th className="py-8 font-black">Agent Capability</th>
            <th className="py-8 font-black text-center">Auth Node</th>
            <th className="py-8 font-black text-right">Connected Agents</th>
          </tr>
        </thead>
        <tbody className="text-white/40">
          {data.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
              <td className="py-5 text-white font-black">{row.name}</td>
              <td className="py-5 max-w-sm leading-relaxed">{row.use}</td>
              <td className="py-5 text-center italic text-white/20">{row.auth}</td>
              <td className="py-5 text-right text-green font-bold">{row.agents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('Marketing');

  useEffect(() => {
    animate('.integrations-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(30),
      duration: 800,
      ease: 'outExpo'
    });
  }, [activeTab]);

  const integrationData: Record<string, any[]> = {
    Marketing: [
      { name: 'LinkedIn', use: 'Aria publishes posts, schedules content, tracks engagement', auth: 'OAuth', agents: 'Aria' },
      { name: 'X / Twitter', use: 'Aria posts to X, schedules tweets, monitors mentions', auth: 'OAuth', agents: 'Aria' },
      { name: 'Meta (IG/FB)', use: 'Aria schedules posts, tracks reach and engagement on IG/FB', auth: 'OAuth', agents: 'Aria' },
      { name: 'Google Workspace', use: 'Aria tracks website traffic and SEO performance via Analytics', auth: 'OAuth', agents: 'Aria' },
      { name: 'Brevo', use: 'Aria designs and sends highly targeted email campaigns', auth: 'API Key', agents: 'Aria' }
    ],
    Sales: [
      { name: 'HubSpot', use: 'Rex manages contacts, deals, and pipeline stages', auth: 'OAuth', agents: 'Rex' },
      { name: 'Google Workspace', use: 'Rex sends outreach emails directly via Gmail', auth: 'OAuth', agents: 'Rex' },
      { name: 'Hunter.io', use: 'Rex finds verified email addresses for cold outreach', auth: 'API Key', agents: 'Rex' }
    ],
    Success: [
      { name: 'Slack', use: 'Purity sends customer health alerts and triage messages', auth: 'OAuth', agents: 'Purity' },
      { name: 'Notion', use: 'Purity creates onboarding docs and company wikis', auth: 'OAuth', agents: 'Purity' }
    ],
    Tech: [
      { name: 'GitHub', use: 'Ghost scans repos, reviews PRs, and triggers deploys', auth: 'OAuth', agents: 'Ghost' },
      { name: 'Vercel', use: 'Ghost triggers deployments and monitors build lifecycles', auth: 'API Key', agents: 'Ghost' }
        ],
    Intelligence: [
      { name: 'Notion', use: 'Roman stores intelligence reports and market signals', auth: 'OAuth', agents: 'Roman' }
    ]
  };

  return (
    <main className="min-h-screen bg-bg text-text-body font-dm-mono overflow-x-hidden">
      <Navigation />
      
      <section className="pt-48 pb-12 px-6 border-b border-white/5 bg-bg/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="integrations-anim opacity-0 font-syne text-5xl sm:text-8xl font-black text-white uppercase tracking-tighter mb-8 italic">
            Agent <span className="text-green">Linkage</span>
          </h1>
          <p className="integrations-anim opacity-0 font-dm-mono text-white/40 max-w-2xl mx-auto mb-12 uppercase tracking-tighter font-black leading-relaxed text-xs">
            Connect the platforms defined in your .env.local file. ORCA strictly executes against authorised infrastructure. Every link is encrypted using AES-256-GCM.
          </p>
          
          <div className="integrations-anim opacity-0 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {Object.keys(integrationData).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-bg shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                    : 'bg-surface/50 text-white/40 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <IntegrationTable title={activeTab} data={integrationData[activeTab]} />
        </div>
      </section>

      <Footer />
    </main>
  );
}


