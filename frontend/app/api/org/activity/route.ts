import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, department_key')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  const orgId = member.org_id

  // Get recent agent messages with agent + dept context
  // For heads/members — scope to their department only
  let convQuery = supabase
    .from('conversations')
    .select('id, department_key')
    .eq('org_id', orgId)

  if (['head', 'member'].includes(member.role) && member.department_key) {
    convQuery = convQuery.eq('department_key', member.department_key)
  }

  const { data: conversations } = await convQuery
  const convIds = (conversations || []).map(c => c.id)

  if (convIds.length === 0) {
    return NextResponse.json({ activity: [] })
  }

  // Get recent agent messages
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      conversation_id,
      conversations!inner(
        department_key,
        agents!inner(
          name,
          icon,
          acronym
        )
      )
    `)
    .eq('sender_type', 'agent')
    .eq('status', 'approved')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Shape the response for the activity feed UI
  const activity = (messages || []).map(msg => {
    const conv = msg.conversations as any
    const agent = conv?.agents
    return {
      id: msg.id,
      agent_name: agent?.name || 'Agent',
      agent_icon: agent?.icon || '⬡',
      agent_acronym: agent?.acronym || '??',
      department: conv?.department_key || 'unknown',
      action: msg.content.length > 120 ? msg.content.slice(0, 117) + '...' : msg.content,
      created_at: msg.created_at,
      status: 'active',
    }
  })

  return NextResponse.json({ activity })
}
