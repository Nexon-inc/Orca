import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: memberships } = await supabase
    .from('org_members')
    .select('role, organizations(id, name, plan)')
    .eq('user_id', user.id)

  const orgs = memberships?.map((m: any) => ({
    id: m.organizations.id,
    name: m.organizations.name,
    plan: m.organizations.plan,
    role: m.role
  })) || []

  return NextResponse.json({ organizations: orgs })
}
