import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  const orgId = member.org_id
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Run all stat queries in parallel
  const [
    tasksResult,
    activeAgentsResult,
    coordResult,
    pipelineResult,
    lastCoordResult,
  ] = await Promise.all([

    // Tasks today — messages sent by agents today
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_type', 'agent')
      .gte('created_at', today.toISOString())
      .in(
        'conversation_id',
        supabase.from('conversations').select('id').eq('org_id', orgId)
      ),

    // Active agents — agents with status 'active' or 'busy'
    supabase
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .in('status', ['active', 'busy'])
      .in(
        'department_id',
        supabase.from('departments').select('id').eq('org_id', orgId)
      ),

    // Coordination events in last 24h
    supabase
      .from('coordination_events')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', last24h),

    // Pipeline leads — count of approved messages in Sales dept today
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('created_at', today.toISOString())
      .in(
        'conversation_id',
        supabase
          .from('conversations')
          .select('id')
          .eq('org_id', orgId)
          .eq('department_key', 'sales')
      ),

    // Last coordination — for the "Last: X → Y" label
    supabase
      .from('coordination_events')
      .select(`
        id,
        from_agent:agents!from_agent_id(name),
        to_agent:agents!to_agent_id(name)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const lastCoord = lastCoordResult.data
  const lastCoordLabel = lastCoord
    ? `Last: ${(lastCoord.from_agent as any)?.name} → ${(lastCoord.to_agent as any)?.name}`
    : 'No events yet'

  return NextResponse.json({
    tasks_today: tasksResult.count ?? 0,
    active_agents: activeAgentsResult.count ?? 0,
    pipeline_leads: pipelineResult.count ?? 0,
    coordination_events: coordResult.count ?? 0,
    coordination_label: lastCoordLabel,
  })
}
