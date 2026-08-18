'use client';

import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function FeaturesPage() {
  useEffect(() => {
    // Defer until paint so targets exist in the DOM (avoids animejs "No target found")
    const frame = requestAnimationFrame(() => {
      const heroEls = document.querySelectorAll('.feature-hero-text');
      const cardEls = document.querySelectorAll('.feature-card-anim');

      if (heroEls.length > 0) {
        animate('.feature-hero-text', {
          opacity: [0, 1],
          y: [30, 0],
          delay: stagger(100),
          duration: 1000,
          ease: 'outExpo',
        });
      }

      if (cardEls.length > 0) {
        animate('.feature-card-anim', {
          opacity: [0, 1],
          y: [20, 0],
          delay: stagger(100, { start: 500 }),
          duration: 800,
          ease: 'outQuad',
        });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const features = [
    {
      icon: '⬡',
      title: '6 AI Executives',
      description:
        'Atlas, Aria, Rex, Purity, Roman, and Ghost. Your complete C-Suite activated across 5 specialized departments in seconds.',
    },
    {
      icon: '⚡',
      title: 'Autonomous Mode',
      description:
        'Atlas (AI CEO) coordinates the entire executive team autonomously. Receive weekly briefings and daily performance digests.',
    },
    {
      icon: '🤵',
      title: 'Agent47 Workforce',
      description:
        'Optional specialized workforce layer — 47 role-specific agents for full-scale business process automations across your company.',
    },
    {
      icon: '🛡️',
      title: 'CyberGuard Security',
      description:
        'Enterprise-grade code scanning and automated PR fixes built into your technical department pipeline.',
    },
    {
      icon: '🎥',
      title: 'Render.AI Creative',
      description:
        'Neural Creative Production for generating video and marketing assets autonomously for your brand voice.',
    },
    {
      icon: '🔌',
      title: 'Deep Integrations',
      description:
        'Connect your existing stack — HubSpot, Slack, GitHub, LinkedIn and more — directly to your executive workforce.',
    },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-bg text-text-body">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-bg pt-40">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="feature-hero-text opacity-0 font-syne text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8">
            Coordinated <span className="text-green">Capabilities</span>
          </h1>
          <p className="feature-hero-text opacity-0 font-dm-mono text-[16px] sm:text-[18px] text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            6 AI executives across 5 departments, working 24/7 to automate your entire business — fully coordinated.
          </p>
          <div className="feature-hero-text opacity-0">
            <button className="btn-primary px-10 py-4">
              Start Your Onboarding →
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-bg border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="feature-card-anim opacity-0 p-10 rounded-3xl border border-white/5 bg-surface/50 hover:bg-green-dim hover:border-green/20 transition-all duration-500 group card-clickable"
              >
                <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 origin-left inline-block">
                  {feature.icon}
                </div>
                <h3 className="font-syne text-2xl font-bold text-white mb-4 group-hover:text-green transition-colors">
                  {feature.title}
                </h3>
                <p className="font-dm-mono text-[14px] text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-surface/30">
        <div className="max-w-4xl mx-auto text-center p-12 sm:p-20 rounded-[3rem] border border-white/5 bg-surface/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 rotate-12 group-hover:opacity-10 transition-opacity">
            ▣
          </div>
          <h2 className="font-syne text-3xl sm:text-5xl font-extrabold text-white mb-6 relative z-10">
            Ready to automate your company?
          </h2>
          <p className="font-dm-mono text-[15px] sm:text-[17px] text-text-muted mb-12 max-w-xl mx-auto relative z-10">
            Join founders deploying 6 AI executives across 5 departments today.
          </p>
          <button className="btn-primary px-12 py-5 relative z-10">
            Deploy Your Org Chart →
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
          }
