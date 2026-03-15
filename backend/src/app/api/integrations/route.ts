import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, department_key')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let query = supabase
    .from('integrations')
    .select('id, service_name, department_key, status, connected_at, metadata')
    // NEVER select access_token_encrypted or refresh_token_encrypted
    .eq('org_id', member.org_id)

  // Scope to dept if head or member — never expose other dept integrations
  if (['head', 'member'].includes(member.role) && member.department_key) {
    query = query.eq('department_key', member.department_key)
  }

  const { data: integrations } = await query

  return NextResponse.json({ integrations })
}
