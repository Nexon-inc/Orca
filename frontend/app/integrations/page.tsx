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
      { name: 'LinkedIn', use: 'Aria publishes posts, schedules content, tracks engagement', auth: 'OAuth', agents: 'Aria, Mark' },
      { name: 'X / Twitter', use: 'Aria posts to X, schedules tweets, monitors mentions', auth: 'OAuth', agents: 'Aria' },
      { name: 'Instagram', use: 'Aria schedules posts, tracks reach and engagement', auth: 'OAuth', agents: 'Aria' },
      { name: 'Facebook Pages', use: 'Aria publishes to your business page', auth: 'OAuth', agents: 'Aria' },
      { name: 'TikTok', use: 'Aria schedules TikTok videos and tracks performance', auth: 'OAuth', agents: 'Aria' },
      { name: 'YouTube', use: 'Aria publishes videos, manages descriptions and tags', auth: 'OAuth', agents: 'Aria, Jackie' },
      { name: 'Mailchimp', use: 'Jackie sends email campaigns and manages subscriber lists', auth: 'API Key', agents: 'Jackie' },
      { name: 'ConvertKit', use: 'Jackie manages email sequences and subscriber segments', auth: 'API Key', agents: 'Jackie' },
      { name: 'Beehiiv', use: 'Jackie publishes newsletters and tracks opens', auth: 'API Key', agents: 'Jackie' },
      { name: 'Buffer', use: 'Aria and Jackie schedule cross-platform social content', auth: 'OAuth', agents: 'Aria, Jackie' },
      { name: 'Hootsuite', use: 'Aria manages multi-platform scheduling', auth: 'OAuth', agents: 'Aria' },
      { name: 'Later', use: 'Aria plans and schedules visual social content', auth: 'OAuth', agents: 'Aria' },
      { name: 'Canva', use: 'Joe and Eric pull brand assets and generate ad creatives', auth: 'OAuth', agents: 'Joe, Eric' },
      { name: 'Figma', use: 'Joe accesses design files for brand consistency checks', auth: 'OAuth', agents: 'Joe' },
      { name: 'Google Analytics', use: 'Lucy tracks website traffic and SEO performance', auth: 'OAuth', agents: 'Lucy' },
      { name: 'Google Search Console', use: 'Lucy monitors rankings and search performance', auth: 'OAuth', agents: 'Lucy' },
      { name: 'Ahrefs', use: 'Lucy runs keyword research and backlink analysis', auth: 'API Key', agents: 'Lucy' },
      { name: 'Semrush', use: 'Lucy runs SEO audits and competitor research', auth: 'API Key', agents: 'Lucy, Roman' },
      { name: 'Webflow', use: 'Lucy and Echo update meta descriptions and page content', auth: 'API Key', agents: 'Lucy, Eric' },
      { name: 'WordPress', use: 'Jackie publishes blog posts directly to WordPress', auth: 'API Key', agents: 'Jackie' },
    ],
    Sales: [
      { name: 'HubSpot', use: 'Clara manages contacts, deals, and pipeline stages', auth: 'OAuth', agents: 'Clara, Rex' },
      { name: 'Salesforce', use: 'Clara logs deals, updates CRM records, moves pipeline stages', auth: 'OAuth', agents: 'Clara' },
      { name: 'Pipedrive', use: 'Clara tracks deals and pipeline activity', auth: 'OAuth', agents: 'Clara' },
      { name: 'Close CRM', use: 'Clara manages outreach sequences and deal tracking', auth: 'API Key', agents: 'Clara, Chase' },
      { name: 'Apollo.io', use: 'Rex finds and enriches prospect data', auth: 'API Key', agents: 'Rex' },
      { name: 'Hunter.io', use: 'Rex finds email addresses for outreach', auth: 'API Key', agents: 'Rex, Mark' },
      { name: 'Instantly', use: 'Mark manages cold email campaigns and sequences', auth: 'API Key', agents: 'Mark' },
      { name: 'Lemlist', use: 'Mark sends personalised outreach with dynamic content', auth: 'API Key', agents: 'Mark' },
      { name: 'Gmail', use: 'Mark and Chase send outreach emails directly', auth: 'OAuth', agents: 'Mark, Chase' },
      { name: 'Outlook', use: 'Mark and Chase send emails via Microsoft Outlook', auth: 'OAuth', agents: 'Mark, Chase' },
      { name: 'Calendly', use: 'Rex and Clara book discovery calls directly', auth: 'OAuth', agents: 'Rex, Clara' },
      { name: 'Google Meet', use: 'Cal and Clara schedule and create meeting links', auth: 'OAuth', agents: 'Clara' },
      { name: 'Zoom', use: 'Cal creates Zoom meetings for sales calls', auth: 'OAuth', agents: 'Clara' },
      { name: 'Stripe', use: 'Bill and Felix read revenue data, track payments', auth: 'Restricted Key', agents: 'Bill, Felix, Reid' },
      { name: 'Lemon Squeezy', use: 'Bill tracks product sales and subscription revenue', auth: 'API Key', agents: 'Bill, Felix' },
    ],
    Success: [
      { name: 'Intercom', use: 'Purity reads and responds to support conversations', auth: 'OAuth', agents: 'Purity' },
      { name: 'Crisp', use: 'Purity manages live chat and support tickets', auth: 'API Key', agents: 'Purity' },
      { name: 'Zendesk', use: 'Purity handles support tickets and FAQ updates', auth: 'OAuth', agents: 'Purity' },
      { name: 'Freshdesk', use: 'Purity manages support tickets and responses', auth: 'API Key', agents: 'Purity' },
      { name: 'Help Scout', use: 'Purity manages shared inbox and customer emails', auth: 'OAuth', agents: 'Purity' },
      { name: 'Typeform', use: 'John sends NPS surveys and collects feedback', auth: 'API Key', agents: 'John' },
      { name: 'Tally', use: 'John creates and sends feedback forms', auth: 'API Key', agents: 'John' },
      { name: 'Loom', use: 'Bruce creates onboarding video walkthroughs', auth: 'OAuth', agents: 'Bruce' },
      { name: 'Notion', use: 'Dean and Bruce create onboarding docs', auth: 'OAuth', agents: 'Bruce, Dean' },
      { name: 'Slack', use: 'Purity and Beatrice send customer health alerts', auth: 'OAuth', agents: 'Purity, Beatrice' },
    ],
    Tech: [
      { name: 'GitHub', use: 'Ghost scans repos, Cipher reviews PRs, Wren deploys', auth: 'OAuth', agents: 'Ghost, Cipher, Wren, Hex, Volt' },
      { name: 'GitLab', use: 'Code scanning, PR reviews, and deployments', auth: 'OAuth', agents: 'Ghost, Cipher, Wren, Hex' },
      { name: 'Bitbucket', use: 'Code scanning and PR reviews', auth: 'OAuth', agents: 'Ghost, Cipher' },
      { name: 'Linear', use: 'Atlas and Wren create and update engineering tasks', auth: 'OAuth', agents: 'Wren, Atlas' },
      { name: 'Jira', use: 'Wren manages sprint tasks and bug reports', auth: 'OAuth', agents: 'Wren' },
      { name: 'Vercel', use: 'Wren triggers deployments and monitors builds', auth: 'API Key', agents: 'Wren' },
      { name: 'AWS', use: 'Wren monitors services and triggers deployments', auth: 'IAM Key', agents: 'Wren' },
      { name: 'Sentry', use: 'Volt monitors errors and incidents', auth: 'API Key', agents: 'Volt' },
      { name: 'Datadog', use: 'Volt monitors uptime and performance', auth: 'API Key', agents: 'Volt' },
      { name: 'Cloudflare', use: 'Volt monitors DNS and security events', auth: 'API Key', agents: 'Volt, Ghost' },
      { name: 'Supabase', use: 'Wren monitors database health and runs migrations', auth: 'API Key', agents: 'Wren' },
    ],
    Hiring: [
      { name: 'LinkedIn', use: 'Marcus sources candidates and sends requests', auth: 'OAuth', agents: 'Marcus' },
      { name: 'Indeed', use: 'Marcus searches candidates and posts jobs', auth: 'API Key', agents: 'Marcus' },
      { name: 'Workable', use: 'Marcus and Vera manage applicants in ATS', auth: 'API Key', agents: 'Marcus, Vera' },
      { name: 'Greenhouse', use: 'Vera manages candidate pipelines', auth: 'API Key', agents: 'Vera' },
      { name: 'Calendly', use: 'Eli manages interview scheduling', auth: 'OAuth', agents: 'Eli' },
      { name: 'Notion', use: 'Nina and Dean create onboarding wikis', auth: 'OAuth', agents: 'Nina, Eli' },
      { name: 'BambooHR', use: 'Eli manages employee records', auth: 'API Key', agents: 'Eli' },
    ],
    Ops: [
      { name: 'Notion', use: 'Dean creates internal docs, wikis, and SOPs', auth: 'OAuth', agents: 'Dean' },
      { name: 'Google Calendar', use: 'Cal schedules meetings and blocks focus time', auth: 'OAuth', agents: 'Cal' },
      { name: 'Google Drive', use: 'Dean stores documents and accesses files', auth: 'OAuth', agents: 'Dean' },
      { name: 'Slack', use: 'Iris triages messages and sends notifications', auth: 'OAuth', agents: 'Iris, Owen' },
      { name: 'Asana', use: 'Atlas manages projects and assignments', auth: 'OAuth', agents: 'Atlas' },
      { name: 'Monday.com', use: 'Atlas tracks project status and team tasks', auth: 'OAuth', agents: 'Atlas' },
      { name: 'Zapier', use: 'Owen creates automated workflows between tools', auth: 'API Key', agents: 'Owen' },
      { name: 'Make', use: 'Owen builds complex automation workflows', auth: 'API Key', agents: 'Owen' },
    ],
    Finance: [
      { name: 'Stripe', use: 'Bill creates invoices, Felix tracks revenue', auth: 'Restricted Key', agents: 'Bill, Felix, Reid' },
      { name: 'PayPal', use: 'Bill tracks payments and history', auth: 'OAuth', agents: 'Bill, Felix' },
      { name: 'QuickBooks', use: 'Felix reconciles expenses and generates reports', auth: 'OAuth', agents: 'Felix, Cora' },
      { name: 'Xero', use: 'Felix manages accounting and reconciliation', auth: 'OAuth', agents: 'Felix, Cora' },
      { name: 'Mercury', use: 'Felix monitors business bank account activity', auth: 'API Key', agents: 'Felix, Reid' },
      { name: 'DocuSign', use: 'Lena sends contracts for signature', auth: 'OAuth', agents: 'Lena' },
      { name: 'Notion', use: 'Lena stores contract templates and legal docs', auth: 'OAuth', agents: 'Lena, Dean' },
    ],
    Intelligence: [
      { name: 'Perplexity AI', use: 'Roman runs deep research web queries', auth: 'API Key', agents: 'Roman' },
      { name: 'Notion', use: 'Nate stores intelligence reports', auth: 'OAuth', agents: 'Nate, Roman' },
      { name: 'RSS Feeds', use: 'Sage monitors blogs and industry pubs', auth: 'URL', agents: 'Sage' },
      { name: 'SimilarWeb', use: 'Roman analyses competitor web traffic', auth: 'API Key', agents: 'Roman' },
      { name: 'Semrush', use: 'Roman tracks competitor SEO positioning', auth: 'API Key', agents: 'Roman, Lucy' },
      { name: 'Reddit', use: 'Sage monitors subreddits for signals', auth: 'OAuth', agents: 'Sage' },
    ],
    Community: [
      { name: 'Discord', use: 'Milo moderates and posts announcements', auth: 'OAuth', agents: 'Milo' },
      { name: 'Circle', use: 'Milo manages community spaces and posts', auth: 'API Key', agents: 'Milo' },
      { name: 'X / Twitter', use: 'Kai amplifies brand content', auth: 'OAuth', agents: 'Kai, Zoe' },
      { name: 'Instagram', use: 'Zoe manages influencer outreach', auth: 'OAuth', agents: 'Zoe, Kai' },
      { name: 'YouTube', use: 'Kai manages channel growth strategy', auth: 'OAuth', agents: 'Kai' },
      { name: 'Product Hunt', use: 'Spike tracks launch performance', auth: 'API Key', agents: 'Spike' },
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
            Connect the stacks your company runs on. When integrated, ORCA agents execute real actions — not just suggestions. Every link is encrypted using AES-256-GCM.
          </p>
          
          <div className="integrations-anim opacity-0 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {Object.keys(integrationData).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-green border-green text-bg' : 'border-white/5 text-white/20 hover:border-white/10 hover:text-white/40'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <IntegrationTable title={activeTab} data={integrationData[activeTab]} />
          
          <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="integrations-anim opacity-0 space-y-6 p-8 rounded-[2.5rem] bg-surface/30 border border-white/5">
                <h3 className="font-syne text-[10px] font-black text-green uppercase tracking-[0.4em]">CONNECTING</h3>
                <div className="space-y-4 text-[10px] text-white/40 font-dm-mono uppercase tracking-tighter font-black">
                   <p className="text-white italic underline">OAuth Flow:</p>
                   <p>1. Dashboard &rarr; Integrations &rarr; Link</p>
                   <p>2. Authorize via external service portal</p>
                   <p>3. Redirected back with secure token node</p>
                </div>
             </div>

             <div className="integrations-anim opacity-0 space-y-6 p-8 rounded-[2.5rem] bg-surface/30 border border-white/5">
                <h3 className="font-syne text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">API LINKAGE</h3>
                <div className="space-y-4 text-[10px] text-white/40 font-dm-mono uppercase tracking-tighter font-black">
                   <p className="text-white italic underline">Restricted Keys:</p>
                   <p>1. Input restricted API key scope</p>
                   <p>2. Key encrypted at rest (AES-256)</p>
                   <p>3. Agents verified for external execution</p>
                </div>
             </div>

             <div className="integrations-anim opacity-0 space-y-6 p-8 rounded-[2.5rem] bg-green/5 border border-dashed border-green/20">
                <h3 className="font-syne text-[10px] font-black text-green uppercase tracking-[0.4em]">SECURITY</h3>
                <p className="text-[10px] text-white/60 font-dm-mono uppercase tracking-tighter font-black leading-relaxed">
                   Integrations are scoped to minimum required permissions. Disconnecting instantly revokes tokens and wipes credentials from our vault. Agents cannot bypass your human approval gate.
                </p>
             </div>
          </div>

          <div className="mt-20 py-12 border-t border-white/5 flex flex-col items-center text-center gap-6">
             <h4 className="font-syne text-xl font-black text-white uppercase tracking-tight italic">Missing a service?</h4>
             <p className="text-[10px] text-white/20 font-dm-mono uppercase tracking-widest font-black max-w-lg">
                Email integrations@nexonic.com to request custom linkage. Enterprise customers can leverage the Custom API to build proprietary nodes.
             </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
