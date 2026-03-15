'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function CookiesPage() {
  useEffect(() => {
    animate('.cookies-anim', {
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
        <h1 className="cookies-anim opacity-0 font-syne text-5xl sm:text-7xl lg:text-[100px] font-black text-white uppercase tracking-tighter mb-12 leading-none">
          Cookie <span className="text-green">Policy</span>
        </h1>
        
        <div className="space-y-20">
          {/* Section 1 */}
          <section className="cookies-anim opacity-0 space-y-4">
             <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">01. What Are Cookies</h2>
             <p className="text-white/40 font-dm-mono uppercase tracking-tighter font-black leading-relaxed text-sm">
                Cookies are small text files placed on your device. They help the site remember preferences, keep you logged in, and understand platform usage. ORCA uses a minimal set of cookies — only what is necessary to operate the platform. We do not use advertising or cross-site tracking cookies.
             </p>
          </section>

          {/* Section 2.1 */}
          <section className="cookies-anim opacity-0 space-y-6">
             <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">02.1 — Strictly Necessary</h2>
             <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
                <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
                   <thead>
                      <tr className="border-b border-white/10 text-white/20">
                         <th className="py-6">Cookie</th>
                         <th className="py-6">Purpose</th>
                         <th className="py-6">Duration</th>
                      </tr>
                   </thead>
                   <tbody className="text-white/40">
                      {[
                        { n: 'sb-access-token', p: 'Authenticates your session', d: '7 days' },
                        { n: 'sb-refresh-token', p: 'Refreshes session automatically', d: '7 days' },
                        { n: 'orca-onboarding-step', p: 'Remembers onboarding progress', d: '30 days' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                           <td className="py-4 text-white">{row.n}</td>
                           <td className="py-4">{row.p}</td>
                           <td className="py-4">{row.d}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          {/* Section 2.2 */}
          <section className="cookies-anim opacity-0 space-y-6">
             <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">02.2 — Analytics</h2>
             <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
                <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
                   <thead>
                      <tr className="border-b border-white/10 text-white/20">
                         <th className="py-6">Cookie</th>
                         <th className="py-6">Purpose</th>
                         <th className="py-6">Duration</th>
                      </tr>
                   </thead>
                   <tbody className="text-white/40">
                      {[
                        { n: 'va-*', p: 'Vercel Analytics — anonymous views', d: '30 days' },
                        { n: '_vercel_analytics_id', p: 'Anonymous visitor identifier', d: '90 days' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                           <td className="py-4 text-white">{row.n}</td>
                           <td className="py-4">{row.p}</td>
                           <td className="py-4">{row.d}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          {/* Section 2.3 */}
          <section className="cookies-anim opacity-0 space-y-6">
             <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">02.3 — Functional</h2>
             <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/30 px-6 pb-6">
                <table className="w-full text-left font-dm-mono text-[10px] uppercase tracking-tighter font-black">
                   <thead>
                      <tr className="border-b border-white/10 text-white/20">
                         <th className="py-6">Cookie</th>
                         <th className="py-6">Purpose</th>
                         <th className="py-6">Duration</th>
                      </tr>
                   </thead>
                   <tbody className="text-white/40">
                      {[
                        { n: 'orca-sidebar-state', p: 'Sidebar expanded/collapsed preference', d: '1 year' },
                        { n: 'orca-dept-last', p: 'Last active department memory', d: '30 days' },
                        { n: 'orca-theme', p: 'Display theme settings', d: '1 year' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                           <td className="py-4 text-white">{row.n}</td>
                           <td className="py-4">{row.p}</td>
                           <td className="py-4">{row.d}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          {/* Section 3 & 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <section className="cookies-anim opacity-0 space-y-4">
                <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">03. Third-Parties</h2>
                <p className="text-white/40 font-dm-mono text-[10px] uppercase tracking-tighter font-black leading-relaxed">
                   ORCA embeds no third-party tracking scripts. The only third-party cookies are from Vercel Analytics (anonymous) and Supabase Auth (strictly necessary).
                </p>
             </section>
             <section className="cookies-anim opacity-0 space-y-4">
                <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">04. Managing Cookies</h2>
                <p className="text-white/40 font-dm-mono text-[10px] uppercase tracking-tighter font-black leading-relaxed">
                   You can manage cookies through browser settings. Note that disabling strictly necessary cookies will prevent you from logging in.
                </p>
             </section>
          </div>

          {/* Section 5 & 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <section className="cookies-anim opacity-0 space-y-4">
                <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">05. Cookie Consent</h2>
                <p className="text-white/40 font-dm-mono text-[10px] uppercase tracking-tighter font-black leading-relaxed">
                   Strictly necessary cookies do not require consent. Using ORCA implies consent for analytics and functional cookies as described here.
                </p>
             </section>
             <section className="cookies-anim opacity-0 space-y-4 border-l border-white/5 pl-8">
                <h2 className="font-syne text-xs font-black text-green uppercase tracking-[0.4em] italic">06. Changes</h2>
                <p className="text-white/40 font-dm-mono text-[10px] uppercase tracking-tighter font-black leading-relaxed">
                   We may update this policy when new features are added. Material changes will be notified via email or in-app notification.
                </p>
             </section>
          </div>

          <section className="cookies-anim opacity-0 pt-12 border-t border-white/5 text-[10px] text-white/20 font-black uppercase tracking-widest flex justify-between gap-4">
             <span>LAST UPDATED: MARCH 2026 // NEXONIC INDUSTRIES PRIVACY NODES</span>
             <span className="text-green uppercase">privacy@nexonic.com</span>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
