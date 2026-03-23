import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: targetUserId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  // Verify the target user is in the same org
  const { data: member1 } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  const { data: member2 } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', targetUserId)
    .single()

  if (!member1 || !member2 || member1.org_id !== member2.org_id) {
    return NextResponse.json({ error: 'Cannot access this user' }, { status: 403 })
  }

  const { data: messages } = await supabase
    .from('team_messages')
    .select('*')
    .eq('org_id', member1.org_id)
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${targetUserId}),and(from_user_id.eq.${targetUserId},to_user_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages })
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: targetUserId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await request.json()
  const supabase = await createServerSupabaseClient()

  // Verify same org
  const { data: member1 } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  const { data: member2 } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', targetUserId)
    .single()

  if (!member1 || !member2 || member1.org_id !== member2.org_id) {
    return NextResponse.json({ error: 'Cannot message this user' }, { status: 403 })
  }

  const { data: message, error } = await supabase
    .from('team_messages')
    .insert({
      org_id: member1.org_id,
      from_user_id: user.id,
      to_user_id: targetUserId,
      content,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ message })
}
