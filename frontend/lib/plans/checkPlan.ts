// lib/plans/checkPlan.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPlanLimits, canAccessFeature } from './limits'

export async function checkDepartmentAccess(
  orgId: string,
  plan: string
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const supabase = await createServerSupabaseClient()
  const limit = getPlanLimits(plan).departments

  const { count } = await supabase
    .from('departments')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('agents_paused', false)

  return {
    allowed: (count ?? 0) < limit,
    limit,
    current: count ?? 0,
  }
}

/**
 * Checks if unpausing a department is allowed under the current plan
 */
export async function canUnpauseDepartment(
  orgId: string,
  plan: string
): Promise<boolean> {
  const { allowed } = await checkDepartmentAccess(orgId, plan)
  return allowed
}

export async function checkAgentAccess(
  orgId: string,
  plan: string,
  departmentKey: string
): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  // Check the department is active for this org
  const { data: dept } = await supabase
    .from('departments')
    .select('id, agents_paused')
    .eq('org_id', orgId)
    .eq('key', departmentKey)
    .single()

  return !!dept && !dept.agents_paused
}

export async function checkFeatureAccess(
  plan: string,
  feature: string
): Promise<boolean> {
  return canAccessFeature(plan, feature as any)
}
