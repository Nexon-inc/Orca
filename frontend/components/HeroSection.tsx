'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, createTimeline, stagger } from 'animejs';

interface Particle {
  id: number;
  left: number;
  top: number;
  opacity: number;
}

export default function HeroSection() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [simStep, setSimStep] = useState<'overview' | 'workspace'>('overview');
  const [simAgent, setSimAgent] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const particlesRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 50;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: 0.1 + Math.random() * 0.2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    initAnimations();
    runSimulationLoop();
  }, [particles]);

  const initAnimations = () => {
    // Particles fade
    animate('.particle-dot', {
      opacity: [0, (el: any) => el.getAttribute('data-opacity')],
      duration: 2000,
      delay: stagger(40),
      ease: 'inOutQuad',
    });

    // Entrance animations
    if (badgeRef.current) animate(badgeRef.current, { opacity: [0, 1], y: [20, 0], duration: 1200, ease: 'outExpo' });
    if (headlineRef.current) animate(headlineRef.current.querySelectorAll('.line'), { opacity: [0, 1], y: [30, 0], duration: 1000, delay: stagger(200, { start: 500 }), ease: 'outExpo' });
    if (subheadRef.current) animate(subheadRef.current, { opacity: [0, 1], y: [30, 0], duration: 1500, delay: 400, ease: 'outExpo' });
    if (ctaRef.current) animate(ctaRef.current, { opacity: [0, 1], y: [20, 0], duration: 1200, delay: 600, ease: 'outExpo' });
    if (visualRef.current) animate(visualRef.current, { opacity: [0, 1], scale: [0.95, 1], duration: 2000, delay: 400, ease: 'outExpo' });
  };

  const runSimulationLoop = () => {
    if (!cursorRef.current) return;
    
    const tl = createTimeline({
      loop: true,
      delay: 3000
    });

    // 0. Reset State & Show Cursor
    tl.add({
      duration: 500,
      onBegin: () => {
        setSimStep('overview');
        setSimAgent(null);
        setTypedText('');
        setIsThinking(false);
      }
    })
    .add(cursorRef.current, {
      opacity: [0, 1],
      translateX: [100, 0],
      translateY: [100, 0],
      duration: 800,
      ease: 'outExpo'
    })

    // 1. Move to Sidebar Dept (Marketing)
    .add(cursorRef.current, { 
      translateX: -410, 
      translateY: -55, 
      duration: 1200, 
      ease: 'inOutQuad' 
    })
    
    // 2. Click Dept
    .add('#sim-sidebar-marketing', { 
      backgroundColor: ['rgba(0,255,135,0)', 'rgba(0,255,135,0.2)', 'rgba(0,255,135,0)'],
      scale: [1, 0.95, 1], 
      duration: 400, 
      ease: 'outQuad', 
      onBegin: () => setSimStep('workspace') 
    })

    // 3. Small delay for workspace to render/animate in
    .add({ duration: 800 })

    // 4. Move to Agent (Aria) - now in workspace
    .add(cursorRef.current, { 
      translateX: -285, 
      translateY: -155, 
      duration: 1000, 
      ease: 'inOutQuad' 
    })
    
    // 5. Click Agent
    .add('#sim-agent-AR', { 
      backgroundColor: ['rgba(0,255,135,0)', 'rgba(0,255,135,0.4)', 'rgba(0,255,135,0)'],
      scale: [1, 0.9, 1], 
      duration: 400, 
      ease: 'outQuad',
      onBegin: () => setSimAgent('Aria')
    })

    // 6. Move to Input Bar
    .add(cursorRef.current, { 
      translateX: 80, 
      translateY: 225, 
      duration: 1000, 
      ease: 'inOutQuad' 
    })
    
    // 7. Click Input (Focus)
    .add('#sim-input-bar', {
       borderColor: ['rgba(255,255,255,0.1)', 'rgba(0,255,135,0.5)', 'rgba(255,255,255,0.1)'],
       scale: [1, 0.99, 1],
       duration: 400
    })

    // 8. Typing Simulation
    .add({ 
      duration: 3000, 
      onUpdate: (self: any) => {
        const text = "Aria, analyze Q1 performance and sync with Sales.";
        setTypedText(text.slice(0, Math.floor(self.progress * text.length)));
      }
    })
    
    // 9. Send (Click Cursor again)
    .add(cursorRef.current, {
      translateX: 520,
      translateY: 225,
      duration: 600,
      ease: 'inOutQuad'
    })
    .add('#sim-input-bar-send', {
      scale: [1, 0.8, 1],
      duration: 300
    })

    // 10. Thinking State
    .add({ 
      duration: 3500, 
      onBegin: () => { setIsThinking(true); setTypedText(''); }, 
      onComplete: () => setIsThinking(false) 
    })
    
    // 11. Wait for Result and Hide Cursor
    .add(cursorRef.current, {
      opacity: 0,
      duration: 800,
      delay: 2500
    })
    .add({ 
      duration: 2500, 
      onComplete: () => {
        setSimStep('overview');
      }
    });
  };

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Bioluminescence & Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 bg-[radial-gradient(circle_at_center,var(--green-dim)_0%,transparent_60%)] blur-[100px] animate-pulse" />
      </div>
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div key={p.id} className="particle-dot absolute w-1 h-1 rounded-full bg-green" data-opacity={p.opacity} style={{ left: `${p.left}%`, top: `${p.top}%`, opacity: 0 }} />
        ))}
      </div>

      <div className="relative z-20 max-w-5xl mx-auto w-full text-center">
        <div ref={badgeRef} className="mb-10 opacity-0">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 font-dm-mono text-[11px] text-white">
            <span className="text-[14px]">⬡</span> AI Company OS — Now in Early Access
          </span>
        </div>

        <h1 ref={headlineRef} className="mb-8 font-syne font-[800] tracking-tight leading-[1.1] text-white">
          <div className="line opacity-0 text-[42px] sm:text-[64px] lg:text-[72px]">Your competitors have teams.</div>
          <div className="line opacity-0 text-[42px] sm:text-[64px] lg:text-[72px] text-green">You have ORCA.</div>
        </h1>

        <div ref={subheadRef} className="mb-12 opacity-0">
          <p className="max-w-xl mx-auto font-dm-mono text-[15px] sm:text-[17px] text-text-muted leading-relaxed uppercase tracking-tighter">
            9 AI departments. 45 coordinated agents. <br />
            One dashboard. Built to run a company — not assist one.
          </p>
        </div>

        <div ref={ctaRef} className="hero-text-anim opacity-0 flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.location.href = '/auth/signup'}
              className="btn-primary w-full sm:w-auto px-10 py-4 text-[15px] rounded-xl"
            >
              Join Early Access →
            </button>
            <button 
              onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary w-full sm:w-auto px-10 py-4 text-[15px] rounded-xl border-white/10 hover:border-white/30"
            >
              See how it works ↓
            </button>
          </div>
          <p className="mt-2 font-dm-mono text-[10px] text-text-muted/40 uppercase tracking-[0.2em]">
            Free to start · No credit card · Founding pricing locked
          </p>
        </div>

        {/* Hero Visual Simulation */}
        <div ref={visualRef} className="mt-24 relative opacity-0 perspective-[3000px]">
          {/* Virtual Cursor */}
          <div ref={cursorRef} className="absolute top-1/2 left-1/2 w-5 h-5 z-[100] pointer-events-none opacity-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5.5 4.1L15.4 14L10.3 14.5L7.8 18.8L5.5 4.1Z" fill="white" stroke="black" strokeWidth="1.5"/></svg>
          </div>

          <div className="relative mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[#030a06] shadow-[0_0_120px_rgba(0,255,135,0.08)] rotate-x-[4deg] transition-all duration-1000 hover:rotate-x-0 group overflow-hidden scale-[0.8] sm:scale-100">
             <div className="flex h-[550px] text-left font-dm-mono">
                {/* Sidebar */}
                <aside className="w-[180px] border-r border-white/5 bg-surface/80 flex flex-col hidden md:flex">
                   <div className="p-5 border-b border-white/5 flex items-center gap-2">
                      <div className="w-5 h-5 bg-green rounded flex items-center justify-center text-[10px] text-bg font-bold">O</div>
                      <span className="font-syne font-bold text-white text-[12px]">ORCA</span>
                   </div>
                   <nav className="flex-1 p-3 flex flex-col gap-1">
                      <div className={`px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-2 transition-all ${simStep === 'overview' ? 'bg-green/5 text-green' : 'text-text-muted/40'}`}><span>⬡</span> Overview</div>
                      <div className="mt-4 px-3 text-[8px] text-text-muted uppercase tracking-widest opacity-30">Departments</div>
                      {['Marketing', 'Sales', 'Tech'].map(d => (
                         <div key={d} id={d === 'Marketing' ? 'sim-sidebar-marketing' : undefined} className={`px-3 py-1.5 text-[10px] flex items-center gap-2 transition-all ${d === 'Marketing' && simStep === 'workspace' ? 'text-green font-bold bg-green/5 rounded-lg' : 'text-text-muted/40'}`}><span>•</span> {d}</div>
                      ))}
                   </nav>
                </aside>

                <div className="flex-1 flex flex-col">
                   <header className="h-14 border-b border-white/5 bg-surface/30 px-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <h2 className="font-syne font-bold text-white text-[11px] uppercase tracking-wider">
                           {simStep === 'overview' ? 'Command Center' : simAgent ? `${simAgent} | Social Media` : 'Marketing Workspace'}
                         </h2>
                         <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green/10 border border-green/20">
                            <div className="w-1 h-1 rounded-full bg-green animate-pulse" />
                            <span className="text-[8px] text-green font-bold uppercase">{simStep === 'overview' ? '9 ONLINE' : '5 ONLINE'}</span>
                         </div>
                      </div>
                   </header>

                   <div className="p-6 flex-1 flex flex-col gap-6 relative overflow-hidden">
                      {/* Overview View */}
                      <div className={`animate-in fade-in duration-500 ${simStep === 'overview' ? 'block' : 'hidden'}`}>
                          <div className="grid grid-cols-4 gap-4 mb-8">
                             {[{l:'TASKS',v:'142'},{l:'EVENTS',v:'892'},{l:'UPTIME',v:'100%'},{l:'IMPACT',v:'$12.4k'}].map(s=>(
                                <div key={s.l} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                   <div className="text-[7px] text-text-muted uppercase mb-1">{s.l}</div>
                                   <div className="text-[14px] font-syne font-bold text-white">{s.v}</div>
                                </div>
                             ))}
                          </div>
                          <div className="space-y-4">
                             <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Autonomous Departments</span>
                             <div className="grid grid-cols-3 gap-4">
                               {[{n:'Marketing',i:'📣',a:5,id:'marketing'},{n:'Sales',i:'💼',a:5,id:'sales'},{n:'Tech',i:'🛡️',a:4,id:'tech'}].map(d=>(
                                 <div key={d.n} id={`mock-dept-${d.id}`} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col gap-2">
                                   <span className="text-[18px]">{d.i}</span>
                                   <span className="text-[12px] text-white font-syne font-bold">{d.n}</span>
                                   <span className="text-[8px] text-text-muted uppercase">{d.a} Agents</span>
                                 </div>
                               ))}
                             </div>
                          </div>
                      </div>

                      {/* Workspace View */}
                      <div className={`animate-in slide-in-from-right duration-500 h-full flex-col pt-2 ${simStep === 'workspace' ? 'flex' : 'hidden'}`}>
                          <div className="flex gap-2 mb-6 overflow-hidden">
                            {[
                              { icon: '🎙️', name: 'Aria', role: 'Social Media' },
                              { icon: '✍️', name: 'Jackie', role: 'Content' },
                              { icon: '📢', name: 'Eric', role: 'Ads Mgr' },
                              { icon: '🔍', name: 'Lucy', role: 'SEO' },
                              { icon: '🎨', name: 'Joe', role: 'Brand' }
                            ].map((ag, i) => (
                               <div key={ag.name} id={ag.name === 'Aria' ? `sim-agent-AR` : undefined} className={`px-2 py-1.5 rounded-lg border flex flex-col items-center gap-1 min-w-[50px] transition-all duration-300 ${simAgent === ag.name ? 'bg-green/10 border-green/30' : 'bg-white/5 border-white/10 opacity-40'}`}>
                                <span className="text-[12px]">{ag.icon}</span>
                                <span className={`text-[7px] font-bold ${simAgent === ag.name ? 'text-white' : 'text-white/40'}`}>{ag.name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex-1 border-t border-white/5 pt-4 space-y-4 text-[11px]">
                            <div className="flex gap-3">
                              <div className="w-6 h-6 rounded bg-green/10 flex items-center justify-center text-[10px]">🎙️</div>
                              <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 text-white/50 font-dm-mono">Aria here. Ready for the Q1 analysis brief.</div>
                            </div>
                            {typedText && (
                              <div className="flex justify-end"><div className="p-3 rounded-xl bg-white/10 border border-white/10 max-w-[80%] text-white font-dm-mono">{typedText}</div></div>
                            )}
                            {isThinking ? (
                              <div className="flex gap-3 animate-pulse"><div className="w-6 h-6 rounded bg-green/20" /><div className="flex-1 h-12 rounded-xl bg-green/5 border border-green/10" /></div>
                            ) : !typedText && (
                              <div className="p-3 rounded-xl bg-green-dim border border-green/30 animate-in fade-in duration-500 font-dm-mono">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px]">🎙️</span>
                                  <span className="text-[8px] text-green font-bold uppercase tracking-widest">Aria → 💰 Rex | HANDOFF</span>
                                </div>
                                <p className="text-[10px] text-white/80">Analysis complete. 12 high-intent leads handed to <b>Rex (Sales)</b>.</p>
                              </div>
                            )}
                          </div>
                          <div id="sim-input-bar" className="mt-auto p-3 rounded-xl bg-surface border border-white/10 flex justify-between items-center transition-colors">
                            <span className="text-[11px] text-white/20 truncate pr-4">{typedText || "Type a command..."}</span>
                            <div id="sim-input-bar-send" className="w-6 h-6 rounded bg-green flex items-center justify-center text-bg text-[12px] flex-shrink-0">↑</div>
                          </div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-green/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
          </div>

          {/* Floating Badges */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 animate-[float_4s_infinite_ease-in-out]">
             <div className="p-3 bg-[#030a06]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center text-green">💼</div>
                <div className="text-left text-[14px] text-white font-syne font-bold">+$12,400 <span className="block text-[9px] text-text-muted font-bold uppercase">Revenue Impact</span></div>
             </div>
          </div>
          <div className="absolute -right-12 bottom-20 hidden xl:flex flex-col gap-4 animate-[float_5s_infinite_ease-in-out_1s]">
             <div className="p-3 bg-[#030a06]/80 backdrop-blur-md border border-green/30 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green flex items-center justify-center text-bg">🤖</div>
                <div className="text-left text-[14px] text-white font-syne font-bold">Synchronized <span className="block text-[9px] text-green font-bold uppercase">45 Agents Live</span></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

