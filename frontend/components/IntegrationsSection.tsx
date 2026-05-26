'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const integrations = [
  { name: 'HubSpot', category: 'Sales', status: 'Core' },
  { name: 'Salesforce', category: 'Sales', status: 'Core' },
  { name: 'LinkedIn', category: 'Marketing', status: 'Social' },
  { name: 'X / Twitter', category: 'Marketing', status: 'Social' },
  { name: 'TikTok', category: 'Marketing', status: 'Social' },
  { name: 'Meta (IG/FB)', category: 'Marketing', status: 'Social' },
  { name: 'Google Workspace', category: 'Admin', status: 'Core' },
  { name: 'Slack', category: 'CS', status: 'Core' },
  { name: 'Notion', category: 'CS / Intel', status: 'Core' },
  { name: 'GitHub', category: 'Tech', status: 'Core' },
  { name: 'Zoom', category: 'Ops', status: 'API' },
  { name: 'Shopify', category: 'Finance', status: 'Core' },
  { name: 'Stripe', category: 'Finance', status: 'Core' },
  { name: 'Crunchbase', category: 'Research', status: 'API' },
  { name: 'Apollo.io', category: 'Sales', status: 'API' },
  { name: 'Google Trends', category: 'Marketing', status: 'API' },
  { name: 'Zendesk', category: 'CS', status: 'Core' },
  { name: 'Mailchimp', category: 'Marketing', status: 'Core' },
  { name: 'Typeform', category: 'CS', status: 'API' },
  { name: 'QuickBooks', category: 'Finance', status: 'Core' },
  { name: 'Ahrefs', category: 'Marketing', status: 'API' },
  { name: 'Semrush', category: 'Marketing', status: 'API' },
  { name: 'Perplexity AI', category: 'Intel', status: 'API' },
];

export default function IntegrationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateGrid();
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

  const animateGrid = () => {
    animate('.integration-tile', {
      opacity: [0, 1],
      scale: [0.8, 1],
      y: [20, 0],
      delay: stagger(50),
      duration: 800,
      ease: 'outElastic(1, .8)'
    });
  };

  return (
    <section id="integrations" ref={sectionRef} className="py-24 px-4 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-6">
              Connect Your <span className="text-green">Existing Stack</span>
            </h2>
            <p className="font-dm-mono text-text-muted text-[15px] leading-relaxed mb-8">
              ORCA doesn't just work in isolation. Our agents connect to the tools you already use, creating a unified operating layer across your entire company.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green" />
                <span className="font-dm-mono text-[11px] text-white">OAuth Secure</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green" />
                <span className="font-dm-mono text-[11px] text-white">Real-time Sync</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green" />
                <span className="font-dm-mono text-[11px] text-white">Composio Powered</span>
              </div>
            </div>
          </div>

          <div ref={containerRef} className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {integrations.map((item, idx) => (
              <div 
                key={idx} 
                className="integration-tile opacity-0 aspect-square group flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 bg-surface/50 hover:bg-green-dim hover:border-green/20 transition-all cursor-default"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-white/40 group-hover:text-green transition-colors mb-2">
                  {item.name.charAt(0)}
                </div>
                <span className="font-dm-mono text-[10px] text-white/60 group-hover:text-white transition-colors text-center truncate w-full">
                  {item.name}
                </span>
                <span className="font-dm-mono text-[7px] uppercase tracking-tighter text-text-muted group-hover:text-green/60 transition-colors mt-1">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

