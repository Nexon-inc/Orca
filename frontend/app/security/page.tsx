'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SecurityPage() {
  useEffect(() => {
    animate('.security-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <main className="min-h-screen bg-bg text-text-body font-dm-mono overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 pt-48 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="security-anim opacity-0 font-syne text-5xl sm:text-7xl lg:text-[100px] font-black text-green leading-tight mb-8 uppercase tracking-tighter">
             Absolute <br/> <span className="text-white">Security</span>
          </h1>
          <p className="security-anim opacity-0 font-dm-mono text-base sm:text-lg text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed uppercase tracking-tighter font-black">
            Security is not a feature — it is the foundation. Founders trust ORCA with their company's most sensitive data. We treat that trust seriously.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="py-24 px-4 bg-bg border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: '01', title: 'Data Ownership', desc: 'Your company data, agent conversations, and outputs belong to you. We never use them to train AI models.' },
              { id: '02', title: 'Default Isolation', desc: 'Every organisation is isolated. DB policies and API checks ensure zero cross-boundary access.' },
              { id: '03', title: 'Human Control', desc: 'Approve First mode ensures no external action is taken without explicit human authorization.' },
              { id: '04', title: 'Immutable Logs', desc: 'Every significant action is recorded in an immutable audit trail that users can always access.' },
            ].map(p => (
              <div key={p.id} className="security-anim opacity-0 p-8 rounded-3xl bg-surface/50 border border-white/5 hover:border-green/20 transition-all">
                <span className="text-xs font-black text-green uppercase tracking-widest mb-4 block">{p.id} — PRINCIPLE</span>
                <h3 className="font-syne text-xl font-black text-white uppercase tracking-tight mb-4">{p.title}</h3>
                <p className="text-sm text-white/40 font-black uppercase tracking-tighter leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure & Data */}
      <section className="py-32 px-4 bg-bg border-b border-white/5">
        <div className="max-w-5xl mx-auto space-y-32">
          {/* Infrastructure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
             <div className="security-anim opacity-0 space-y-6">
                <h2 className="font-syne text-4xl font-black text-white uppercase tracking-tighter">Infrastructure <br/><span className="text-green">Architecture</span></h2>
                <div className="w-12 h-1 bg-green/20" />
                <p className="text-white/40 font-dm-mono text-sm uppercase tracking-tighter font-black leading-relaxed">
                   ORCA is built on SOC 2 Type II certified platforms. We leverage Vercel and Supabase to ensure enterprise-grade reliability and security.
                </p>
             </div>
             <div className="security-anim opacity-0 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4 font-dm-mono text-xs uppercase font-black tracking-tighter">
                {[
                  { l: 'Hosting', v: 'Vercel (SOC 2)' },
                  { l: 'Database', v: 'Supabase (SOC 2)' },
                  { l: 'DDoS Protection', v: 'Cloudflare / Edge' },
                  { l: 'Minimum TLS', v: '1.3 for all nodes' },
                  { l: 'Uptime Target', v: '99.9% Autonomous Runtime' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-white/5 last:border-0 italic">
                     <span className="text-white/20">{row.l}</span>
                     <span className="text-green">{row.v}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Data Security */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start pt-16 border-t border-white/5">
             <div className="security-anim opacity-0 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4 font-dm-mono text-xs uppercase font-black tracking-tighter md:order-2">
                {[
                  { l: 'Encryption at Rest', v: 'AES-256' },
                  { l: 'Integration Tokens', v: 'AES-256-GCM' },
                  { l: 'Data in Transit', v: 'TLS 1.3 Minimum' },
                  { l: 'Password Hashing', v: 'BCRYPT (Supabase Auth)' },
                  { l: 'API Security', v: 'HMAC Signature Verification' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-white/5 last:border-0 italic">
                     <span className="text-white/20">{row.l}</span>
                     <span className="text-green">{row.v}</span>
                  </div>
                ))}
             </div>
             <div className="security-anim opacity-0 space-y-6 md:order-1">
                <h2 className="font-syne text-4xl font-black text-white uppercase tracking-tighter">Data Security <br/><span className="text-green">Standards</span></h2>
                <div className="w-12 h-1 bg-green/20" />
                <p className="text-white/40 font-dm-mono text-sm uppercase tracking-tighter font-black leading-relaxed">
                   Your data is encrypted at every layer. Integration tokens are stored with authenticated encryption, and the database itself rejects queries that cross organisation boundaries.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* AI & Access */}
      <section className="py-32 px-4 bg-bg border-b border-white/5">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="security-anim opacity-0 p-12 rounded-[3.5rem] bg-surface/50 border border-white/5 space-y-8">
               <h3 className="font-syne text-2xl font-black text-white uppercase tracking-tight">AI Governance</h3>
               <div className="space-y-6 font-dm-mono text-xs text-white/40 uppercase font-black tracking-tighter">
                  <div className="space-y-2">
                     <span className="text-green text-[10px] italic">01 // INJECTION DETECTION</span>
                     <p>ORCA scans every agent brief for known prompt injection patterns and blocks anomalous payloads.</p>
                  </div>
                  <div className="space-y-2">
                     <span className="text-green text-[10px] italic">02 // CONTEXT ISOLATION</span>
                     <p>Agents are strictly scoped to a single organisation\'s data. No agent can access cross-tenant history.</p>
                  </div>
                  <div className="space-y-2">
                     <span className="text-green text-[10px] italic">03 // PERMISSION PROXY</span>
                     <p>Agents cannot perform actions that the briefing user is not authorised to perform directly.</p>
                  </div>
               </div>
            </div>

            <div className="security-anim opacity-0 p-12 rounded-[3.5rem] bg-surface/50 border border-white/5 space-y-8">
               <h3 className="font-syne text-2xl font-black text-white uppercase tracking-tight">Access Control</h3>
               <div className="space-y-6 font-dm-mono text-xs text-white/40 uppercase font-black tracking-tighter">
                  <div className="space-y-2">
                     <span className="text-green text-[10px] italic">01 // ROW LEVEL SECURITY</span>
                     <p>PostgreSQL RLS ensures that the database itself rejects unauthorized cross-tenant queries.</p>
                  </div>
                  <div className="space-y-2">
                     <span className="text-green text-[10px] italic">02 // SESSION HYGIENE</span>
                     <p>Sessions expire after 7 days. Removed team members have access revoked globally within seconds.</p>
                  </div>
                  <div className="space-y-2">
                     <span className="text-green text-[10px] italic">03 // RATE LIMITING</span>
                     <p>All API nodes are rate-limited to prevent brute-force and resource exhaustion attacks.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Compliance & Incident */}
      <section className="py-32 px-4 bg-bg">
         <div className="max-w-5xl mx-auto space-y-24">
            <div className="security-anim opacity-0 space-y-8">
               <h3 className="font-syne text-center text-xs font-black text-white/20 uppercase tracking-[0.5em]">Global Compliance Matrix</h3>
               <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-8 pb-8">
                  <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
                     <thead>
                        <tr className="border-b border-white/10 text-white/20">
                           <th className="py-8">Standard / Regulation</th>
                           <th className="py-8 text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="text-white/40 italic">
                        {[
                          { s: 'Kenya Data Protection Act 2019', st: '✓ COMPLIANT' },
                          { s: 'GDPR (EU Data Privacy)', st: '✓ COMPLIANT' },
                          { s: 'PCI-DSS (Via Paystack Integration)', st: '✓ COMPLIANT' },
                          { s: 'SOC 2 Type II', st: 'REF: IN PROGRESS' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01]">
                             <td className="py-5 text-white">{row.s}</td>
                             <td className="py-5 text-right font-black text-green">{row.st}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/5 pt-16">
               <div className="security-anim opacity-0 space-y-4">
                  <h4 className="font-syne text-white uppercase italic text-lg font-black tracking-tight">Incident Response</h4>
                  <p className="text-white/40 font-dm-mono text-[10px] uppercase tracking-tighter font-black leading-relaxed">
                     We monitor for anomalous activity 24/7. In the event of an incident affecting your data, we notify all affected Owners via email within 72 hours of verification.
                  </p>
               </div>
               <div className="security-anim opacity-0 space-y-4">
                  <h4 className="font-syne text-white uppercase italic text-lg font-black tracking-tight">Responsible Disclosure</h4>
                  <p className="text-white/40 font-dm-mono text-[10px] uppercase tracking-tighter font-black leading-relaxed">
                     If you discover a vulnerability, please report it to security@nexonic.com. We acknowledge all reports within 24 hours and do not pursue legal action against good-faith research.
                  </p>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
