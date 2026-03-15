'use client';

import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'border-b border-white/5 bg-background/85 backdrop-blur-xl' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="font-syne font-[800] text-[24px] text-green tracking-tight">ORCA</span>
        </a>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Departments', 'Pricing', 'About', 'Nexonic'].map((link) => (
            <a 
              key={link}
              href={`/${link.toLowerCase()}`} 
              className="text-sm font-dm-mono text-text-muted hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right: CTA */}
        <button 
          onClick={() => window.location.href = '/auth/signup'}
          className="btn-primary text-[12px] sm:text-[13px] px-5 py-2.5 rounded-lg"
        >
          Join Early Access →
        </button>
      </div>
    </nav>
  );
}

