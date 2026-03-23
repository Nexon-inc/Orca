import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { validateIntegrationToken } from '@/lib/agents/validateToken'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { service: string } }
) {
  const { service } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { valid, error } = await validateIntegrationToken(member.org_id, service)

  return NextResponse.json({ connected: valid, error })
}
