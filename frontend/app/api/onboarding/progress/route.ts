import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { step, data } = await request.json()
  const supabase = await createServerSupabaseClient()

  // Get org id
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  const orgId = member.org_id

  // Step 0 — plan selection
  if (step === 0) {
    await supabase
      .from('organizations')
      .update({ plan: data.selected_plan || 'starter' })
      .eq('id', orgId)
  }

  // Step 2 — company identity fields (shifted from 1)
  if (step === 2) {
    await supabase.from('company_identity').upsert({
      org_id: orgId,
      company_name: data.company_name,
      mission: data.mission,
      brand_voice: data.brand_voice,
      icp: data.icp,
      industry: data.industry,
      stage: data.stage,
      geography: data.geography,
      competitors: data.competitors || [],
    }, { onConflict: 'org_id' })

    // Also update org name
    await supabase
      .from('organizations')
      .update({ name: data.company_name })
      .eq('id', orgId)
  }

  // Step 3 — department activation + agent mode (shifted from 2)
  if (step === 3) {
    // If template was chosen, departments are already seeded
    // If manual, activate selected departments
    if (data.selected_departments && !data.template_slug) {
      // First, pause all departments for this org to reset
      await supabase
        .from('departments')
        .update({ agents_paused: true })
        .eq('org_id', orgId)

      // Then activate selected ones
      for (const deptKey of data.selected_departments) {
        await supabase
          .from('departments')
          .update({ agents_paused: false })
          .eq('org_id', orgId)
          .eq('key', deptKey)
      }
    }
  }

  // Step 4 — operating mode (shifted from 3)
  if (step === 4) {
    await supabase
      .from('departments')
      .update({ agent_mode: data.agent_mode })
      .eq('org_id', orgId)
      .eq('agents_paused', false)
  }

  // Step 6 — mark onboarding complete (shifted from 5)
  if (step === 6) {
    await supabase
      .from('organizations')
      .update({
        onboarding_completed: true,
        onboarding_step: 6,
      })
      .eq('id', orgId)
  }

  // Always save current step progress
  await supabase
    .from('organizations')
    .update({ onboarding_step: step + 1 })
    .eq('id', orgId)

  return NextResponse.json({ saved: true, next_step: step + 1 })
}
