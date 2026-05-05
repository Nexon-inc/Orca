import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const agentNameOrAcronym = params.id
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')

  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 })

  const supabase = createServiceSupabaseClient()

  // 1. Find the agent ID
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .or(`name.eq.${agentNameOrAcronym},acronym.eq.${agentNameOrAcronym}`)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // 2. Find the latest conversation for this agent in this org
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('id')
    .eq('org_id', orgId)
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !conversation) return NextResponse.json({ conversationId: null })

  return NextResponse.json({ conversationId: conversation.id })
}
