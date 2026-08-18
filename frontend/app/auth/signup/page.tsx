'use client';

import { useState, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import { Eye, EyeOff } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Kenya',
    orgName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    animate('.auth-anim', {
      opacity: [0, 1],
      y: [30, 0],
      delay: stagger(120),
      duration: 900,
      ease: 'outExpo',
    });
  }, [emailSent]);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-white/5' };
    let score = 0;
    if (pwd.length > 0) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: 'Weak', color: 'bg-red-500/70' },
      { label: 'Fair', color: 'bg-yellow-400/70' },
      { label: 'Good', color: 'bg-green/60' },
      { label: 'Strong', color: 'bg-green' },
    ];
    return { score, ...(levels[score - 1] || levels[0]) };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          org_name: formData.orgName || `${formData.fullName}'s Company`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmittedEmail(formData.email);
      setEmailSent(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/chat`,
      },
    });
    if (error) {
      if (error.message?.includes('provider is not enabled') || error.message?.includes('validation_failed')) {
        toast.error("Google provider is not enabled in Supabase Auth settings. Please sign up with email and password below.");
        setError("Google login is currently disabled in Supabase. Please sign up using your email and password.");
      } else {
        toast.error(error.message);
      }
    }
  };

  // ─── INPUT CLASS ─────────────────────────────────────────────────────────
  const inputCls =
    'w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-dm-mono text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all';

  // ─── EMAIL SENT SCREEN ──────────────────────────────────────────────────
  if (emailSent) {
    return (
      <main className="min-h-screen bg-bg text-white font-dm-mono flex flex-col">
        <Navigation />
        <section className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/30 flex items-center justify-center mx-auto">
              <span className="text-3xl">✉️</span>
            </div>
            <div>
              <p className="font-dm-mono text-[10px] text-green tracking-[0.3em] uppercase mb-2">Verification Sent</p>
              <h1 className="font-syne text-lg font-bold text-white">We've sent a verification email to your email address.</h1>
            </div>
            <p className="font-dm-mono text-[12px] text-text-muted">
              Please check <span className="text-white font-bold">{submittedEmail}</span> and click the link to activate your account.
            </p>
            <button
              onClick={() => { setEmailSent(false); setError(''); }}
              className="font-dm-mono text-[11px] text-white/40 hover:text-white transition-colors uppercase tracking-widest underline underline-offset-4 pt-2 block mx-auto"
            >
              ← Use a different email
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ─── SIGNUP FORM ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-bg text-white font-dm-mono flex flex-col overflow-x-hidden">
      <Navigation />

      {/* Subtle background glow — same as landing */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.04] bg-green rounded-full blur-[140px]" />

      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 relative z-10">
        <div className="max-w-lg w-full">

          {/* Header — same typescale as HowItWorks section header */}
          <div className="auth-anim opacity-0 text-center mb-10">
            <p className="font-dm-mono text-[10px] text-green tracking-[0.3em] uppercase mb-4 opacity-60">
              AI Company OS — Early Access
            </p>
            <h1 className="font-syne text-3xl font-bold text-white mb-3">
              Initialize your <span className="text-green">workforce</span>
            </h1>
            <p className="font-dm-mono text-[13px] text-text-muted leading-relaxed">
              Create your account to deploy 6 AI executives across 5 departments.
            </p>
          </div>

          {/* Card — same style as HowItWorks cards */}
          <div className="auth-anim opacity-0 p-8 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm relative overflow-hidden">

            {/* Subtle top line like HowItWorks card */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Inline error */}
            {error && (
              <div className="mb-6 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                <p className="font-dm-mono text-[12px] text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Kyalo"
                    className={inputCls}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Company Name</label>
                  <input
                    type="text"
                    placeholder="Nexonic Industries"
                    className={inputCls}
                    value={formData.orgName}
                    onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="founder@orca.ai"
                    className={inputCls}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Country</label>
                  <select
                    className={inputCls + ' appearance-none cursor-pointer'}
                    style={{ colorScheme: 'dark' }}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  >
                    {COUNTRIES.map((c: string) => (
                      <option key={c} value={c} className="bg-[#070d08] text-white">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3 — Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className={inputCls + ' pr-10'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {formData.password && (
                    <div className="mt-2 flex gap-1 items-center">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-white/5'}`} />
                      ))}
                      <span className="font-dm-mono text-[9px] text-white/20 ml-2 uppercase tracking-wide">{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-dm-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      className={inputCls + ' pr-10'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="tos"
                  className="mt-0.5 w-4 h-4 accent-green cursor-pointer shrink-0"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <label htmlFor="tos" className="font-dm-mono text-[12px] text-white/40 leading-relaxed cursor-pointer hover:text-white/60 transition-colors">
                  I agree to the{' '}
                  <a href="/terms" className="text-white/70 hover:text-green underline underline-offset-4 transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-white/70 hover:text-green underline underline-offset-4 transition-colors">Privacy Policy</a>.
                </label>
              </div>

              {/* CTA — same as landing primary button */}
              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className={`btn-primary w-full py-4 rounded-xl font-syne font-bold text-[14px] uppercase tracking-widest transition-all mt-2 ${
                  loading || !termsAccepted
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {loading ? 'Initializing...' : 'Create Account →'}
              </button>

              <div className="relative flex py-1 items-center">
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

              {/* Divider + login link */}
              <div className="pt-5 border-t border-white/5 flex items-center justify-center">
                <p className="font-dm-mono text-[12px] text-white/30">
                  Already initialized?{' '}
                  <a href="/auth/login" className="text-white/60 hover:text-green underline underline-offset-4 transition-colors">
                    Log in
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Footer note */}
          <p className="auth-anim opacity-0 mt-8 text-center font-dm-mono text-[10px] text-white/15 uppercase tracking-[0.4em]">
            ORCA · AI Company OS · Nexonic Industries
          </p>
        </div>
      </section>
    </main>
  );
}

