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

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/chat`,
      },
    });
    if (error) {
      toast.error(error.message);
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

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-white/20 text-[9px] uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-[#030a06] border border-white/5 hover:border-green/30 hover:bg-green/5 rounded-xl p-4 flex items-center justify-center gap-3 text-sm text-white font-bold transition-all"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
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
