import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: message, error } = await supabase
    .from('messages')
    .select('id, conversations!inner(user_id)')
    .eq('id', id)
    .single()

  if (error || !message) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  if (message.conversations.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: updatedMessage } = await supabase
    .from('messages')
    .update({ status: 'rejected' })
    .eq('id', id)
    .select()
    .single()

  return NextResponse.json({ message: updatedMessage })
}
