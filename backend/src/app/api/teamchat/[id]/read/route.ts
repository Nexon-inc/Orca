import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: messageId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  // Ensure message exists and belongs to this user
  const { data: message } = await supabase
    .from('team_messages')
    .select('to_user_id')
    .eq('id', messageId)
    .single()

  if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  if (message.to_user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: updatedMessage, error } = await supabase
    .from('team_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ message: updatedMessage })
}
