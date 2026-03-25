'use server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { sendVerificationEmail } from '@/lib/email/gmail'
import { NextResponse } from 'next/server'

const MASTER_ADMIN_EMAIL = 'nexonicindustries@gmail.com'

export async function POST(request: Request) {
  const { email, password, full_name, org_name } = await request.json()

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const orgName = org_name || `${full_name}'s Company`

  // Use the admin client exclusively — admin.createUser() does NOT auto-send
  // Supabase's default verification email, preventing the double-email bug.
  const adminSupabase = createServiceSupabaseClient()

  // 1. Create auth user — email_confirm: false so we handle the email ourselves
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const userId = authData.user.id

  // 2. Create profile
  await adminSupabase.from('profiles').insert({ id: userId, email, full_name })

  // 3. Create organisation — grant instant enterprise to master admin
  const isAdmin = email.toLowerCase().trim() === MASTER_ADMIN_EMAIL
  const { data: org, error: orgError } = await adminSupabase
    .from('organizations')
    .insert({
      name: orgName,
      owner_id: userId,
      plan: isAdmin ? 'enterprise' : 'starter',
      plan_expires_at: isAdmin ? new Date('2124-01-01T00:00:00Z').toISOString() : null,
    })
    .select()
    .single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 400 })

  // 4. Add as owner member + seed company identity
  await adminSupabase.from('org_members').insert({ org_id: org.id, user_id: userId, role: 'owner' })
  await adminSupabase.from('company_identity').insert({ org_id: org.id })

  // 5. Seed all 9 departments and 45 agents
  try {
    const { seedNewOrg } = await import('@/lib/seed/seedOrg')
    await seedNewOrg(org.id)
  } catch (err) {
    console.error('[Signup] Seeding failed (non-fatal):', err)
  }

  // 6. Generate ONE verification link pointing back through our auth callback
  //    The ?next=/onboarding param tells /auth/callback to redirect there after verification
  try {
    const { data: linkData } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')}/auth/callback?next=/onboarding`,
        },
    })

    if (linkData?.properties?.hashed_token) {
      const { sendWelcomeEmail, sendVerificationEmail } = await import('@/lib/email/gmail')
      
      // Build the DIRECT link to our app — bypasses the Supabase internal verify page
      const directLink = `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=signup&next=/onboarding`
      
      // Send Welcome Email FIRST
      await sendWelcomeEmail(email, full_name)
      
      // Send Verification Link SECOND
      await sendVerificationEmail(email, full_name, directLink)
    }
  } catch (e) {
    console.error('[Signup] Email sending failed (non-fatal):', e)
  }

  return NextResponse.json({ success: true })
}
