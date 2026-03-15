import { decryptToken } from '@/lib/security/encrypt'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkAgentRateLimit, incrementAgentActionCount } from '@/lib/security/agentLimits'

export async function executeAgentAction(
  messageId: string,
  agentId: string,
  orgId: string,
  action: () => Promise<void>
) {
  const supabase = await createServerSupabaseClient()

  // 1. Verify message is actually approved — check DB, not just frontend state
  const { data: message } = await supabase
    .from('messages')
    .select('status, conversation_id')
    .eq('id', messageId)
    .single()

  if (!message) throw new Error('Message not found')
  if (message.status !== 'approved') {
    throw new Error('Cannot execute — message not approved')
  }

  // 2. Verify the conversation belongs to this org
  const { data: conversation } = await supabase
    .from('conversations')
    .select('org_id')
    .eq('id', message.conversation_id)
    .single()

  if (conversation?.org_id !== orgId) {
    throw new Error('Org mismatch — execution blocked')
  }

  // 3. Check agent rate limit
  const withinLimit = await checkAgentRateLimit(agentId)
  if (!withinLimit) {
    throw new Error('Agent daily action limit reached')
  }

  // 4. Execute the action
  await action()

  // 5. Increment action counter
  await incrementAgentActionCount(agentId)
}
