'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, department_key')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let query = supabase
    .from('departments')
    .select(`
      id, key, name, icon, agent_mode, agents_paused, created_at,
      head_user_id,
      profiles:head_user_id (full_name, avatar_initials)
    `)
    .eq('org_id', member.org_id)

  if (['head', 'member'].includes(member.role) && member.department_key) {
    query = query.eq('key', member.department_key)
  }

  const { data: departments } = await query

  return NextResponse.json({ departments })
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, name, icon } = await request.json()
  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: dept, error } = await supabase
    .from('departments')
    .insert({ org_id: member.org_id, key, name, icon })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ department: dept })
}
