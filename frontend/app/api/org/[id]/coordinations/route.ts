import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orgId = params.id
  const supabase = createServiceSupabaseClient()

  const { data: coordinations, error } = await supabase
    .from('coordination_events')
    .select(`
      *,
      to_agent:agents!to_agent_id(id, name, acronym),
      from_agent:agents!from_agent_id(id, name, acronym)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(15)

  if (error) {
    console.error('[COORDINATION_API_ERR]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coordinations: coordinations || [] })
}
