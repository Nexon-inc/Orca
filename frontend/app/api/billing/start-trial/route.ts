import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan: rawPlan } = await request.json()
  const plan = rawPlan?.toLowerCase() === 'builder' ? 'starter' : rawPlan?.toLowerCase()
  if (!plan) return NextResponse.json({ error: 'Plan is required' }, { status: 400 })

  const supabase = await createServerSupabaseClient()

  // Get org id where user is owner
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (!member) return NextResponse.json({ error: 'Only owners can start trials' }, { status: 403 })

  if (plan !== 'free') {
    return NextResponse.json({ error: 'Free trials are disabled. Please subscribe to upgrade.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      plan: 'free',
      plan_expires_at: null
    })
    .eq('id', member.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, plan: 'free' })
}
