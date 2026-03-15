'use client';

import { useEffect } from 'react';
import { animate } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function LoginPage() {
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
      
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="auth-anim font-syne text-4xl font-extrabold text-white mb-4">CEO <span className="text-green">Access</span></h1>
            <p className="auth-anim text-text-muted text-sm uppercase tracking-widest">Protocol: Secure Identity Verification</p>
          </div>

          <div className="auth-anim bg-surface/50 border border-white/5 rounded-[2.5rem] p-8 sm:p-12 backdrop-blur-md">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}>
              <div className="space-y-2">
                <label className="text-[10px] text-text-muted uppercase tracking-widest ml-1">Nexonic ID / Email</label>
                <input 
                  type="email" 
                  placeholder="name@company.com"
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

              <button type="submit" className="btn-primary w-full py-4 rounded-xl mt-4">
                Verify & Enter Dashboard →
              </button>

              <div className="pt-6 border-t border-white/5 flex flex-col gap-4 text-center">
                <a href="#" className="text-[11px] text-text-muted hover:text-white transition-colors uppercase tracking-widest">Forgot Access Protocol?</a>
                <p className="text-[12px] text-text-muted">
                  New Founder? <a href="/auth/signup" className="text-green hover:underline">Request Initialization</a>
                </p>
              </div>
            </form>
          </div>
          
          <p className="auth-anim mt-8 text-center text-[10px] text-text-muted/40 uppercase tracking-[0.2em]">
            Nexonic Industries Secure Gateway v4.2
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
