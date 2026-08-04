import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params
  const supabase = createServiceSupabaseClient()

  let { data: coordinations, error } = await supabase
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
    // Fallback if foreign key join fails
    const fallback = await supabase
      .from('coordination_events')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(15)

    coordinations = fallback.data || []
  }

  return NextResponse.json({ coordinations: coordinations || [] }, { status: 200 })
}
