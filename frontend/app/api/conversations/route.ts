'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, department_key, created_at, updated_at,
      agents (id, name, icon, acronym, role_description)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return NextResponse.json({ conversations })
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { agent_id, department_key } = await request.json()
  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No organisation found' }, { status: 404 })

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({ org_id: member.org_id, user_id: user.id, agent_id, department_key })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ conversation })
}
