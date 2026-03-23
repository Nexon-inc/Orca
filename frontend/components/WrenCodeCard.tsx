'use client';

import { useState, useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface WrenCodeCardProps {
  id: string;
  filePath: string;
  code: string;
  explanation: string;
  hasPr?: boolean;
  onApprove?: () => void;
}

export default function WrenCodeCard({ id, filePath, code, explanation, hasPr, onApprove }: WrenCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    const highlighted = hljs.highlightAuto(code).value;
    // Add line numbers
    const lines = highlighted.split('\n').map((line, i) => 
      `<span class="text-white/20 select-none mr-4 w-6 inline-block text-right">${i + 1}</span>${line}`
    ).join('\n');
    setHighlightedCode(lines);
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl bg-surface/40 border border-white/10 rounded-[2rem] overflow-hidden mt-4 workspace-anim shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Wren · Code Generated</p>
            <p className="text-[12px] font-dm-mono text-green font-bold truncate max-w-[300px]">{filePath}</p>
          </div>
        </div>
        <button 
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>

      <div className="relative">
        <pre className="p-6 overflow-x-auto no-scrollbar font-dm-mono text-[13px] leading-relaxed bg-[#0d1117]">
          <code 
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlightedCode }} 
          />
        </pre>
      </div>

      <div className="p-6 bg-white/[0.01] border-t border-white/5">
        <p className="text-[11px] text-white/60 leading-relaxed mb-6 italic">
          <span className="text-white font-bold not-italic block mb-1">Explanation:</span>
          {explanation}
        </p>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onApprove}
            className="px-6 py-2.5 rounded-xl bg-green text-bg text-[10px] font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(0,255,135,0.2)] hover:scale-105 transition-all"
          >
            ✓ Approve
          </button>
          
          {hasPr && (
            <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
              📂 Open PR on GitHub <span className="opacity-40">↗</span>
            </button>
          )}

          <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
            Apply Directly
          </button>
        </div>
      </div>
    </div>
  );
}
