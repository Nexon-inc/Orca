import { normalizePlanId } from '@/lib/plans/limits'

const INPUT_LIMITS = {
  free: 500,
  builder: 2000,
  starter: 2000,
  founding_builder: 2000,
  pro: 8000,
  enterprise: 20000,
} as const

export function enforceInputLimit(
  content: string,
  plan: string
): { allowed: boolean; truncated?: string; error?: string } {
  const normalized = normalizePlanId(plan)
  const limit = INPUT_LIMITS[normalized as keyof typeof INPUT_LIMITS] ?? INPUT_LIMITS.free

  if (content.length <= limit) return { allowed: true }

  return {
    allowed: false,
    error: `Your brief exceeds the ${normalized} plan limit of ${limit} characters. Upgrade for longer briefs, or shorten your message.`,
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export async function checkTokenGuard(
  orgId: string,
  contentLen: string | number,
  plan?: string
): Promise<{ allowed: boolean; reason?: string }> {
  let resolvedPlan = plan
  if (!resolvedPlan) {
    const { createServerSupabaseClient } = await import('@/lib/supabase/server')
    const supabase = await createServerSupabaseClient()
    const { data: org } = await supabase.from('organizations').select('plan').eq('id', orgId).single()
    resolvedPlan = org?.plan || 'free'
  }
  const content = typeof contentLen === 'number' ? ' '.repeat(contentLen) : contentLen
  const { allowed, error } = enforceInputLimit(content, resolvedPlan)
  return { allowed, reason: error }
}
