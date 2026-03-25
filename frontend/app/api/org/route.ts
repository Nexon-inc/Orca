'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select(`
      role, department_key, joined_at,
      organizations (
        id, name, plan, plan_expires_at,
        onboarding_completed, onboarding_step,
        paystack_customer_code, paystack_subscription_code,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organisation found' }, { status: 404 })

  // Also fetch the user's display name from profiles (if table exists) or fall back to auth metadata
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const profile = {
    full_name: profileRow?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
    email: user.email || '',
    avatar_url: profileRow?.avatar_url || '',
  }

  return NextResponse.json({ member, profile })
}

export async function PUT(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json()
  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('organizations')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', member.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { onboarding_step, onboarding_completed } = await request.json()
  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updateData: any = { updated_at: new Date().toISOString() }
  if (onboarding_step !== undefined) updateData.onboarding_step = onboarding_step
  if (onboarding_completed !== undefined) updateData.onboarding_completed = onboarding_completed

  const { error } = await supabase
    .from('organizations')
    .update(updateData)
    .eq('id', member.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
