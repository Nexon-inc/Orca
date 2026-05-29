import { normalizePlanId } from './limits'

/** Lowest → highest tier for feature gating */
export const PLAN_ORDER = ['free', 'builder', 'starter', 'pro', 'enterprise'] as const

export function planTierIndex(plan: string): number {
  const key = normalizePlanId(plan)
  if (key === 'starter') return PLAN_ORDER.indexOf('builder')
  const idx = PLAN_ORDER.indexOf(key as (typeof PLAN_ORDER)[number])
  return idx >= 0 ? idx : 0
}

export function planMeetsMinimum(orgPlan: string, requiredPlan: string): boolean {
  return planTierIndex(orgPlan) >= planTierIndex(requiredPlan)
}
