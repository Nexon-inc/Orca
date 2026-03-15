import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function verifyOrgAccess(
  userId: string,
  orgId: string,
  requiredRoles?: string[]
) {
  const supabase = await createServerSupabaseClient()

  const { data: member, error } = await supabase
    .from('org_members')
    .select('role, department_key, organizations(plan, id)')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .single()

  if (error || !member) {
    throw new Error('Access denied — not a member of this organisation')
  }

  if (requiredRoles && !requiredRoles.includes(member.role)) {
    throw new Error(`Access denied — requires role: ${requiredRoles.join(' or ')}`)
  }

  return member
}
