import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const plan = searchParams.get('plan')

  const supabase = await createServerSupabaseClient()

  // Get user's plan to show what's accessible
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, organizations(plan)')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  const orgId = member.org_id
  const orgPlan = (member.organizations as any)?.plan || 'free'

  // Build templates query
  let query = supabase
    .from('orcahub_templates')
    .select('id, slug, name, description, category, tags, plan_required, installs, preview_image_url, author')
    .eq('published', true)
    .order('installs', { ascending: false }) // most popular first

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (plan && plan !== 'all') {
    query = query.eq('plan_required', plan)
  }

  const { data: templates } = await query

  // Get which templates this org has already installed
  const { data: installs } = await supabase
    .from('orcahub_installs')
    .select('template_id')
    .eq('org_id', orgId)

  const installedIds = new Set((installs || []).map(i => i.template_id))

  // Mark plan accessibility and install status
  const PLAN_ORDER = ['none', 'free', 'starter', 'pro', 'enterprise']
  const enriched = (templates || []).map(t => ({
    ...t,
    is_installed: installedIds.has(t.id),
    is_accessible: PLAN_ORDER.indexOf(orgPlan) >= PLAN_ORDER.indexOf(t.plan_required),
  }))

  return NextResponse.json({
    templates: enriched,
    org_plan: orgPlan,
  })
}
