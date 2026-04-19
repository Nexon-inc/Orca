'use client';

import { useState, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import { Eye, EyeOff } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';

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

  // â”€â”€â”€ INPUT CLASS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const inputCls =
    'w-full bg-surface border border-white/5 rounded-xl px-4 py-3 font-dm-mono text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all';

  // â”€â”€â”€ EMAIL SENT SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (emailSent) {
    return (
      <main className="min-h-screen bg-bg text-white font-dm-mono flex flex-col">
        <Navigation />
        <section className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24">
          <div className="max-w-lg w-full text-center space-y-8">

            {/* Icon */}
            <div className="auth-anim opacity-0 w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto">
              <span className="text-3xl">âœ‰ï¸</span>
            </div>

            {/* Heading */}
            <div className="auth-anim opacity-0">
              <p className="font-dm-mono text-[10px] text-green tracking-[0.3em] uppercase mb-3">Verification sent</p>
              <h1 className="font-syne text-2xl font-bold text-white">Check your inbox</h1>
            </div>

            {/* Desc */}
            <p className="auth-anim opacity-0 font-dm-mono text-[13px] text-text-muted leading-relaxed max-w-sm mx-auto">
              We've sent two emails to <span className="text-white">{submittedEmail}</span>.
              One to verify your address, one to welcome you to ORCA.
            </p>

            {/* Cards */}
            <div className="auth-anim opacity-0 text-left space-y-3">
              <div className="group p-5 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-dm-mono text-[10px] text-green tracking-widest uppercase opacity-60">Step 01</span>
                  <span className="text-lg text-green/40 group-hover:text-green transition-colors">ðŸ”</span>
                </div>
                <h3 className="font-syne text-[15px] font-bold text-white mb-1">Verify your email</h3>
                <p className="font-dm-mono text-[12px] text-text-muted leading-relaxed">
                  Click the button in the first email. You'll be taken straight to onboarding to build your AI workforce.
                </p>
              </div>

              <div className="group p-5 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-dm-mono text-[10px] text-white/30 tracking-widest uppercase opacity-60">Step 02</span>
                  <span className="text-lg text-white/20 group-hover:text-white/50 transition-colors">ðŸ‘‹</span>
                </div>
                <h3 className="font-syne text-[15px] font-bold text-white mb-1">Welcome to ORCA</h3>
                <p className="font-dm-mono text-[12px] text-text-muted leading-relaxed">
                  Your second email is from the ORCA team â€” everything you need to get your AI company OS running.
                </p>
              </div>
            </div>

            <p className="auth-anim opacity-0 font-dm-mono text-[11px] text-white/20 uppercase tracking-[0.2em]">
              Didn't receive it? Check your spam folder.
            </p>

            <button
              onClick={() => { setEmailSent(false); setError(''); }}
              className="auth-anim opacity-0 font-dm-mono text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest underline underline-offset-4"
            >
              â† Use a different email
            </button>
          </div>
        </section>
      </main>
    );
  }

  // â”€â”€â”€ SIGNUP FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <main className="min-h-screen bg-bg text-white font-dm-mono flex flex-col overflow-x-hidden">
      <Navigation />

      {/* Subtle background glow â€” same as landing */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.04] bg-green rounded-full blur-[140px]" />

      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 relative z-10">
        <div className="max-w-lg w-full">

          {/* Header â€” same typescale as HowItWorks section header */}
          <div className="auth-anim opacity-0 text-center mb-10">
            <p className="font-dm-mono text-[10px] text-green tracking-[0.3em] uppercase mb-4 opacity-60">
              AI Company OS â€” Early Access
            </p>
            <h1 className="font-syne text-3xl font-bold text-white mb-3">
              Initialize your <span className="text-green">workforce</span>
            </h1>
            <p className="font-dm-mono text-[13px] text-text-muted leading-relaxed">
              Create your account to deploy 6 AI executives across 5 departments.
            </p>
          </div>

          {/* Card â€” same style as HowItWorks cards */}
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

              {/* Row 3 â€” Passwords */}
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

              {/* CTA â€” same as landing primary button */}
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
            ORCA Â· AI Company OS Â· Nexonic Industries
          </p>
        </div>
      </section>
    </main>
  );
}

