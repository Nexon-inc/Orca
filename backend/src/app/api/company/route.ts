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
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organisation found' }, { status: 404 })

  const { data: identity } = await supabase
    .from('company_identity')
    .select('*')
    .eq('org_id', member.org_id)
    .single()

  return NextResponse.json({ identity })
}

export async function PUT(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const allowedFields = [
    'company_name', 'industry', 'stage', 'mission', 'brand_voice',
    'icp', 'geography', 'competitors', 'brand_colors', 'logo_url',
    'knowledge_base_url', 'crm_connected',
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  const { error } = await supabase
    .from('company_identity')
    .update(updates)
    .eq('org_id', member.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
