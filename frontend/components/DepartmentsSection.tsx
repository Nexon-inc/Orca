'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import DepartmentCard from './DepartmentCard';

const departments = [
  { 
    id: 'marketing', 
    name: 'Marketing', 
    emoji: '📣', 
    count: 5, 
    agents: [
      { id: 'aria', icon: '🎙️', name: 'Aria' },
      { id: 'jackie', icon: '✍️', name: 'Jackie' },
      { id: 'eric', icon: '📢', name: 'Eric' },
      { id: 'lucy', icon: '🔍', name: 'Lucy' },
      { id: 'joe', icon: '🎨', name: 'Joe' }
    ],
    desc: 'Content, social, SEO, ads, and brand voice — all running without a marketing hire.'
  },
  { 
    id: 'sales', 
    name: 'Sales & Revenue', 
    emoji: '💰', 
    count: 5, 
    agents: [
      { id: 'rex', icon: '💰', name: 'Rex' },
      { id: 'clara', icon: '📋', name: 'Clara' },
      { id: 'chase', icon: '🏃', name: 'Chase' },
      { id: 'mark', icon: '📬', name: 'Mark' },
      { id: 'teo', icon: '🔭', name: 'Teo' }
    ],
    desc: 'Lead prospecting, outreach, CRM management, follow-ups, and deal intelligence.'
  },
  { 
    id: 'customer', 
    name: 'Customer Success', 
    emoji: '🤝', 
    count: 5, 
    agents: [
      { id: 'purity', icon: '🛟', name: 'Purity' },
      { id: 'bruce', icon: '🧭', name: 'Bruce' },
      { id: 'nadia', icon: '🔗', name: 'Nadia' },
      { id: 'john', icon: '📊', name: 'John' },
      { id: 'beatrice', icon: '💚', name: 'Beatrice' }
    ],
    desc: 'Support tickets, onboarding, retention, and NPS — handled before customers churn.'
  },
  { 
    id: 'tech', 
    name: 'Tech & Security', 
    emoji: '🛡️', 
    count: 5, 
    agents: [
      { id: 'ghost', icon: '👻', name: 'Ghost' },
      { id: 'cipher', icon: '🔐', name: 'Cipher' },
      { id: 'wren', icon: '⚙️', name: 'Wren' },
      { id: 'hex', icon: '📖', name: 'Hex' },
      { id: 'volt', icon: '⚡', name: 'Volt' }
    ],
    desc: 'Code scanning, PR reviews, deployments, docs — with CyberGuard built in.'
  },
  { 
    id: 'people', 
    name: 'People & Hiring', 
    emoji: '🧠', 
    count: 5, 
    agents: [
      { id: 'marcus', icon: '🔎', name: 'Marcus' },
      { id: 'vera', icon: '🧬', name: 'Vera' },
      { id: 'zara', icon: '✅', name: 'Zara' },
      { id: 'eli', icon: '📝', name: 'Eli' },
      { id: 'nina', icon: '🌱', name: 'Nina' }
    ],
    desc: 'Sourcing, screening, verification, and offer coordination — without a recruiter.'
  },
  { 
    id: 'ops', 
    name: 'Operations', 
    emoji: '📋', 
    count: 5, 
    agents: [
      { id: 'atlas', icon: '🗺️', name: 'Atlas' },
      { id: 'cal', icon: '📅', name: 'Cal' },
      { id: 'dean', icon: '🗒️', name: 'Dean' },
      { id: 'iris', icon: '📥', name: 'Iris' },
      { id: 'owen', icon: '🔄', name: 'Owen' }
    ],
    desc: 'Project management, calendar, meeting notes, and inbox — all handled.'
  },
  { 
    id: 'finance', 
    name: 'Finance & Legal', 
    emoji: '📊', 
    count: 5, 
    agents: [
      { id: 'bill', icon: '🧾', name: 'Bill' },
      { id: 'felix', icon: '💳', name: 'Felix' },
      { id: 'lena', icon: '⚖️', name: 'Lena' },
      { id: 'reid', icon: '📐', name: 'Reid' },
      { id: 'cora', icon: '🔬', name: 'Cora' }
    ],
    desc: 'Expenses, invoicing, contracts, and budget forecasting — no accountant needed.'
  },
  { 
    id: 'intelligence', 
    name: 'Intelligence & Research', 
    emoji: '🔍', 
    count: 5, 
    agents: [
      { id: 'roman', icon: '🏛️', name: 'Roman' },
      { id: 'sage', icon: '📡', name: 'Sage' },
      { id: 'nate', icon: '📰', name: 'Nate' },
      { id: 'ada', icon: '🔮', name: 'Ada' },
      { id: 'dex', icon: '📈', name: 'Dex' }
    ],
    desc: 'Competitor research, market signals, weekly briefs, and forecasting.'
  },
  { 
    id: 'community', 
    name: 'Community & Growth', 
    emoji: '🌐', 
    count: 5, 
    agents: [
      { id: 'spike', icon: '🚀', name: 'Spike' },
      { id: 'milo', icon: '🎵', name: 'Milo' },
      { id: 'rio', icon: '🤝', name: 'Rio' },
      { id: 'zoe', icon: '🌟', name: 'Zoe' },
      { id: 'kai', icon: '🔊', name: 'Kai' }
    ],
    desc: 'Community management, partnerships, influencer outreach, and growth experiments.'
  },
];

export default function DepartmentsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.dept-card-anim', {
            opacity: [0, 1],
            scale: [0.95, 1],
            y: [20, 0],
            delay: stagger(100),
            duration: 800,
            ease: 'outQuad'
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-bg">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 text-reveal">
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-syne font-bold leading-tight mb-4 text-white">
            9 departments. <span className="text-green">Fully staffed.</span>
          </h2>
          <p className="text-text-muted font-dm-mono text-[14px] sm:text-[15px] max-w-2xl mx-auto">
            Your entire company infrastructure, automated and coordinated.
          </p>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="dept-card-anim opacity-0">
              <DepartmentCard department={dept} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

