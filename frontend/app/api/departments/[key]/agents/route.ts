import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  const { key } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, department_key')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Validate visibility
  const canView = ['owner', 'cofounder'].includes(member.role) || member.department_key === key
  if (!canView) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Find department ID first
  const { data: dept } = await supabase
    .from('departments')
    .select('id')
    .eq('org_id', member.org_id)
    .eq('key', key)
    .single()

  if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 })

  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .eq('department_id', dept.id)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ agents })
}
