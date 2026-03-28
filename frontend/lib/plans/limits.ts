// lib/plans/limits.ts

export const PLAN_LIMITS = {
  free: {
    departments: 2,
    agents: 6,
    monthly_tasks: 50,
    team_members: 1,
    role: 'Solo Founder',
    integrations: 3,
    coordination_feed: false,
    tech_dept: false,
    orcahub: 'basic',
    byollm: false,
    api_access: false,
    coordination_depth: 1,
  },
  builder: {
    departments: 5,
    agents: 25,
    monthly_tasks: 500,
    team_members: 3,
    role: 'Growth Team',
    integrations: 999,
    coordination_feed: true,
    tech_dept: true,
    orcahub: 'full',
    byollm: false,
    api_access: false,
    coordination_depth: 3,
  },
  founding: {
    departments: 5,
    agents: 25,
    monthly_tasks: 500,
    team_members: 3,
    role: 'Founding Member',
    integrations: 999,
    coordination_feed: true,
    tech_dept: true,
    orcahub: 'full',
    byollm: false,
    api_access: false,
    coordination_depth: 3,
  },
  pro: {
    departments: 5,
    agents: 25,
    monthly_tasks: 999999,
    team_members: 10,
    role: 'Enterprise Scale',
    integrations: 999,
    coordination_feed: true,
    tech_dept: true,
    orcahub: 'full',
    byollm: true,
    api_access: true,
    coordination_depth: 5,
    white_label: true,
    custom_agent_training: true,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free
}

export function canAccessFeature(plan: string, feature: keyof typeof PLAN_LIMITS.pro): boolean {
  const limits = getPlanLimits(plan)
  return !!(limits as any)[feature]
}

export function getDepartmentLimit(plan: string): number {
  return getPlanLimits(plan).departments
}
