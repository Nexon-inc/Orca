'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  useEffect(() => {
    animate('.privacy-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: stagger(50),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <main className="min-h-screen bg-bg text-text-body font-dm-mono overflow-x-hidden">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-40">
        <h1 className="privacy-anim opacity-0 font-syne text-5xl sm:text-7xl lg:text-[100px] font-black text-white uppercase tracking-tighter mb-12 leading-none">
          Privacy <span className="text-green">Policy</span>
        </h1>
        
        <div className="space-y-20">
          {/* Section 1 */}
          <section className="privacy-anim opacity-0 space-y-4">
             <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">01. Introduction</h2>
             <p className="text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed text-sm">
                Nexonic Industries operates the ORCA platform. We are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your data. We do not sell your personal data. We do not use your company data to train AI models.
             </p>
          </section>

          {/* Section 2 */}
          <section className="privacy-anim opacity-0 space-y-6">
             <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">02. Data We Collect</h2>
             <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
                <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
                   <thead>
                      <tr className="border-b border-white/10 text-white/20">
                         <th className="py-6">Category</th>
                         <th className="py-6">Examples</th>
                         <th className="py-6">Purpose</th>
                      </tr>
                   </thead>
                   <tbody className="text-white/40">
                      {[
                        { cat: 'Account Data', ex: 'Name, email, job title, password', purp: 'Authentication, account management' },
                        { cat: 'Company Identity', ex: 'Brand voice, ICP data, competitor list', purp: 'Agent personalization, strategy alignment' },
                        { cat: 'Agent Conversations', ex: 'Briefs, outputs, feedback logs', purp: 'Platform functionality, historical record' },
                        { cat: 'Technical Data', ex: 'IP address, browser type, session logs', purp: 'Security, bug detection, performance' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                           <td className="py-4 text-white">{row.cat}</td>
                           <td className="py-4">{row.ex}</td>
                           <td className="py-4">{row.purp}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          {/* Section 3 & 4 */}
          <section className="privacy-anim opacity-0 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">03. How We Use Data</h2>
                   <p className="text-white/40 font-dm-mono text-xs uppercase tracking-tighter font-black leading-relaxed">
                      We use your data to provide ORCA, personalize your agent experience, process payments, and ensure platform security. We never use company-specific data for advertising or cross-customer model training.
                   </p>
                </div>
                <div className="space-y-4">
                   <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">04. Sharing Your Data</h2>
                   <p className="text-white/40 font-dm-mono text-xs uppercase tracking-tighter font-black leading-relaxed">
                      We only share data with service providers necessary to run ORCA (e.g., Supabase, Vercel, Paystack). We share data when required by law or to protect against fraud/security threats.
                   </p>
                </div>
             </div>
          </section>

          {/* Section 5 */}
          <section className="privacy-anim opacity-0 space-y-6">
             <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">05. Service Providers</h2>
             <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
                <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
                   <thead>
                      <tr className="border-b border-white/10 text-white/20">
                         <th className="py-6">Service</th>
                         <th className="py-6">Purpose</th>
                      </tr>
                   </thead>
                   <tbody className="text-white/40">
                      {[
                        { s: 'Supabase', p: 'Database, authentication, storage' },
                        { s: 'Vercel', p: 'Hosting, anonymous analytics' },
                        { s: 'Paystack', p: 'Payment processing' },
                        { s: 'OpenAI / Anthropic', p: 'AI agent inference' },
                        { s: 'Composio', p: 'Agent action execution' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                           <td className="py-4 text-white">{row.s}</td>
                           <td className="py-4">{row.p}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          {/* Section 6 */}
          <section className="privacy-anim opacity-0 space-y-6">
             <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">06. Data Retention</h2>
             <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
                <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
                   <thead>
                      <tr className="border-b border-white/10 text-white/20">
                         <th className="py-6">Data Type</th>
                         <th className="py-6">Retention Period</th>
                      </tr>
                   </thead>
                   <tbody className="text-white/40">
                      {[
                        { type: 'Account data', ret: 'Until account deletion' },
                        { type: 'Agent conversations', ret: '12 months (Pro) · 30 days (Starter)' },
                        { type: 'Audit logs', ret: '12 months (Pro) · 30 days (Starter)' },
                        { type: 'Payment records', ret: '7 years (Legal requirement)' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                           <td className="py-4 text-white">{row.type}</td>
                           <td className="py-4">{row.ret}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          {/* Section 7 */}
          <section className="privacy-anim opacity-0 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-8">
             <h2 className="font-syne text-xs font-black text-white uppercase tracking-[0.4em] italic">07. Your Rights</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] text-white/40 font-dm-mono uppercase tracking-tighter font-black">
                <div className="space-y-4">
                   <h4 className="text-white">Right to Access</h4>
                   <p>Export all personal data from Account &rarr; Security &rarr; Export My Data.</p>
                </div>
                <div className="space-y-4">
                   <h4 className="text-white">Right to Deletion</h4>
                   <p>Delete your account from Account &rarr; Security &rarr; Delete Account.</p>
                </div>
                <div className="space-y-4">
                   <h4 className="text-white">Right to Correction</h4>
                   <p>Update personal information at any time from Account &rarr; Profile.</p>
                </div>
                <div className="space-y-4">
                   <h4 className="text-white">Right to Object</h4>
                   <p>Opt out of non-essential communications from Account &rarr; Notifications.</p>
                </div>
             </div>
          </section>

          {/* Sections 8-12 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             {[
               { id: '08', t: 'Cookies', c: 'ORCA uses strictly necessary cookies and anonymous analytics. We do not use advertising or cross-site tracking cookies.' },
               { id: '09', t: 'Children', c: 'ORCA is not intended for users under 18. We do not knowingly collect personal data from children.' },
               { id: '10', t: 'International', c: 'Nexonic is based in Kenya. Data may be processed by providers in regions as specified by their privacy policies.' },
               { id: '11', t: 'Changes', c: 'We will notify you of material changes to this policy via email at least 14 days before they take effect.' },
             ].map(s => (
                <div key={s.id} className="privacy-anim opacity-0 space-y-4 border-l border-white/5 pl-8">
                   <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">{s.id}. {s.t}</h2>
                   <p className="text-white/40 font-dm-mono text-[10px] uppercase tracking-tighter font-black leading-relaxed">
                      {s.c}
                   </p>
                </div>
             ))}
          </div>

          <section className="privacy-anim opacity-0 pt-12 border-t border-white/5 text-[10px] text-white/20 font-black uppercase tracking-widest flex justify-between">
             <span>LAST UPDATED: MARCH 2026 // NEXONIC PRIVACY COMPLIANCE</span>
             <span className="text-green">contact: privacy@nexonic.com</span>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
