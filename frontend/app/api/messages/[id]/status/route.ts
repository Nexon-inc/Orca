import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: messageId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await request.json()
  const supabase = await createServerSupabaseClient()

  // Verify ownership via conversation
  const { data: message } = await supabase
    .from('messages')
    .select('conversation_id, conversations(user_id)')
    .eq('id', messageId)
    .single()

  if (!message || (message as any).conversations?.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('messages')
    .update({ status })
    .eq('id', messageId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
