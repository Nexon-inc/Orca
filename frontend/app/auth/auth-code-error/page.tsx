'use client';

import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-[#030a06] flex items-center justify-center p-6 font-syne">
      <div className="max-w-md w-full bg-[#040d06] border border-[#00D9661f] rounded-[2rem] p-12 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00D9660a] rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-[#00D9660a] border border-[#00D9661f] rounded-3xl flex items-center justify-center text-4xl mb-8 mx-auto">
            ⚠️
          </div>
          
          <h1 className="text-3xl font-[900] text-white mb-4 tracking-tight uppercase">
            Verification <span className="text-[#00D966]">Failed</span>
          </h1>
          
          <p className="text-[#4a7a5a] font-dm-mono text-sm leading-relaxed mb-10">
            The verification link you clicked is either invalid, expired, or has already been used. Please try signing up again or request a new password reset.
          </p>
          
          <div className="flex flex-col gap-4">
            <Link 
              href="/auth" 
              className="w-full py-4 bg-[#00D966] text-[#030a06] rounded-xl font-[800] text-sm uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,102,0.2)]"
            >
              Back to Sign In
            </Link>
            
            <a 
              href="mailto:support@nexonic.io" 
              className="w-full py-4 border border-[#00D9661f] text-[#00D966] rounded-xl font-[800] text-sm uppercase tracking-widest hover:bg-[#00D96605] transition-all"
            >
              Contact Support
            </a>
          </div>
          
          <p className="mt-12 text-[10px] font-dm-mono text-[#4a7a5a] uppercase tracking-[0.2em]">
            Nexonic Industries · AI Company OS
          </p>
        </div>
      </div>
    </div>
  );
}
