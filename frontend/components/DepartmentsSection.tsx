'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import DepartmentCard from './DepartmentCard';

const departments = [
  { 
    id: 'marketing', 
    name: 'Marketing', 
    emoji: 'ðŸ“£', 
    count: 1, 
    agents: [
      { id: 'aria', icon: 'ðŸŽ™ï¸', name: 'Aria (CMO)' }
    ],
    desc: 'Content, social, SEO, ads, and brand voice â€” managed end-to-end by your AI CMO.'
  },
  { 
    id: 'sales', 
    name: 'Sales & Revenue', 
    emoji: 'ðŸ’°', 
    count: 1, 
    agents: [
      { id: 'rex', icon: 'ðŸ’°', name: 'Rex (CSO)' }
    ],
    desc: 'Lead prospecting, outreach, CRM management, and deal intelligence by your AI Sales Chief.'
  },
  { 
    id: 'customer', 
    name: 'Customer Success', 
    emoji: 'ðŸ¤', 
    count: 1, 
    agents: [
      { id: 'purity', icon: 'ðŸ›Ÿ', name: 'Purity (CCO)' }
    ],
    desc: 'Support tickets, onboarding, retention, and NPS handled autonomously.'
  },
  { 
    id: 'tech', 
    name: 'Tech & Security', 
    emoji: 'ðŸ›¡ï¸', 
    count: 1, 
    agents: [
      { id: 'ghost', icon: 'ðŸ‘»', name: 'Ghost (CTO)' }
    ],
    desc: 'Code scanning, PR reviews, deployments, and infrastructure monitoring.'
  },
  { 
    id: 'intelligence', 
    name: 'Intelligence & Research', 
    emoji: 'ðŸ”', 
    count: 1, 
    agents: [
      { id: 'roman', icon: 'ðŸ›ï¸', name: 'Roman (CIO)' }
    ],
    desc: 'Competitor research, deep web scraping, market signals, and forecasting.'
  }
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
            6 executives. 5 departments. <span className="text-green">Fully activated.</span>
          </h2>
          <p className="text-text-muted font-dm-mono text-[14px] sm:text-[15px] max-w-2xl mx-auto">
            Your entire company infrastructure, led by dedicated AI executives and fully automated.
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


