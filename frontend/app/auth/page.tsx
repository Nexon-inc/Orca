'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Feather } from 'lucide-react';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    calculatePasswordStrength(e.target.value);
  };

  return (
    <div className="min-h-screen w-full bg-background flex overflow-hidden">
      {/* Left Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-5/12 border-r" style={{ borderColor: 'rgba(0, 217, 102, 0.06)', backgroundColor: 'rgba(0, 20, 8, 0.4)' }}>
        <div className="flex flex-col justify-between p-16 w-full">
          {/* Top */}
          <div>
            <Link href="/" className="text-sm font-dm-mono inline-flex items-center gap-2" style={{ color: '#4a7a5a' }}>
              ← Back to ORCA
            </Link>
          </div>

          {/* Center */}
          <div>
            <h1 className="text-5xl font-black font-syne mb-2" style={{ color: '#00D966' }}>
              ORCA
            </h1>
            <p className="text-xs font-dm-mono" style={{ color: '#4a7a5a' }}>
              by{' '}
              <a href="https://nexonic-industries.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors" style={{ color: '#4a7a5a' }}>
                Nexonic Industries
              </a>
            </p>

            <h2 className="text-4xl font-bold font-syne mt-8 mb-8 leading-tight" style={{ color: '#F0FFF4' }}>
              Your entire company.
              <br />
              Run by AI.
            </h2>

            <ul className="space-y-4">
              {[
                '9 fully staffed AI departments',
                '47+ specialized agents',
                'Cross-department coordination',
                'CyberGuard security built in',
                'Free tier — no credit card',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-dm-mono" style={{ color: '#F0FFF4' }}>
                  <span style={{ color: '#00D966' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom */}
          <div>
            <p className="text-xs font-dm-mono mb-3" style={{ color: '#4a7a5a' }}>
              Trusted by founders building from
            </p>
            <div className="flex gap-2 text-xl">
              🇰🇪 🇺🇸 🇬🇧 🇳🇬 🇮🇳 🇿🇦
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-6">
        <div
          className="w-full max-w-sm rounded-3xl p-8 sm:p-12"
          style={{
            backgroundColor: 'rgba(0, 20, 8, 0.8)',
            border: '1px solid rgba(0, 217, 102, 0.12)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b" style={{ borderColor: 'rgba(0, 217, 102, 0.12)' }}>
            {(['signin', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 pb-4 px-4 font-syne font-bold text-center transition-all text-sm sm:text-base"
                style={{
                  color: activeTab === tab ? '#00D966' : '#4a7a5a',
                  borderBottom: activeTab === tab ? '2px solid #00D966' : 'none',
                  backgroundColor: activeTab === tab ? 'rgba(0, 217, 102, 0.08)' : 'transparent',
                }}
              >
                {tab === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-2" style={{ color: '#F0FFF4' }}>
                Welcome back.
              </h2>
              <p className="text-sm font-dm-mono mb-6" style={{ color: '#4a7a5a' }}>
                Your workforce is waiting.
              </p>

              <div className="space-y-4 mb-6">
                {/* Email */}
                <div>
                  <label className="block text-xs font-dm-mono mb-2" style={{ color: '#4a7a5a' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-sm font-dm-mono outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(0, 217, 102, 0.03)',
                      border: '1px solid rgba(0, 217, 102, 0.12)',
                      color: '#F0FFF4',
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#00D966';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0, 217, 102, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = 'rgba(0, 217, 102, 0.12)';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-dm-mono" style={{ color: '#4a7a5a' }}>
                      Password
                    </label>
                    <a href="#" className="text-xs font-dm-mono hover:text-accent transition-colors" style={{ color: '#4a7a5a' }}>
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-10 rounded-lg text-sm font-dm-mono outline-none transition-all"
                      style={{
                        backgroundColor: 'rgba(0, 217, 102, 0.03)',
                        border: '1px solid rgba(0, 217, 102, 0.12)',
                        color: '#F0FFF4',
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = '#00D966';
                        (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0, 217, 102, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'rgba(0, 217, 102, 0.12)';
                        (e.target as HTMLInputElement).style.boxShadow = 'none';
                      }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 rounded-lg font-syne font-bold text-base transition-all" style={{ backgroundColor: '#00D966', color: '#030a06' }}>
                Sign In →
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(0, 217, 102, 0.2)' }} />
                <span className="text-xs font-dm-mono" style={{ color: '#4a7a5a' }}>
                  or
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(0, 217, 102, 0.2)' }} />
              </div>

              <button
                className="w-full py-3 rounded-lg font-syne font-bold text-base transition-all border"
                style={{ borderColor: 'rgba(0, 217, 102, 0.3)', color: '#00D966' }}
              >
                Continue with Google
              </button>

              <p className="text-center text-sm font-dm-mono mt-4">
                <span style={{ color: '#4a7a5a' }}>Don't have an account? </span>
                <button onClick={() => setActiveTab('signup')} className="text-accent hover:underline">
                  Sign up →
                </button>
              </p>
            </div>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <div>
              <h2 className="text-2xl font-syne font-bold mb-2" style={{ color: '#F0FFF4' }}>
                Deploy your workforce.
              </h2>
              <p className="text-sm font-dm-mono mb-6" style={{ color: '#4a7a5a' }}>
                Join 100 early access founders.
              </p>

              {/* Early Access Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-dm-mono mb-6 w-full justify-center"
                style={{
                  backgroundColor: 'rgba(0, 217, 102, 0.08)',
                  border: '1px solid rgba(0, 217, 102, 0.2)',
                  color: '#00D966',
                }}
              >
                <span>🟢</span> Early Access — 100 spots available
              </div>

              <div className="space-y-4 mb-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-dm-mono mb-2" style={{ color: '#4a7a5a' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Kale Francis"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-sm font-dm-mono outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(0, 217, 102, 0.03)',
                      border: '1px solid rgba(0, 217, 102, 0.12)',
                      color: '#F0FFF4',
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#00D966';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0, 217, 102, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = 'rgba(0, 217, 102, 0.12)';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-dm-mono mb-2" style={{ color: '#4a7a5a' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-sm font-dm-mono outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(0, 217, 102, 0.03)',
                      border: '1px solid rgba(0, 217, 102, 0.12)',
                      color: '#F0FFF4',
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#00D966';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0, 217, 102, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = 'rgba(0, 217, 102, 0.12)';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-dm-mono mb-2" style={{ color: '#4a7a5a' }}>
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-lg text-sm font-dm-mono outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(0, 217, 102, 0.03)',
                      border: '1px solid rgba(0, 217, 102, 0.12)',
                      color: '#F0FFF4',
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#00D966';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0, 217, 102, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = 'rgba(0, 217, 102, 0.12)';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                  />
                  {/* Strength Indicator */}
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full"
                        style={{
                          backgroundColor: i < passwordStrength ? '#00D966' : 'rgba(0, 217, 102, 0.2)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-dm-mono mt-1" style={{ color: '#4a7a5a' }}>
                    {passwordStrength === 0 && 'Weak'}
                    {passwordStrength === 1 && 'Fair'}
                    {passwordStrength === 2 && 'Good'}
                    {passwordStrength >= 3 && 'Strong'}
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-dm-mono mb-2" style={{ color: '#4a7a5a' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm font-dm-mono outline-none transition-all"
                      style={{
                        backgroundColor: 'rgba(0, 217, 102, 0.03)',
                        border: '1px solid rgba(0, 217, 102, 0.12)',
                        color: '#F0FFF4',
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = '#00D966';
                        (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0, 217, 102, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'rgba(0, 217, 102, 0.12)';
                        (e.target as HTMLInputElement).style.boxShadow = 'none';
                      }}
                    />
                    {confirmPassword && password === confirmPassword && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#00D966' }}>
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button className="w-full py-3 rounded-lg font-syne font-bold text-base transition-all" style={{ backgroundColor: '#00D966', color: '#030a06' }}>
                Create Account →
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(0, 217, 102, 0.2)' }} />
                <span className="text-xs font-dm-mono" style={{ color: '#4a7a5a' }}>
                  or
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(0, 217, 102, 0.2)' }} />
              </div>

              <button
                className="w-full py-3 rounded-lg font-syne font-bold text-base transition-all border"
                style={{ borderColor: 'rgba(0, 217, 102, 0.3)', color: '#00D966' }}
              >
                Continue with Google
              </button>

              <p className="text-center text-xs font-dm-mono mt-4" style={{ color: '#4a7a5a' }}>
                By signing up you agree to our{' '}
                <a href="/terms" className="text-accent hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-accent hover:underline">
                  Privacy Policy
                </a>
              </p>

              <p className="text-center text-sm font-dm-mono mt-4">
                <span style={{ color: '#4a7a5a' }}>Already have an account? </span>
                <button onClick={() => setActiveTab('signin')} className="text-accent hover:underline">
                  Sign in →
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subtle glow */}
      <div
        className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(0, 217, 102, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}
