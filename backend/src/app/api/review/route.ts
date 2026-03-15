import { NextResponse } from 'next/server'
import { getAuthUser, requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder', 'head'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get pending approvals
  const { data: approvals } = await supabase
    .from('approval_requests')
    .select('*, profiles!initiated_by_user_id(email, full_name), agents!initiated_by_agent_id(name, acronym), target_agent:agents!target_agent_id(name, acronym)')
    .eq('org_id', member.org_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Get pending active reports (unacknowledged)
  const { data: reports } = await supabase
    .from('dept_reports')
    .select('*')
    .eq('org_id', member.org_id)
    .eq('acknowledged_by_ceo', false)
    .order('created_at', { ascending: false })

  // Get recent coordination logs
  const { data: coordination } = await supabase
    .from('coordination_events')
    .select('*, from_agent:agents!from_agent_id(name), to_agent:agents!to_agent_id(name)')
    .eq('org_id', member.org_id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({
    approvals,
    reports,
    coordination,
  })
}
