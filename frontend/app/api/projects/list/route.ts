'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  // Get all organizations the user is a member of
  const { data: memberships } = await supabase
    .from('org_members')
    .select(`
      role, department_key,
      organizations (
        id, name, plan, created_at,
        departments (count),
        agents (count)
      )
    `)
    .eq('user_id', user.id)

  const projects = memberships?.map((m: any) => ({
    id: m.organizations.id,
    name: m.organizations.name,
    role: m.role,
    plan: m.organizations.plan,
    created_at: m.organizations.created_at,
    deptCount: m.organizations.departments?.[0]?.count || 0,
    agentCount: m.organizations.agents?.[0]?.count || 0
  })) || []

  return NextResponse.json({ projects })
}
