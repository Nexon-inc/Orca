'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/chat');
  }, [router]);

  return (
    <div className="h-screen bg-bg flex items-center justify-center font-syne text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green/10 border border-green/20 flex items-center justify-center relative">
          <img src="/orca-logo.svg" alt="logo" className="w-6 h-6 animate-pulse" />
        </div>
        <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Initializing Chat Console...</span>
      </div>
    </div>
  );
}
