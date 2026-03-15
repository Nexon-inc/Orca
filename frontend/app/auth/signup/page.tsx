'use client';

import { useEffect } from 'react';
import { animate } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SignupPage() {
  useEffect(() => {
    animate('.auth-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: (el, i) => i * 100,
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  return (
    <main className="min-h-screen bg-bg text-text-body font-dm-mono flex flex-col">
      <Navigation />
      
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-40 pb-24">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="auth-anim font-syne text-4xl font-extrabold text-white mb-4">Initialize <span className="text-green">ORCA</span></h1>
            <p className="auth-anim text-text-muted text-sm uppercase tracking-widest">Protocol: New Founder Onboarding</p>
          </div>

          <div className="auth-anim bg-surface/50 border border-white/5 rounded-[2.5rem] p-8 sm:p-12 backdrop-blur-md">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = '/onboarding'; }}>
              <div className="space-y-2">
                <label className="text-[10px] text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-bg border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-green/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-text-muted uppercase tracking-widest ml-1">Work Email</label>
                <input 
                  type="email" 
                  placeholder="ceo@company.com"
                  className="w-full bg-bg border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-green/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-text-muted uppercase tracking-widest ml-1">Access Protocol (Password)</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-bg border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-green/50 transition-all"
                  required
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" className="mt-1 accent-green" required />
                <p className="text-[11px] text-text-muted leading-tight">
                  I agree to the <a href="/terms" className="text-white hover:text-green">Terms of Service</a> and <a href="/privacy" className="text-white hover:text-green">Privacy Policy</a> of Nexonic Industries.
                </p>
              </div>

              <button type="submit" className="btn-primary w-full py-4 rounded-xl mt-4">
                Initialize System →
              </button>

              <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-[12px] text-text-muted">
                  Already initialized? <a href="/auth/login" className="text-green hover:underline">Enter Dashboard</a>
                </p>
              </div>
            </form>
          </div>
          
          <p className="auth-anim mt-8 text-center text-[10px] text-text-muted/40 uppercase tracking-[0.2em]">
            Nexonic Industries Deployment Portal v4.2
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
