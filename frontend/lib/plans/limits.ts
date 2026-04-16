// lib/plans/limits.ts

export const PLAN_LIMITS = {
  free: {
    departments: 0,
    agents: 0,
    team_members: 1,
    department_heads: 0,
    monthly_briefs: 100,
    coordination_depth: 1,
    audit_log_days: 7,
    video_generation: false,
    code_generation: false,
    web_intelligence_pages: 0,
    byollm: false,
    ollama: false,
    api_access: false,
    orcahub_publish: false,
    custom_agent_training: false,
  },
  starter: {
    departments: 2,
    agents: 10,
    team_members: 3,
    department_heads: 1,
    monthly_briefs: 999999,
    coordination_depth: 1,
    audit_log_days: 30,
    video_generation: false,
    code_generation: false,
    web_intelligence_pages: 0,
    byollm: false,        // can connect own Gemini or Groq only
    byollm_providers: ['gemini', 'groq'],
    ollama: false,
    api_access: false,
    orcahub_publish: false,
    custom_agent_training: false,
  },
  pro: {
    departments: 6,
    agents: 30,
    team_members: 8,
    department_heads: 2,
    monthly_briefs: 999999,
    coordination_depth: 3,
    audit_log_days: 180,
    video_generation: true,
    video_limit: 10,       // 10 videos per month
    code_generation: true,
    web_intelligence_pages: 500,
    byollm: true,
    byollm_providers: ['gemini', 'groq', 'openai', 'anthropic', 'mistral'],
    ollama: false,
    api_access: false,
    orcahub_publish: false,
    custom_agent_training: false,
  },
  enterprise: {
    departments: 9,
    agents: 45,
    team_members: 999999,
    department_heads: 999999,
    monthly_briefs: 999999,
    coordination_depth: 5,
    audit_log_days: 365,
    video_generation: true,
    video_limit: 999999,   // unlimited
    code_generation: true,
    web_intelligence_pages: 5000,
    byollm: true,
    byollm_providers: ['gemini', 'groq', 'openai', 'anthropic', 'mistral', 'ollama'],
    ollama: true,
    api_access: true,
    orcahub_publish: true,
    custom_agent_training: true,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free
}

export function canAccessFeature(plan: string, feature: keyof typeof PLAN_LIMITS.enterprise): boolean {
  const limits = getPlanLimits(plan)
  return !!(limits as any)[feature]
}

export function getDepartmentLimit(plan: string): number {
  return getPlanLimits(plan).departments
}
