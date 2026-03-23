'use client';

import { useState } from 'react';

interface VideoResultCardProps {
  id: string;
  template: string;
  props: any;
  orgId: string;
}

export default function VideoResultCard({ id, template, props, orgId }: VideoResultCardProps) {
  const [status, setStatus] = useState<'idle' | 'rendering' | 'ready' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const startRender = async () => {
    setStatus('rendering');
    try {
      const res = await fetch('/api/video/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, props, orgId })
      });
      const data = await res.json();
      if (data.video_url) {
        setVideoUrl(data.video_url);
        setStatus('ready');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Render failed:', err);
      setStatus('error');
    }
  };

  return (
    <div className="mt-4 p-6 rounded-[2rem] border border-white/5 bg-surface/30 backdrop-blur-xl max-w-md workspace-anim">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-2 h-2 rounded-full ${status === 'rendering' ? 'bg-warn animate-pulse' : 'bg-green'}`} />
        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
          {status === 'rendering' ? 'Rendering Video...' : 'Video Generation Ready'}
        </span>
      </div>

      {status === 'idle' && (
        <button 
          onClick={startRender}
          className="w-full py-4 rounded-xl bg-green text-bg font-syne font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Generate Video Asset →
        </button>
      )}

      {status === 'rendering' && (
        <div className="py-8 text-center text-[11px] text-white/40 italic font-dm-mono">
          Assembling frames and bundling assets...
        </div>
      )}

      {status === 'ready' && videoUrl && (
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-bg/50 border border-white/5 overflow-hidden relative group">
            <video 
              src={videoUrl} 
              className="w-full h-full object-cover"
              controls
            />
          </div>
          <div className="flex gap-2">
            <a 
              href={videoUrl} 
              download 
              className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-center text-[10px] font-black uppercase tracking-widest transition-all"
            >
              ⬇ Download MP4
            </a>
            <button className="flex-1 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-widest transition-all">
              📤 Post to Instagram
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-red-400 text-[11px] font-black uppercase">Render Failed. Please check parameters.</div>
      )}
    </div>
  );
}
