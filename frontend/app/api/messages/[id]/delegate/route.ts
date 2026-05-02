import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: messageId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const serviceClient = createServiceSupabaseClient()
    
    // 1. Fetch the message and its directives
    const { data: message, error: msgError } = await serviceClient
      .from('messages')
      .select('*, conversations(*)')
      .eq('id', messageId)
      .single()

    if (msgError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const orgId = message.conversations.org_id
    const conversationId = message.conversation_id
    const directives = message.result_items || []

    if (directives.length === 0) {
      return NextResponse.json({ error: 'No directives to delegate' }, { status: 400 })
    }

    // 2. Trigger delegation event for each executive mentioned in the directives
    // We'll also send a general 'agent/handoff.broadcast' for the whole team
    await inngest.send({
      name: 'agent/handoff.broadcast',
      data: {
        org_id: orgId,
        conversation_id: conversationId,
        source_message_id: messageId,
        directives: directives,
        approved_by: user.id
      }
    })

    // 3. Update message status
    await serviceClient
      .from('messages')
      .update({ status: 'delegated', metadata: { ...message.metadata, delegated_at: new Date().toISOString() } })
      .eq('id', messageId)

    return NextResponse.json({ success: true, count: directives.length })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Error', details: err.message }, { status: 500 })
  }
}
