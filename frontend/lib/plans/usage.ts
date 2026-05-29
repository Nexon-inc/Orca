import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPlanLimits, normalizePlanId } from './limits'

function monthStartIso(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function countMonthlyAgentTasks(orgId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { data: convs } = await supabase.from('conversations').select('id').eq('org_id', orgId)
  const convIds = convs?.map((c) => c.id) ?? []
  if (convIds.length === 0) return 0

  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('sender_type', 'agent')
    .gte('created_at', monthStartIso())
    .in('conversation_id', convIds)

  return count ?? 0
}

export async function checkMonthlyBriefQuota(
  orgId: string,
  plan: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = getPlanLimits(plan).monthly_briefs
  const used = await countMonthlyAgentTasks(orgId)
  return { allowed: used < limit, used, limit }
}

export async function countActiveDepartments(orgId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { count } = await supabase
    .from('departments')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('agents_paused', false)
  return count ?? 0
}

export function displayPlanLabel(plan: string, isFounding: boolean): string {
  if (isFounding || plan === 'founding_builder') return 'Founding Builder ($19/mo locked)'
  return normalizePlanId(plan)
}
