'use server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { token, email, platform } = await request.json()

  if (!token || !email) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TODO: Replace the URL below with John's actual partner verification endpoint
  // from his full API documentation before going live with any partner platform.
  // ─────────────────────────────────────────────────────────────────────────
  const verification = await fetch('https://their-api.com/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!verification.ok) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Use the service role client — admin operations require bypassing RLS
  const supabase = createServiceSupabaseClient()

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    // Existing user — generate a magic link and sign them straight into the dashboard
    const { data } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` },
    })
    return NextResponse.json({ redirect_url: data?.properties?.action_link })
  }

  // New user — create a verified account with Starter trial + full org seed
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true, // skip email verification — token is already verified above
  })

  if (createError || !newUser.user) {
    console.error('[magic-login] Failed to create user:', createError)
    return NextResponse.json({ error: 'Could not create user' }, { status: 500 })
  }

  const userId = newUser.user.id
  const displayName = email.split('@')[0]

  // Create profile
  await supabase.from('profiles').insert({
    id: userId,
    email,
    full_name: displayName,
  })

  // Create org on Starter plan (trial entry point from partner platform)
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: `${displayName}'s Company`,
      owner_id: userId,
      plan: 'starter',
    })
    .select()
    .single()

  if (orgError || !org) {
    console.error('[magic-login] Failed to create org:', orgError)
    return NextResponse.json({ error: 'Could not create organization' }, { status: 500 })
  }

  // Add as owner + seed all 9 departments and 45 agents
  await supabase.from('org_members').insert({ org_id: org.id, user_id: userId, role: 'owner' })
  await supabase.from('company_identity').insert({ org_id: org.id })

  try {
    const { seedNewOrg } = await import('@/lib/seed/seedOrg')
    await seedNewOrg(org.id)
  } catch (err) {
    console.error('[magic-login] Seeding failed (non-fatal):', err)
  }

  // Generate magic link — route new SSO users through onboarding first
  const { data } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding` },
  })

  return NextResponse.json({ redirect_url: data?.properties?.action_link })
}
