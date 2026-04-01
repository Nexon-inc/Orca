'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const departments = [
  { icon: "??", name: "Marketing", agents: "Aria (CMO)", pills: "CONTENT · SOCIAL · SEO · ADS", desc: "Content, social, SEO, ads, and brand voice — all running without a marketing hire." },
  { icon: "??", name: "Sales & Revenue", agents: "Rex (CSO)", pills: "OUTREACH · CRM · LEADS · DEALS", desc: "Lead prospecting, outreach, CRM management, follow-ups, and deal intelligence." },
  { icon: "??", name: "Customer Success", agents: "Purity (CCO)", pills: "SUPPORT · ONBOARDING · RETENTION", desc: "Support tickets, onboarding, retention, and NPS — handled before customers churn." },
  { icon: "???", name: "Tech & Security", agents: "Ghost (CTO)", pills: "CODE · PRs · DEPLOYS · DOCS", desc: "Code generation, PR reviews, deployments, docs — with CyberGuard built in." },
  { icon: "??", name: "Intelligence", agents: "Roman (CIO)", pills: "RESEARCH · SIGNALS · BRIEFS", desc: "Competitor research, market signals, weekly briefs, and forecasting." }
];

export default function DepartmentsPage() {
  useEffect(() => {
    animate('.dept-card', {
      opacity: [0, 1],
      y: [30, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-bg text-text-body">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-bg pt-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-syne text-5xl sm:text-7xl lg:text-[80px] font-black text-white leading-tight mb-8 uppercase tracking-tighter">
             5 Departments. <span className="text-green">Fully Staffed.</span>
          </h1>
          <p className="font-dm-mono text-base sm:text-lg text-white/40 max-w-3xl mx-auto mb-12 leading-relaxed uppercase tracking-tighter font-black">
            The ORCA workforce covers every essential business function with coordinated AI intelligence.
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-24 px-4 bg-bg">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => (
              <div key={idx} className="dept-card opacity-0 p-10 rounded-[3rem] border border-white/5 bg-surface/50 hover:border-green/20 transition-all duration-500 group flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{dept.icon}</span>
                  <span className="text-[10px] font-black text-green uppercase tracking-widest px-3 py-1 bg-green/5 border border-green/10 rounded-full">{dept.agents}</span>
                </div>
                
                <h3 className="font-syne text-2xl font-[800] text-white uppercase tracking-tight mb-3 group-hover:text-green transition-colors">{dept.name}</h3>
                
                <div className="flex gap-2 mb-6">
                  {dept.pills.split(' Â· ').map(pill => (
                    <span key={pill} className="text-[9px] font-black text-white/20 uppercase tracking-tighter px-2 py-0.5 border border-white/10 rounded-md group-hover:text-white/40 transition-colors">{pill}</span>
                  ))}
                </div>

                <p className="font-dm-mono text-[13px] text-white/40 leading-relaxed uppercase tracking-tighter font-black mt-auto">
                  {dept.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 bg-surface/30">
        <div className="max-w-4xl mx-auto text-center p-12 sm:p-20 rounded-[3rem] border border-white/5 bg-surface/50 relative overflow-hidden group shadow-2xl">
          <h2 className="font-syne text-3xl sm:text-5xl font-[800] text-white mb-6 uppercase tracking-tighter leading-none">
            Ready to deploy your workforce?
          </h2>
          <button className="btn-primary px-12 py-5 uppercase tracking-widest font-black text-[14px]">
            Join the Waitlist Today â†’
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

