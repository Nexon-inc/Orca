'use client';

import { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type SectionKey = 
  | 'Introduction' | 'Installation' | 'Quick Start Guide'
  | 'The Org Chart' | 'Department Mapping' | 'Agent Roster' | 'Role Definitions' | 'Operating Modes'
  | 'Hand-offs' | 'Triggers' | 'Protocol Alpha' | 'Sync Mechanisms'
  | 'GitHub Setup' | 'Stripe Bridge' | 'Slack Notifications' | 'Custom API'
  | 'Data Isolation' | 'Encryption Standards' | 'Audit Logs' | 'SOC 2 Compliance';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>('Introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      animate('.docs-content-anim', {
        opacity: [0, 1],
        y: [10, 0],
        duration: 600,
        easing: 'easeOutExpo'
      });
    }
  }, [activeSection]);

  const sections = [
    { 
      group: 'Getting Started', 
      items: ['Introduction', 'Installation', 'Quick Start Guide'] 
    },
    { 
      group: 'Core Concepts', 
      items: ['The Org Chart', 'Department Mapping', 'Agent Roster', 'Role Definitions', 'Operating Modes'] 
    },
    { 
      group: 'Coordination', 
      items: ['Hand-offs', 'Triggers', 'Protocol Alpha', 'Sync Mechanisms'] 
    },
    { 
      group: 'Integrations', 
      items: ['GitHub Setup', 'Stripe Bridge', 'Slack Notifications', 'Custom API'] 
    },
    { 
      group: 'Security', 
      items: ['Data Isolation', 'Encryption Standards', 'Audit Logs', 'SOC 2 Compliance'] 
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'Introduction':
        return (
          <div className="docs-content-anim space-y-8">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Introduction</h1>
            <p className="text-lg text-white/60 leading-relaxed font-dm-mono uppercase tracking-tighter font-black">
              ORCA is an AI Company OS built by Nexonic Industries. It gives any company â€” from a solo founder to a 15-person team â€” a full AI workforce across 5 departments and 6 executive agents, all coordinated in one dashboard.
            </p>
            <div className="prose prose-invert max-w-none text-white/40 font-dm-mono uppercase tracking-tighter font-black space-y-6">
              <p>ORCA is not a chatbot. It is not a prompt tool. It is not another automation layer on top of your existing tools. ORCA is an operating system for your company. Agents have roles, memory, and the ability to coordinate with each other across departments â€” just like a real team would.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 text-white">
                <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                  <h3 className="text-white font-syne text-xl mb-4 italic uppercase">What ORCA replaces</h3>
                  <ul className="list-none space-y-2 text-sm italic text-white/40">
                    <li>- The need to hire a full Marketing, Sales, Ops, Finance, Tech, and Hiring team</li>
                    <li>- The 8â€“12 disconnected tools you're currently using and manually bridging</li>
                    <li>- The hours you spend being the bottleneck between departments</li>
                  </ul>
                </div>
                <div className="p-8 rounded-3xl border border-white/5 bg-green/5">
                  <h3 className="text-green font-syne text-xl mb-4 italic uppercase">What ORCA gives you</h3>
                  <ul className="list-none space-y-2 text-sm italic text-white/40">
                    <li>- 5 AI departments with 6 executive agents</li>
                    <li>- Cross-department coordination with human approval gates</li>
                    <li>- Role-based access for your human team (Owner, Co-founder, Head, Member, Advisor)</li>
                    <li>- The full Nexonic ecosystem (CyberGuard, Render.AI, Intuition, The Summit, Island of Relevancy) built in</li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-white font-syne text-xl mb-4 italic uppercase">Who ORCA is for</h3>
                <p>Solo founders, co-founders, indie hackers, and early-stage startups with 1â€“15 people who need to operate like a scaled company without the payroll to match.</p>
              </div>
            </div>
          </div>
        );
      case 'Installation':
        return (
          <div className="docs-content-anim space-y-8">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Installation</h1>
            <p className="text-lg text-white/60 leading-relaxed font-dm-mono uppercase tracking-tighter font-black">
              ORCA is a web-based platform. There is nothing to install.
            </p>
            <div className="space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
              <div className="space-y-6">
                <h3 className="text-white text-xl italic uppercase">To get started:</h3>
                <ol className="list-decimal list-inside space-y-3 p-8 bg-surface/30 rounded-3xl border border-white/5">
                  <li>Go to nexonic-industries.vercel.app</li>
                  <li>Click "Join Early Access" or "Start Free Trial"</li>
                  <li>Create your account with your email and password</li>
                  <li>Complete the 5-step onboarding flow</li>
                  <li>Your dashboard is live</li>
                </ol>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-surface/50 border border-white/10">
                   <h4 className="text-white mb-2 italic">System Requirements</h4>
                   <p className="text-xs">Any modern browser (Chrome, Firefox, Safari, Edge). Internet connection required. No downloads, no plugins, no extensions required.</p>
                </div>
                <div className="p-6 rounded-2xl bg-surface/50 border border-white/10">
                   <h4 className="text-white mb-2 italic">Mobile</h4>
                   <p className="text-xs">ORCA works on mobile browsers. A dedicated mobile app is on the roadmap.</p>
                </div>
              </div>

              <div className="p-8 rounded-3xl border border-blue-500/20 bg-blue-500/5">
                 <h4 className="text-blue-400 mb-4 italic">API Access</h4>
                 <p className="text-sm">API access is available on the Enterprise plan. See the Custom API section in Integrations for setup instructions.</p>
              </div>
            </div>
          </div>
        );
      case 'Quick Start Guide':
        return (
          <div className="docs-content-anim space-y-12">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter leading-tight">Quick Start <br/><span className="text-green">Guide</span></h1>
            <div className="space-y-16">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <span className="text-3xl font-syne font-black text-white/10">01</span>
                   <h3 className="text-white font-syne text-xl font-black uppercase tracking-tight">Create your account</h3>
                </div>
                <p className="text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed pl-12">
                   Sign up at nexonic-industries.vercel.app. You'll receive a welcome email from ORCA via Resend confirming your account.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-3xl font-syne font-black text-white/10">02</span>
                   <h3 className="text-white font-syne text-xl font-black uppercase tracking-tight">Complete onboarding (5 minutes)</h3>
                </div>
                <p className="text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed pl-12 mb-6">
                   The onboarding flow collects your company context. This is what your agents use to understand who they're working for. Do not skip it â€” the more context you provide, the better your agents perform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12 text-[10px] font-dm-mono font-black uppercase tracking-widest text-white/20">
                   <div className="p-4 rounded-xl border border-white/5">- Brief your workforce (Mission, Voice, ICP)</div>
                   <div className="p-4 rounded-xl border border-white/5">- Build your org chart (Activate departments)</div>
                   <div className="p-4 rounded-xl border border-white/5">- Set operating mode (Autopilot/Approve)</div>
                   <div className="p-4 rounded-xl border border-white/5">- Connect your stack (Link tools)</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-3xl font-syne font-black text-white/10">03</span>
                   <h3 className="text-white font-syne text-xl font-black uppercase tracking-tight">Brief your first agent</h3>
                </div>
                <p className="text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed pl-12 mb-6">
                   Open a department from the sidebar. Click an agent pill. Type your brief in the input box. Hit send.
                </p>
                <div className="p-8 rounded-3xl bg-green/5 border border-dashed border-green/20 ml-12 space-y-4">
                   <h4 className="text-green text-xs font-black uppercase tracking-widest">Your agent will:</h4>
                   <ul className="text-[11px] text-white/40 font-black uppercase tracking-tighter space-y-2 italic">
                      <li>- Acknowledge the brief</li>
                      <li>- Execute the task using your company context</li>
                      <li>- Return a result card with action items</li>
                      <li>- Wait for approval before any external action</li>
                   </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <span className="text-3xl font-syne font-black text-white/10">04</span>
                   <h3 className="text-white font-syne text-xl font-black uppercase tracking-tight">Review and approve</h3>
                </div>
                <p className="text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed pl-12">
                   If your operating mode is Approve First, agent outputs appear with an Approve button. Review the output. Click Approve to execute or Reject to cancel.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <span className="text-3xl font-syne font-black text-white/10">05</span>
                   <h3 className="text-white font-syne text-xl font-black uppercase tracking-tight">Watch the coordination feed</h3>
                </div>
                <p className="text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed pl-12">
                   As your agents work, cross-department handoffs appear in the Coordination Feed on your Command Center. This is where you see agents passing work to each other in real time.
                </p>
              </div>
            </div>
          </div>
        );
      case 'The Org Chart':
        return (
          <div className="docs-content-anim space-y-8">
             <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">The Org Chart</h1>
             <p className="text-lg text-white/60 leading-relaxed font-dm-mono uppercase tracking-tighter font-black">
                ORCA is built around a company org chart â€” not a flat list of AI tools. Every element of ORCA maps to how a real company is structured.
             </p>
             <div className="p-8 rounded-[3rem] bg-surface/30 border border-white/5 font-dm-mono text-xs text-green/60">
                <pre className="whitespace-pre-wrap">
{`Owner / CEO
  â””â”€â”€ Co-founder (optional, same access level)
      â””â”€â”€ Department Heads (one per department)
          â””â”€â”€ Department Members
              â””â”€â”€ Executive AI Agent (1 per department)`}
                </pre>
             </div>
             <div className="space-y-6 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
                <div className="space-y-4">
                  <h3 className="text-white text-lg italic uppercase">HOW IT WORKS IN PRACTICE</h3>
                  <ul className="list-none space-y-3">
                    <li>- The Owner sees everything â€” all departments, all agent activity, all approval queues, all team reports</li>
                    <li>- Department Heads manage their department, approve agent actions within it, and approve or reject incoming requests</li>
                    <li>- Members brief agents in their assigned department only</li>
                    <li>- AI Agents execute tasks, coordinate with each other, and escalate to humans when required</li>
                  </ul>
                </div>

                <div className="pt-8 border-t border-white/5">
                   <h3 className="text-white text-lg italic uppercase">WHY THIS MATTERS</h3>
                   <p className="leading-relaxed">Most AI tools give you a single agent doing a single task. ORCA gives you a structured workforce where every agent knows their role, their department, and who they report to. This is what makes coordination possible.</p>
                </div>
             </div>
          </div>
        );
      case 'Department Mapping':
        return (
          <div className="docs-content-anim space-y-8">
             <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Department Mapping</h1>
             <p className="text-white/40 font-dm-mono uppercase tracking-tighter font-black">ORCA has 5 active departments. Each maps to a real company function.</p>
             <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
                <table className="w-full text-left font-dm-mono text-[11px] uppercase tracking-tighter font-black">
                   <thead>
                      <tr className="border-b border-white/10 text-white/20">
                         <th className="py-6 font-black shrink-0">Department</th>
                         <th className="py-6 font-black">What it covers</th>
                         <th className="py-6 font-black">Agents</th>
                      </tr>
                   </thead>
                   <tbody className="text-white/60">
                      {[
                        { dept: 'ðŸ“£ Marketing', covers: 'Content, social, SEO, ads, brand voice', agents: 'Aria, Jackie, Eric, Lucy, Joe' },
                        { dept: 'ðŸ’¼ Sales & Revenue', covers: 'Lead prospecting, outreach, CRM, follow-up, intel', agents: 'Rex, Clara, Chase, Mark, Teo' },
                        { dept: 'ðŸ¤ CS', covers: 'Support, onboarding, retention, NPS, health', agents: 'Purity, Bruce, Nadia, John, Beatrice' },
                        { dept: 'ðŸ›¡ï¸ Tech & Security', covers: 'Security, code review, DevOps, docs, incidents', agents: 'Ghost, Cipher, Wren, Hex, Volt' },
                        { dept: 'ðŸ§  Hiring', covers: 'Talent sourcing, screening, verification, offers', agents: 'Marcus, Vera, Zara, Eli, Nina' },
                        { dept: 'ðŸ“‹ Operations', covers: 'Project mgmt, calendar, notes, inbox, coordination', agents: 'Atlas, Cal, Dean, Iris, Owen' },
                        { dept: 'ðŸ“Š Finance & Legal', covers: 'Invoicing, expenses, contracts, budget, audit', agents: 'Bill, Felix, Lena, Reid, Cora' },
                        { dept: 'ðŸ” Intelligence', covers: 'Research, market signals, summaries, forecasting', agents: 'Roman, Sage, Nate, Ada, Dex' },
                        { dept: 'ðŸŒ Community', covers: 'Growth experiments, partnerships, influencers', agents: 'Spike, Milo, Rio, Zoe, Kai' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                           <td className="py-4 text-white font-black">{row.dept}</td>
                           <td className="py-4">{row.covers}</td>
                           <td className="py-4 text-green">{row.agents}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="pt-12 space-y-6">
                <h3 className="text-white text-lg font-syne italic uppercase">PLAN ACCESS</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { plan: 'Free', access: '2 Depts' },
                     { plan: 'Builder', access: 'All 5' },
                     { plan: 'Pro', access: 'All 5' },
                     { plan: 'Enterprise', access: 'All 5 + Custom' },
                   ].map(p => (
                     <div key={p.plan} className="p-4 rounded-xl bg-surface/50 border border-white/5 text-center">
                        <div className="text-[10px] text-white/20 font-black uppercase mb-1">{p.plan}</div>
                        <div className="text-xs text-white font-black uppercase tracking-widest">{p.access}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );
      case 'Operating Modes':
        return (
          <div className="docs-content-anim space-y-12">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Operating Modes</h1>
            <p className="text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed">
               Every department in ORCA can be set to one of three operating modes. You set this globally during onboarding and can adjust per department in Account â†’ Agent Permissions.
            </p>
            <div className="grid grid-cols-1 gap-6">
              {[
                { title: 'Autopilot', color: 'blue-500', desc: 'Agents execute tasks automatically without waiting for approval. Everything is logged in the audit trail. Agents notify you of what they did after the fact. Best for: routine tasks you fully trust, like scheduling, meeting notes, daily summaries.' },
                { title: 'Approve First', color: 'green', desc: 'Agents prepare the full output and wait for your approval before taking any external action. You review the result card, click Approve or Reject. Nothing goes out until you say so. Best for: anything that touches customers, code, or money.' },
                { title: 'Suggest Only', color: 'yellow-500', desc: 'Agents draft outputs and deliver them to you for review. They do not attempt to execute externally even if approved â€” they hand the suggestion to you and you execute manually. Best for: when you want AI assistance but prefer to handle execution yourself.' },
              ].map(mode => (
                <div key={mode.title} className="p-8 rounded-3xl border border-white/5 bg-surface/50 hover:border-white/10 transition-all">
                  <h3 className={`text-${mode.color === 'green' ? 'green' : mode.color} font-syne text-xl font-black uppercase tracking-tight mb-2`}>{mode.title}</h3>
                  <p className="text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed italic">{mode.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-[3rem] bg-red-500/5 border border-red-500/20">
               <h3 className="text-red-500 font-syne text-lg font-black uppercase tracking-tight mb-4 italic">MASTER KILL SWITCH</h3>
               <p className="text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed">
                  In Account â†’ Agent Permissions, there is a Pause All Agents toggle. When activated, all agent activity across all departments stops immediately. Use this if something goes wrong or if you need to step away.
               </p>
            </div>
          </div>
        );
      case 'Protocol Alpha':
        return (
          <div className="docs-content-anim space-y-8">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Protocol Alpha</h1>
            <p className="text-lg text-white/60 leading-relaxed font-dm-mono uppercase tracking-tighter font-black">
              Protocol Alpha is ORCA's internal coordination standard. Every cross-department hand-off, trigger, and agent communication follows Protocol Alpha to ensure consistency, traceability, and human control.
            </p>
            <div className="space-y-6 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
               <div className="p-8 rounded-[3rem] bg-green/5 border border-dashed border-green/20 space-y-4">
                  <h4 className="text-green uppercase italic text-lg">PROTOCOL DEFINITIONS</h4>
                  <ul className="list-none space-y-3 text-xs italic">
                    <li>- How agents flag coordination needs: [COORDINATION_NEEDED: dept=X, agent=Y, reason=Z]</li>
                    <li>- Maximum coordination chain depth: 3 hops</li>
                    <li>- Auto-approval eligibility logic</li>
                    <li>- Immutable audit trail logging</li>
                  </ul>
               </div>

               <div className="pt-8 space-y-4">
                  <h3 className="text-white font-syne uppercase tracking-tight italic">COORDINATION DEPTH LIMIT</h3>
                  <p className="text-sm leading-relaxed">ORCA enforces a maximum chain depth of 3. If Agent A hands off to Agent B who hands off to Agent C who tries to hand off to Agent D, the chain is stopped. The Owner is notified and must decide whether to continue manually. This prevents infinite coordination loops.</p>
               </div>
            </div>
          </div>
        );
      case 'Agent Roster':
        return (
          <div className="docs-content-anim space-y-12">
             <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Agent Roster</h1>
             <p className="text-lg text-white/60 leading-relaxed font-dm-mono uppercase tracking-tighter font-black">
                ORCA has 45 specialized agents â€” 5 per department. Each agent has a name, a role, a unique icon, and a specific system prompt injected with your company context.
             </p>
             
             <div className="space-y-6">
                <h3 className="text-white font-syne text-lg uppercase italic">HOW AGENTS ARE DISPLAYED</h3>
                <p className="text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed">
                   Each agent appears as a pill above the input box in their department workspace. The pill shows the agent's icon, name, and role truncated. Click a pill to open that agent's full workspace â€” their hero header, status, task count, and message thread.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl border border-white/5 bg-surface/50 space-y-4">
                   <h3 className="text-white font-syne uppercase tracking-tight italic">AGENT MEMORY</h3>
                   <p className="text-xs text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed">
                      Every agent has access to your company context (mission, brand voice, ICP) from your Company Identity settings. They never start from a blank slate.
                   </p>
                </div>
                <div className="p-8 rounded-3xl border border-white/5 bg-surface/50 space-y-4">
                   <h3 className="text-white font-syne uppercase tracking-tight italic">AGENT STATUS</h3>
                   <div className="space-y-3 font-dm-mono text-[10px] uppercase tracking-widest font-black">
                     <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-green" /> ACTIVE â€” EXECUTING TASK</div>
                     <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> BUSY â€” TASK QUEUED</div>
                     <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-white/10" /> IDLE â€” AVAILABLE</div>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'Role Definitions':
        return (
          <div className="docs-content-anim space-y-12">
             <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Role Definitions</h1>
             <p className="text-white/40 font-dm-mono uppercase tracking-tighter font-black text-sm leading-relaxed">
                ORCA has 5 human roles. Each has different access levels across the dashboard.
             </p>
             <div className="space-y-8">
                {[
                  { 
                    role: 'Owner / CEO', 
                    bullets: [
                      'Full access to everything',
                      'Accesses All departments, Review, Teams, Billing, and all 7 Account tabs',
                      'Can invite all role types',
                      'Only person who can delete the organisation',
                      'Default role when you sign up'
                    ]
                  },
                  { 
                    role: 'Co-founder', 
                    bullets: [
                      'Same access as Owner except organisation deletion',
                      'Cannot change the Owner\'s role',
                      'Can invite Co-founders, Heads, Members, Advisors',
                      'Billing access must be granted by Owner'
                    ]
                  },
                  { 
                    role: 'Department Head', 
                    bullets: [
                      'Scoped to assigned department only',
                      'Approves all tasks and incoming handoffs for their department',
                      'Submits weekly department reports',
                      'Can invite Members to their own department',
                      'Cannot see other departments or company-wide stats'
                    ]
                  },
                  { 
                    role: 'Member', 
                    bullets: [
                      'Scoped to assigned department only',
                      'Can brief agents freely',
                      'Cross-department requests require Head approval',
                      'Cannot manage teams, billing, or inviting others'
                    ]
                  },
                  { 
                    role: 'Advisor', 
                    bullets: [
                      'Read-only access',
                      'Can view reports and agent activity',
                      'Cannot brief agents or approve anything',
                      'Cannot invite anyone'
                    ]
                  },
                ].map(r => (
                  <div key={r.role} className="p-8 rounded-[2rem] border border-white/5 bg-surface/30 space-y-4">
                     <h3 className="text-white font-syne font-black uppercase tracking-tight text-xl">{r.role}</h3>
                     <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-[11px] text-white/40 font-dm-mono uppercase tracking-tighter font-black italic list-none">
                        {r.bullets.map((b, i) => (
                          <li key={i}>- {b}</li>
                        ))}
                     </ul>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'Hand-offs':
        return (
          <div className="docs-content-anim space-y-8">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Hand-offs</h1>
            <p className="text-lg text-white/60 leading-relaxed font-dm-mono uppercase tracking-tighter font-black italic">
               A hand-off is when one agent passes work to another agent in a different department. 
            </p>
            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 italic text-sm text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-tight">
               "Aria (Marketing) warms up 47 leads through a LinkedIn content campaign. She detects that these leads are ready for sales outreach. She drafts a hand-off request to Rex (Sales & Revenue)."
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
               <div className="space-y-6">
                  <h3 className="text-white font-syne uppercase tracking-tight italic text-lg">APPROVAL CHAIN</h3>
                  <div className="space-y-2 text-xs italic">
                    <p>1. Agent flags [COORDINATION_NEEDED]</p>
                    <p>2. Outgoing Head approves request</p>
                    <p>3. Incoming Head accepts work</p>
                    <p>4. Receiving agent executes</p>
                    <p>5. Logged to coordination feed</p>
                  </div>
               </div>
               <div className="p-8 rounded-3xl bg-surface/50 border border-white/5 space-y-4">
                  <h3 className="text-white font-syne uppercase tracking-tight italic text-xs">AUTO-APPROVED HAND-OFFS</h3>
                  <p className="text-[10px] text-white/20 italic leading-relaxed">
                     Low-stakes informational handoffs (e.g. Oracle passing a market summary to Nate) are auto-approved and logged without requiring human intervention.
                  </p>
               </div>
            </div>
          </div>
        );
      case 'Triggers':
        return (
          <div className="docs-content-anim space-y-8">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter whitespace-pre-wrap leading-tight">Sync <br/><span className="text-green">Triggers</span></h1>
            <p className="text-lg text-white/60 leading-relaxed font-dm-mono uppercase tracking-tighter font-black">
               A trigger is an automatic action one agent takes based on an event in another department.
            </p>
            <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
               <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
                  <thead>
                     <tr className="border-b border-white/10 text-white/20">
                        <th className="py-6 shrink-0">Trigger event</th>
                        <th className="py-6">Agent Group</th>
                        <th className="py-6">Action taken</th>
                     </tr>
                  </thead>
                  <tbody className="text-white/40">
                     {[
                       { event: 'Deal closes in CRM', agents: 'Clara â†’ Bruce', action: 'Onboarding sequence triggered' },
                       { event: 'Marketing lead qualifies', agents: 'Vera â†’ Zara', action: 'Sales outreach initiated' },
                       { event: 'Vulnerability detected', agents: 'Ghost â†’ Volt', action: 'Incident response triggered' },
                       { event: 'New lead in pipeline', agents: 'Rex â†’ Chase', action: 'Follow-up sequence queued' },
                       { event: 'Budget limit reached', agents: 'Reid â†’ Atlas', action: 'Spending alert sent to Owner' },
                     ].map((row, i) => (
                       <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white uppercase font-black">{row.event}</td>
                          <td className="py-4 text-green">{row.agents}</td>
                          <td className="py-4 italic">{row.action}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        );
      case 'Sync Mechanisms':
        return (
          <div className="docs-content-anim space-y-8">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter leading-tight text-blue-500">Realtime <br/><span className="text-white">Sync</span></h1>
            <p className="text-lg text-white/60 leading-relaxed font-dm-mono uppercase tracking-tighter font-black">
               ORCA uses Supabase Realtime (WebSockets) to keep your dashboard live.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-dm-mono uppercase tracking-tighter font-black">
               <div className="p-8 rounded-[2rem] bg-surface/30 border border-white/5 space-y-4">
                  <h4 className="text-white italic">UPDATES IN MILLISECONDS</h4>
                  <ul className="text-[10px] text-white/20 list-none space-y-2 italic">
                    <li>- NEW AGENT MESSAGES</li>
                    <li>- COORDINATION FEED EVENTS</li>
                    <li>- APPROVAL BADGES & COUNTS</li>
                    <li>- TEAM CHAT (HEAD â†” MEMBER)</li>
                  </ul>
               </div>
               <div className="p-8 rounded-[2rem] bg-surface/30 border border-white/5 space-y-4">
                  <h4 className="text-white italic">CONNECTION MGMT</h4>
                  <p className="text-[10px] text-white/20 italic leading-relaxed">ORCA automatically cleans up WebSocket subscriptions when you navigate. If your connection drops, it reconnects automatically.</p>
               </div>
            </div>
          </div>
        );
      case 'GitHub Setup':
        return (
          <div className="docs-content-anim space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">GitHub Setup</h1>
            <div className="space-y-8">
               <div className="p-8 rounded-3xl bg-surface/50 border border-white/5 space-y-6">
                  <p>1. GO TO INTEGRATIONS â†’ TECH & SECURITY</p>
                  <p>2. AUTHORIZE ORCA VIA OAUTH</p>
                  <p>3. SELECT REPOSITORIES & PERMISSIONS (READ/WRITE)</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                  <div className="p-8 rounded-3xl bg-green/5 border border-dashed border-green/20">
                    <h4 className="text-green uppercase mb-4 italic text-lg font-syne font-black">Capabilities</h4>
                    <p className="text-xs italic leading-relaxed">Ghost scans vulnerabilities, reviews PRs, triggers deployments, and monitors alerts.</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-surface/50 border border-white/5">
                    <h4 className="text-white uppercase mb-4 italic text-lg font-syne font-black">Permissions</h4>
                    <p className="text-xs italic leading-relaxed">Minimum permissions requested. Read-only for scanners; write for PR creation and deployment triggers.</p>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'Stripe Bridge':
        return (
          <div className="docs-content-anim space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Stripe Bridge</h1>
            
            <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 italic">
               <p className="text-yellow-500/60 text-[11px]">Note for Kenyan users: ORCA uses Paystack for its own billing. The Stripe bridge is to pull data from YOUR Stripe account.</p>
            </div>

            <div className="space-y-8">
               <h4 className="text-green uppercase italic text-lg font-syne font-black">Restricted Key Setup</h4>
               <ol className="list-decimal list-inside space-y-4 bg-surface/50 p-10 rounded-[3rem] border border-white/5 italic">
                  <li>Go to Stripe Dashboard â†’ Developers â†’ API Keys</li>
                  <li>Click "Create restricted key"</li>
                  <li>Enable: Customers (read), Invoices (read+write), Payments (read), Subscriptions (read)</li>
                  <li>Copy the key and paste into ORCA Integrations</li>
               </ol>
               <p className="text-[10px] italic leading-relaxed pt-4 border-t border-white/5">Security: ORCA encrypts your Stripe key using AES-256-GCM. Raw keys are never stored in plaintext.</p>
            </div>
          </div>
        );
      case 'Slack Notifications':
        return (
          <div className="docs-content-anim space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter">Slack Setup</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 rounded-[3rem] border border-white/5 bg-surface/30 space-y-6">
                  <h4 className="text-white italic uppercase font-syne font-black">Recommended Channels</h4>
                  <ul className="space-y-3 text-xs italic list-none">
                    <li>- #orca-activity (Agent completed tasks)</li>
                    <li>- #orca-approvals (Pending human actions)</li>
                    <li>- #orca-alerts (CyberGuard escalations)</li>
                    <li>- #orca-coordination (Agent handoffs)</li>
                  </ul>
               </div>
               <div className="p-8 rounded-[3rem] border border-white/5 bg-surface/30 space-y-6">
                  <h4 className="text-white italic uppercase font-syne font-black">Notification Types</h4>
                  <ul className="space-y-3 text-xs italic list-none">
                    <li>- Agent Task completions</li>
                    <li>- Weekly Department Reports</li>
                    <li>- Coordination Loop detections</li>
                    <li>- Kill Switch activations</li>
                  </ul>
               </div>
            </div>
          </div>
        );
      case 'Custom API':
        return (
          <div className="docs-content-anim space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter leading-none text-blue-400">Custom <br/><span className="text-white">API</span></h1>
            <div className="space-y-8">
               <div className="p-10 rounded-[4rem] bg-surface/80 border border-white/5 font-mono text-[11px] text-green/60 overflow-x-auto select-all cursor-copy">
{`curl -X POST https://api.nexonic-industries.vercel.app/v1/agents/brief \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "aria",
    "department": "marketing",
    "brief": "Draft 3 LinkedIn posts"
  }'`}
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-8 rounded-3xl bg-surface/50 border border-white/5">
                    <h5 className="text-white mb-2 italic uppercase font-syne">Rate Limits</h5>
                    <p className="text-[10px] italic">1,000 requests per hour per API key. 10 concurrent agent briefs per org.</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-surface/50 border border-white/5">
                    <h5 className="text-white mb-2 italic uppercase font-syne">Webhooks</h5>
                    <p className="text-[10px] italic">agent.task.completed, agent.coordination.requested, approval.request.created.</p>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'Data Isolation':
        return (
          <div className="docs-content-anim space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter leading-tight">Data <br/><span className="text-green">Isolation</span></h1>
            <div className="space-y-12">
               <p className="text-lg text-white font-black leading-tight">ORCA is a multi-tenant platform. Every organisation's data is isolated via Row Level Security (RLS) and hard-scoping.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-white italic uppercase font-syne">Scoping Protocols</h4>
                    <ul className="text-xs list-none space-y-3 italic">
                      <li>- Row Level Security on all tables</li>
                      <li>- Auth-derived Org ID filtering (no user input)</li>
                      <li>- Department-scoped access for team members</li>
                      <li>- 100% Isolated AI context windows</li>
                    </ul>
                  </div>
                  <div className="p-10 rounded-[3rem] bg-surface/30 border border-white/5">
                    <h4 className="text-white italic mb-4 uppercase font-syne">Session Mgmt</h4>
                    <p className="text-xs italic leading-relaxed">Using Supabase Auth + JWT tokens. Sessions expire after 7 days. Member removal invalidates tokens immediately.</p>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'Encryption Standards':
        return (
          <div className="docs-content-anim space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
             <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter leading-none">Security <br/><span className="text-green">Standards</span></h1>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                   { label: 'DATA AT REST', val: 'AES-256 (Supabase Infrastructure)' },
                   { label: 'DATA IN TRANSIT', val: 'TLS 1.3 / WebSocket Secure (WSS)' },
                   { label: 'TOKENS', val: 'AES-256-GCM Authenticated Encryption' },
                   { label: 'PASSWORDS', val: 'Bcrypt Salted Hashing (Supabase Auth)' },
                ].map(s => (
                   <div key={s.label} className="p-8 rounded-[2rem] border border-white/5 bg-surface/30 space-y-2">
                      <span className="text-[10px] text-white/20 font-black">{s.label}</span>
                      <p className="text-sm italic text-white font-black">{s.val}</p>
                   </div>
                ))}
             </div>
             <div className="p-10 rounded-[3rem] bg-surface/50 border border-dashed border-white/10 italic">
                <h4 className="text-white italic mb-4 uppercase font-syne">Key Management</h4>
                <p className="text-[10px] leading-relaxed">Encryption keys are stored as Vercel Env Vars. Never committed to source, never logged, rotated on a system schedule.</p>
             </div>
          </div>
        );
      case 'Audit Logs':
        return (
          <div className="docs-content-anim space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter Leading-none">Audit <br/><span className="text-white">Trail</span></h1>
            <div className="space-y-8">
               <p className="text-lg text-white font-black italic">Immutable, append-only records of all significant actions.</p>
               <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
                  <table className="w-full text-left font-dm-mono text-[10px] uppercase font-black">
                     <thead><tr className="border-b border-white/10 text-white/10"><th className="py-4 font-black">Logged Action</th><th className="py-4 font-black">Source</th></tr></thead>
                     <tbody className="text-white/40 italic">
                        <tr className="border-b border-white/5 transition-colors hover:text-white"><td className="py-3">Agent task approved</td><td className="py-3">User Interaction</td></tr>
                        <tr className="border-b border-white/5 transition-colors hover:text-white"><td className="py-3">Cross-dept hand-off approved</td><td className="py-3">Governance Gate</td></tr>
                        <tr className="border-b border-white/5 transition-colors hover:text-white"><td className="py-3">Integration connected</td><td className="py-3">Auth Event</td></tr>
                        <tr className="border-b border-white/5 transition-colors hover:text-white"><td className="py-3">Master kill switch toggled</td><td className="py-3">System Override</td></tr>
                        <tr className="border-b border-white/5 transition-colors hover:text-white"><td className="py-3">Prompt injection attempt</td><td className="py-3">CyberGuard Sentinel</td></tr>
                     </tbody>
                  </table>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                  <div className="p-8 rounded-3xl bg-surface/50 border border-white/5 italic">
                     <h5 className="text-white mb-2 italic font-syne">Access Protocols</h5>
                     <p className="text-[10px]">Owners/Co-founders only. Access via Account â†’ Security. Retained for 12 months (Pro+).</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-surface/50 border border-white/5 italic">
                     <h5 className="text-white mb-2 italic font-syne">Compliance Export</h5>
                     <p className="text-[10px]">Enterprise customers can export as JSON/CSV for external audit verification.</p>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'SOC 2 Compliance':
        return (
          <div className="docs-content-anim space-y-12 text-white/40 font-dm-mono uppercase tracking-tighter font-black">
            <h1 className="font-syne text-5xl font-black text-white uppercase tracking-tighter leading-none">Security <br/><span className="text-green">Governance</span></h1>
            <div className="p-10 rounded-[3rem] bg-green/5 border border-green/20 italic text-white text-sm">
               ORCA is currently working toward SOC 2 Type II certification. 
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] italic">
               <div className="p-10 rounded-[2rem] bg-surface/30 border border-white/5 space-y-4">
                  <h4 className="text-white uppercase italic text-lg font-syne font-black">Infrastructure</h4>
                  <p>ORCA runs on Vercel and Supabase. Both providers maintain their own SOC 2 certifications (Type II).</p>
               </div>
               <div className="p-10 rounded-[2rem] bg-surface/30 border border-white/5 space-y-4">
                  <h4 className="text-white uppercase italic text-lg font-syne font-black">Data Residency</h4>
                  <p>Enterprise users can request specific Supabase regions (EU/US/AF). Contact support@nexonic.com.</p>
               </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-surface/50 border border-dashed border-white/10 space-y-4 italic">
               <h4 className="text-white italic uppercase font-syne font-black">Vulnerability Disclosure</h4>
               <p className="text-xs">Report security issues to security@nexonic.com. We acknowledge within 24h and resolve within 72h. We do not pursue legal action against good-faith research.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="docs-content-anim flex flex-col items-center justify-center py-40 opacity-20">
             <h3 className="font-syne text-2xl font-black uppercase tracking-widest text-white/20 italic">Content Under Review...</h3>
             <p className="font-dm-mono text-xs uppercase tracking-widest text-white/10 mt-4">NEXONIC NODE: {activeSection}</p>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text-body font-dm-mono overflow-hidden">
      <Navigation />
      
      <div className="max-w-[1440px] mx-auto flex h-screen pt-24 overflow-hidden">
        {/* Fixed Content-Driven Sidebar */}
        <aside className="w-72 border-r border-white/5 bg-bg flex flex-col shrink-0 overflow-hidden">
           <div className="p-6 border-b border-white/5">
              <input 
                type="text" 
                placeholder="Search Protocol..." 
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-dm-mono text-white/40 focus:border-green/50 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
              {sections.map(group => (
                 <div key={group.group}>
                    <h5 className="font-syne text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">{group.group}</h5>
                    <div className="space-y-1">
                       {group.items.map(item => (
                         <button
                           key={item}
                           onClick={() => setActiveSection(item as SectionKey)}
                           className={`w-full text-left px-4 py-2 rounded-lg text-[13px] font-black uppercase tracking-tighter transition-all relative group ${activeSection === item ? 'text-green bg-green/5' : 'text-white/40 hover:text-white/60 hover:translate-x-1'}`}
                         >
                            {item}
                            {activeSection === item && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-green shadow-[0_0_10px_rgba(0,255,135,0.8)]" />
                            )}
                         </button>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
           
           <div className="p-6 border-t border-white/5 bg-surface/20">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                 <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Protocol V4.2 active</span>
              </div>
           </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar" ref={contentRef}>
           <div className="max-w-4xl mx-auto px-12 py-20 pb-40">
              {renderContent()}
              
              {/* Internal Pagination */}
              <div className="mt-24 pt-12 border-t border-white/5 flex justify-between">
                 <button className="text-[10px] text-white/20 uppercase font-black tracking-widest hover:text-white transition-colors">
                    â† Previous Node
                 </button>
                 <button className="text-[10px] text-green uppercase font-black tracking-widest hover:underline transition-all">
                    Next: {sections.flatMap(g => g.items)[sections.flatMap(g => g.items).indexOf(activeSection) + 1] || 'Security Protocols'} â†’
                 </button>
              </div>
           </div>
           <Footer />
        </main>
      </div>
    </main>
  );
}

