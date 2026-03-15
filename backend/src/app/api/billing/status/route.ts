import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(name, plan, plan_expires_at, paystack_subscription_code)')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const org = Array.isArray(member.organizations) ? member.organizations[0] : member.organizations
  
  return NextResponse.json({
    plan: org?.plan,
    expires_at: org?.plan_expires_at,
    has_active_subscription: !!org?.paystack_subscription_code,
  })
}
