'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DepartmentCardProps {
  department: {
    id: string;
    key: string;
    name: string;
    emoji: string;
    count: number;
    agents: { id: string; icon: string; name: string, csuite_title?: string, is_department_head?: boolean }[];
    desc: string;
  };
}

export default function DepartmentCard({ department }: DepartmentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const headAgent = department.agents.find(a => a.is_department_head);

  return (
    <div
      onClick={() => router.push(`/dashboard/chat?dept=${department.key}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="card-clickable p-8 rounded-xl flex flex-col gap-6 relative group cursor-pointer"
    >
      {/* Bioluminescent Glow */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100`}
        style={{
          background: 'radial-gradient(circle at top right, var(--green-dim) 0%, transparent 60%)',
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full gap-6">
        {/* Header: Icon + Count */}
        <div className="flex items-center justify-between">
          <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300">
            {department.emoji}
          </span>
          <span className="font-dm-mono text-[11px] text-text-muted px-2 py-1 rounded bg-surface border border-white/5 uppercase tracking-widest">
            {department.count} Agents Coordinated
          </span>
        </div>

        {/* Name + Description */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h3 className="font-syne font-bold text-[20px] text-white group-hover:text-green transition-colors uppercase tracking-tight">
              {department.name}
            </h3>
            {headAgent?.csuite_title && (
              <span className="text-[10px] text-green font-black uppercase tracking-[0.2em] -mt-1 opacity-80">
                Led by {headAgent.name} ({headAgent.csuite_title})
              </span>
            )}
          </div>
          <p className="font-dm-mono text-[12px] text-text-muted leading-relaxed mt-2">
            {department.desc}
          </p>
        </div>

        {/* Agent Pills */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {department.agents.slice(0, 5).map((agent) => (
            <span 
              key={agent.id}
              className={`px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-dm-mono text-white/50 flex items-center gap-1.5 group-hover:bg-white/10 transition-colors ${agent.is_department_head ? 'border-green/30 text-green/60' : ''}`}
            >
              <span>{agent.icon}</span>
              <span>{agent.name}</span>
            </span>
          ))}
        </div>
      </div>
      
      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
         <div className="absolute top-3 right-3 w-1 h-1 rounded-full bg-green opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

