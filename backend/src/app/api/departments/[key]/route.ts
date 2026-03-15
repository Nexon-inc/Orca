import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { key: string } }
) {
  const { key } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { agent_mode, head_user_id, agents_paused } = await request.json()
  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updates: Record<string, any> = {}
  if (agent_mode !== undefined) updates.agent_mode = agent_mode
  if (head_user_id !== undefined) updates.head_user_id = head_user_id
  if (agents_paused !== undefined) updates.agents_paused = agents_paused

  const { data: department, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('org_id', member.org_id)
    .eq('key', key)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ department })
}
