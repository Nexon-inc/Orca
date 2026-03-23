import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  // Verify access implicitly through RLS by making sure user is in org
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, department_key')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: agent, error } = await supabase
    .from('agents')
    .select('*, departments!inner(key)')
    .eq('id', id)
    .single()

  if (error || !agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  return NextResponse.json({ agent })
}
