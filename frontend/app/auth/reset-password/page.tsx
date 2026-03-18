'use client';

import { useState, useEffect } from 'react';
import { animate } from 'animejs';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    animate('.auth-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: (el, i) => i * 100,
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(true);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Protocol updated. Re-verifying...");
      router.push('/auth/login');
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text-body font-dm-mono flex flex-col overflow-x-hidden">
      <Navigation />
      
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-5 text-green">
          <div className="w-full h-full bg-current filter blur-[150px] rounded-full" />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-10">
            <h1 className="auth-anim font-syne text-3xl font-extrabold text-white mb-4 tracking-tight uppercase">Update Access</h1>
            <p className="auth-anim text-text-muted text-[10px] uppercase tracking-[0.4em] font-black opacity-60 italic">Protocol: Secure Identity Update</p>
          </div>

          <div className="auth-anim bg-surface/50 border border-white/5 rounded-[3rem] p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
            <form className="space-y-8" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest ml-1">New Access Protocol</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-bg/50 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-green/50 transition-all font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-white/40 font-black uppercase tracking-widest ml-1">Confirm New Protocol</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-bg/50 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-green/50 transition-all font-bold"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`btn-primary w-full py-5 rounded-2xl mt-4 text-sm font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(0,255,135,0.15)] hover:shadow-[0_20px_60px_rgba(0,255,135,0.3)] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {loading ? 'Processing...' : 'Update & Re-verify →'}
              </button>
            </form>
          </div>
          
          <p className="auth-anim mt-12 text-center text-[10px] text-white/20 uppercase tracking-[0.5em] font-black italic">
            Secure Deployment Gateway v4.5.1
          </p>
        </div>
      </section>
    </main>
  );
}
