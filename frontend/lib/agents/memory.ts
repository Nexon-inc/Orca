import { createServiceSupabaseClient } from '@/lib/supabase/server'

/**
 * Retrieves agent-specific memory for a company.
 * This can include previous results, directives, or summarized knowledge.
 */
export async function getAgentMemory(agentId: string, orgId: string): Promise<string> {
  const supabase = createServiceSupabaseClient()

  // For now, let's pull the last 5 successful results from this agent in this org
  const { data: messages } = await supabase
    .from('messages')
    .select('content, result_items, created_at')
    .eq('conversation_id', (
       await supabase.from('conversations').select('id').eq('org_id', orgId).eq('agent_id', agentId)
    )) // This subquery approach is just conceptual, let's do it properly.
    .limit(5)

  // Better approach: Get latest messages from all conversations in this org for this agent
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('content, result_items, created_at, conversations!inner(agent_id, org_id)')
    .eq('conversations.org_id', orgId)
    .eq('conversations.agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!recentMessages || recentMessages.length === 0) return 'No previous memory of operations for this company.'

  const memoryParts = recentMessages
    .filter(m => m.result_items && m.result_items.length > 0)
    .map(m => `- [${new Date(m.created_at).toLocaleDateString()}]: ${m.result_items?.join(', ')}`)
    .join('\n')

  return `RELEVANT HISTORICAL CONTEXT / MEMORY:\n${memoryParts || 'The agent has performed operations but no specific results were logged in memory yet.'}`
}
