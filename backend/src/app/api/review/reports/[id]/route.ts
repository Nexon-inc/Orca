import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  // Verify CEO/Owner role
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Only Owners or Co-founders can acknowledge reports.' }, { status: 403 })
  }

  const { data: report, error } = await supabase
    .from('dept_reports')
    .update({ 
      acknowledged_by_ceo: true,
      acknowledged_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('org_id', member.org_id)
    .select()
    .single()

  if (error || !report) return NextResponse.json({ error: 'Failed to acknowledge report' }, { status: 400 })

  return NextResponse.json({ report })
}
