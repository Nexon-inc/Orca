'use client';

import { useState } from 'react';

export default function DashboardHeader() {
  return (
    <header className="h-16 flex items-center justify-end px-8 sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 shrink-0 gap-6">
      <button className="bg-primary-container text-on-primary px-4 py-1.5 text-[10px] font-black uppercase rounded-sm hover:opacity-90 transition-all font-headline tracking-widest">
        Upgrade License
      </button>
      
      <button className="text-on-surface/40 hover:text-primary-container transition-colors relative">
        <span className="material-symbols-outlined text-xl">notifications</span>
        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-error rounded-full"></span>
      </button>
      
      <button className="text-on-surface/40 hover:text-primary-container transition-colors">
        <span className="material-symbols-outlined text-xl">apps</span>
      </button>
    </header>
  );
}
