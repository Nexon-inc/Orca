'use client';

import { useState } from 'react';

export default function DashboardHeader() {
  return (
    <header className="h-16 flex items-center justify-end px-8 sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 shrink-0 gap-6">
      <button className="bg-primary-container text-on-primary px-4 py-1.5 text-[10px] font-black uppercase rounded-sm hover:opacity-90 transition-all font-headline tracking-widest">
        Upgrade License
      </button>
      
      <button className="text-on-surface/40 hover:text-primary-container transition-colors relative">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-error rounded-full"></span>
      </button>
      
      <button className="text-on-surface/40 hover:text-primary-container transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      </button>
    </header>
  );
}
