'use server'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { sendVerificationEmail } from '@/lib/email/gmail'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password, full_name, org_name } = await request.json()

  if (!email || !password || !full_name || !org_name) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()

  // 1. Create auth user with a redirect URL for email confirmation
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
    },
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const userId = authData.user!.id

  // 2. Create profile
  await supabase.from('profiles').insert({ id: userId, email, full_name })

  // 3. Create organisation — grant instant enterprise to master admin
  const MASTER_ADMIN_EMAIL = 'nexonicindustries@gmail.com'
  const isAdmin = email.toLowerCase().trim() === MASTER_ADMIN_EMAIL
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: org_name,
      owner_id: userId,
      plan: isAdmin ? 'enterprise' : 'free',
      // Admin gets a plan that expires in the year 2124 — effectively never
      plan_expires_at: isAdmin ? new Date('2124-01-01T00:00:00Z').toISOString() : null,
    })
    .select()
    .single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 400 })

  // 4. Add as owner member
  await supabase.from('org_members').insert({ org_id: org.id, user_id: userId, role: 'owner' })

  // 5. Create default company identity record
  await supabase.from('company_identity').insert({ org_id: org.id })

  // 6. Seed all 9 departments and 45 agents
  try {
    const { seedNewOrg } = await import('@/lib/seed/seedOrg');
    await seedNewOrg(org.id);
  } catch (err) {
    console.error('[Signup] Seeding failed:', err);
    // Non-fatal, signup continues
  }

  // 6. Optionally: generate admin link for branded email (works with Supabase admin API)
  try {
    const adminSupabase = createServiceSupabaseClient()
    const { data: linkData } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding` },
    })

    if (linkData?.properties?.action_link) {
      await sendVerificationEmail(email, full_name, linkData.properties.action_link)
    }
  } catch (e) {
    // Non-fatal — Supabase will still send its default verification email
    console.error('[Signup] Custom verification email failed, falling back to Supabase default:', e)
  }

  return NextResponse.json({ user: authData.user, org })
}

