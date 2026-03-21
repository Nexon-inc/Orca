import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 30)

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organization found' }, { status: 404 })

  const { data: events } = await supabase
    .from('coordination_events')
    .select(`
      id,
      type,
      description,
      status,
      auto_approved,
      created_at,
      from_agent:agents!from_agent_id(name, icon, acronym),
      to_agent:agents!to_agent_id(name, icon, acronym)
    `)
    .eq('org_id', member.org_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Shape for the coordination feed UI component
  const feed = (events || []).map(e => ({
    id: e.id,
    type: e.type,                           // 'handoff' | 'alert' | 'trigger' | 'brief'
    description: e.description,
    status: e.status,                       // 'pending' | 'approved' | 'complete'
    auto_approved: e.auto_approved,
    created_at: e.created_at,
    from_agent: {
      name: (e.from_agent as any)?.name || 'Unknown',
      icon: (e.from_agent as any)?.icon || '⬡',
    },
    to_agent: {
      name: (e.to_agent as any)?.name || 'Unknown',
      icon: (e.to_agent as any)?.icon || '⬡',
    },
  }))

  return NextResponse.json({ feed })
}
