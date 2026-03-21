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

  // Step 1 — company identity fields
  if (step === 1) {
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

  // Step 2 — department activation + agent mode
  if (step === 2) {
    // If template was chosen, departments are already seeded
    // If manual, activate selected departments
    if (data.selected_departments && !data.template_slug) {
      for (const deptKey of data.selected_departments) {
        await supabase
          .from('departments')
          .update({ agents_paused: false })
          .eq('org_id', orgId)
          .eq('key', deptKey)
      }
      // Pause departments NOT selected on Free/Starter plans
      await supabase
        .from('departments')
        .update({ agents_paused: true })
        .eq('org_id', orgId)
        .not('key', 'in', `(${data.selected_departments.map((d: string) => `'${d}'`).join(',')})`)
    }
  }

  // Step 3 — operating mode
  if (step === 3) {
    await supabase
      .from('departments')
      .update({ agent_mode: data.agent_mode })
      .eq('org_id', orgId)
      .eq('agents_paused', false)
  }

  // Step 5 — mark onboarding complete
  if (step === 5) {
    await supabase
      .from('organizations')
      .update({
        onboarding_completed: true,
        onboarding_step: 5,
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
