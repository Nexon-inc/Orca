import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentNameOrAcronym } = await params
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')

  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 })

  const supabase = createServiceSupabaseClient()

  // 1. Find the agent ID using flexible name/acronym match
  const { data: agents } = await supabase
    .from('agents')
    .select('id')
    .or(`name.ilike.%${agentNameOrAcronym}%,acronym.ilike.${agentNameOrAcronym}`)
    .limit(1)

  const agent = agents?.[0]
  if (!agent) return NextResponse.json({ conversationId: null }, { status: 200 })

  // 2. Find the latest conversation for this agent in this org
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('org_id', orgId)
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const conversation = conversations?.[0]
  return NextResponse.json({ conversationId: conversation?.id || null }, { status: 200 })
}
