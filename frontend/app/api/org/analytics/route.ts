import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { fetchOrgMetrics } from '@/lib/analytics/orgMetrics'
import { NextResponse } from 'next/server'

/** Full org analytics for dashboard and executive review */
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organization found' }, { status: 404 })

  const metrics = await fetchOrgMetrics(member.org_id)
  return NextResponse.json(metrics)
}
