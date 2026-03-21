'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { animate } from 'animejs';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let email = identifier;

    // Basic email check
    const isEmail = identifier.includes('@');
    
    if (!isEmail) {
      // Lookup email by username from the profiles table
      const { data, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();
      
      if (lookupError || !data) {
        toast.error("Invalid username or email pattern detected.");
        setLoading(false);
        return;
      }
      email = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Identity verified. Synchronizing dashboard...");
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text-body font-dm-mono flex flex-col overflow-x-hidden">
      <Navigation />
      
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-5 text-green">
          <div className="w-full h-full bg-current filter blur-[150px] rounded-full" />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-10">
            <h1 className="auth-anim font-syne text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight uppercase leading-none">
              <span className="text-green">ORCA</span> Login
            </h1>
            <p className="auth-anim font-dm-mono text-[10px] text-text-muted/60 uppercase tracking-[0.4em] font-bold italic">
              Access your autonomous ecosystem
            </p>
          </div>

          <div className="auth-anim bg-[#030a06]/80 border border-white/5 rounded-[2.5rem] p-8 sm:p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green/20 to-transparent" />
            <form className="space-y-8" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="font-dm-mono text-[9px] text-white/30 uppercase tracking-[0.2em] ml-1">Username / Email</label>
                <input 
                  type="text" 
                  placeholder="nexus_one or entity@orca.ai"
                  className="w-full bg-[#030a06] border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-green/50 focus:bg-green/5 transition-all font-bold placeholder:text-white/10"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                  <label className="font-dm-mono text-[9px] text-white/30 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group/pass">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="w-full bg-[#030a06] border border-white/5 rounded-xl p-4 pr-12 text-sm text-white focus:outline-none focus:border-green/50 focus:bg-green/5 transition-all font-bold placeholder:text-white/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-green/60 hover:text-green transition-colors z-[100]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

               <button 
                type="submit" 
                disabled={loading}
                className={`btn-primary w-full py-5 rounded-xl mt-4 text-[15px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(0,255,135,0.15)] hover:shadow-[0_20px_60px_rgba(0,255,135,0.3)] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {loading ? 'Verifying...' : 'Log In →'}
              </button>

               <div className="pt-8 border-t border-white/5 flex flex-col gap-6 text-center">
                <a href="/auth/forgot-password" className="text-[10px] text-white/40 hover:text-green transition-colors uppercase tracking-[0.2em] font-black">Forgot Password?</a>
                <p className="text-[12px] text-white/40 font-bold uppercase tracking-widest">
                  Don't have an account? <a href="/auth/signup" className="text-green hover:text-green/70 transition-colors underline underline-offset-8 decoration-green/20">Sign Up</a>
                </p>
              </div>
            </form>
          </div>
          
          <p className="auth-anim mt-12 text-center text-[10px] text-white/20 uppercase tracking-[0.5em] font-black italic">
            ORCA Deployment v1.0
          </p>
        </div>
      </section>
    </main>
  );
}
