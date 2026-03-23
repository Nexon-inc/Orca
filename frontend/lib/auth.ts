import { createServerSupabaseClient } from './supabase/server'

export async function getAuthUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getOrgMember(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('org_members')
    .select('*, organizations(*)')
    .eq('user_id', userId)
    .single()
  return data
}

export async function getOrgMemberByOrgId(userId: string, orgId: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('org_members')
    .select('*, organizations(*)')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .single()
  return data
}

export async function requireRole(userId: string, orgId: string, roles: string[]) {
  const member = await getOrgMemberByOrgId(userId, orgId)
  if (!member || !roles.includes(member.role)) {
    throw new Error('Insufficient permissions')
  }
  return member
}
