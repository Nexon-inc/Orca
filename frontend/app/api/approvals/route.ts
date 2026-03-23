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
    .from('approval_requests')
    .select(`
      id, context, urgency, status, version, created_at,
      target_department_key,
      agents:initiated_by_agent_id (name, icon, acronym),
      profiles:initiated_by_user_id (full_name)
    `)
    .eq('org_id', member.org_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (member.role === 'head' && member.department_key) {
    query = query.eq('target_department_key', member.department_key)
  }

  const { data: approvals } = await query

  return NextResponse.json({ approvals })
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { context, urgency, target_department_key, target_agent_id } = await request.json()
  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organisation found' }, { status: 404 })

  const { data: approval, error } = await supabase
    .from('approval_requests')
    .insert({
      org_id: member.org_id,
      initiated_by_user_id: user.id,
      context,
      urgency: urgency ?? 'info',
      target_department_key: target_department_key ?? null,
      target_agent_id: target_agent_id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ approval })
}
