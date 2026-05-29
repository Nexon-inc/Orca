import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isOrgFoundingMember } from '@/lib/billing/founding'
import { getPlanLimits, normalizePlanId } from '@/lib/plans/limits'
import { countActiveDepartments, countMonthlyAgentTasks, displayPlanLabel } from '@/lib/plans/usage'

export type OrgMetricsSnapshot = {
  plan: string
  plan_label: string
  is_founding: boolean
  founding_locked_price_usd: number | null
  monthly_tasks_used: number
  monthly_tasks_limit: number
  active_departments: number
  department_limit: number
  active_agents_today: number
  team_members: number
  connected_integrations: number
  briefings_saved: number
  conversations_total: number
  pipeline_leads_today: number
  coordination_events_24h: number
}

export async function fetchOrgMetrics(orgId: string): Promise<OrgMetricsSnapshot> {
  const supabase = await createServerSupabaseClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: org } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', orgId)
    .single()

  const plan = org?.plan || 'free'
  const isFounding = (await isOrgFoundingMember(orgId)) || plan === 'founding_builder'
  const limits = getPlanLimits(plan)

  const [monthlyTasks, activeDepts, convRes, deptRes, salesConvRes] = await Promise.all([
    countMonthlyAgentTasks(orgId),
    countActiveDepartments(orgId),
    supabase.from('conversations').select('id').eq('org_id', orgId),
    supabase.from('departments').select('id').eq('org_id', orgId),
    supabase.from('conversations').select('id').eq('org_id', orgId).eq('department_key', 'sales'),
  ])

  const convIds = convRes.data?.length ? convRes.data.map((c) => c.id) : ['00000000-0000-0000-0000-000000000000']
  const deptIds = deptRes.data?.length ? deptRes.data.map((d) => d.id) : ['00000000-0000-0000-0000-000000000000']
  const salesConvIds = salesConvRes.data?.length ? salesConvRes.data.map((c) => c.id) : ['00000000-0000-0000-0000-000000000000']

  const [
    activeAgentsResult,
    teamResult,
    integrationsResult,
    briefingsResult,
    pipelineResult,
    coordResult,
  ] = await Promise.all([
    supabase
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .in('status', ['active', 'busy'])
      .in('department_id', deptIds),
    supabase.from('org_members').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('integrations').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('created_at', today.toISOString())
      .in('conversation_id', salesConvIds),
    supabase
      .from('coordination_events')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', last24h),
  ])

  return {
    plan,
    plan_label: displayPlanLabel(plan, isFounding),
    is_founding: isFounding,
    founding_locked_price_usd: isFounding ? 19 : null,
    monthly_tasks_used: monthlyTasks,
    monthly_tasks_limit: limits.monthly_briefs,
    active_departments: activeDepts,
    department_limit: limits.departments,
    active_agents_today: activeAgentsResult.count ?? 0,
    team_members: teamResult.count ?? 0,
    connected_integrations: integrationsResult.count ?? 0,
    briefings_saved: briefingsResult.count ?? 0,
    conversations_total: convRes.data?.length ?? 0,
    pipeline_leads_today: pipelineResult.count ?? 0,
    coordination_events_24h: coordResult.count ?? 0,
  }
}

export function formatOrgMetricsForPrompt(metrics: OrgMetricsSnapshot): string {
  return `
ORG ANALYTICS (live — use for company performance questions):
- Plan: ${metrics.plan_label}
- Monthly agent tasks: ${metrics.monthly_tasks_used} / ${metrics.monthly_tasks_limit}
- Active departments: ${metrics.active_departments} / ${metrics.department_limit}
- Team members: ${metrics.team_members}
- Connected integrations: ${metrics.connected_integrations}
- Briefings in vault: ${metrics.briefings_saved}
- Conversations: ${metrics.conversations_total}
- Sales pipeline (approved today): ${metrics.pipeline_leads_today}
- Cross-dept coordination (24h): ${metrics.coordination_events_24h}
- Active agents now: ${metrics.active_agents_today}
`.trim()
}
