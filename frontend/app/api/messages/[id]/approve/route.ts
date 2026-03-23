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

  // 1. Verify user owns the conversation this message belongs to
  const { data: message, error } = await supabase
    .from('messages')
    .select('id, conversations!inner(user_id)')
    .eq('id', id)
    .single()

  if (error || !message) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  if (message.conversations.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Mark as approved
  const { data: updatedMessage } = await supabase
    .from('messages')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .single()

  // Note: Actual Composio execution might be triggered here automatically 
  // depending on frontend payloads or an Inngest background job.

  return NextResponse.json({ message: updatedMessage })
}
