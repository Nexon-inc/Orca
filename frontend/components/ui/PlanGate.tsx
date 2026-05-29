// components/ui/PlanGate.tsx
'use client'
import { useRole } from '@/hooks/useRole'
import { planMeetsMinimum } from '@/lib/plans/planOrder'

interface PlanGateProps {
  requiredPlan: 'builder' | 'starter' | 'pro' | 'enterprise'
  feature: string
  children: React.ReactNode
  showLock?: boolean
}

export function PlanGate({ requiredPlan, feature, children, showLock = true }: PlanGateProps) {
  const { plan, loading } = useRole()
  
  if (loading) return <div className="animate-pulse bg-white/5 rounded-lg h-10 w-32" />

  const hasAccess = planMeetsMinimum(plan, requiredPlan)

  if (hasAccess) return <>{children}</>

  if (!showLock) return null

  return (
    <div className="relative group/gate">
      <div className="opacity-40 pointer-events-none select-none filter blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center cursor-help">
        <div className="bg-black/90 backdrop-blur-md rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green border border-green/20 shadow-2xl scale-90 group-hover/gate:scale-100 transition-transform duration-300">
          🔒 {requiredPlan} Required
        </div>
      </div>
    </div>
  )
}
