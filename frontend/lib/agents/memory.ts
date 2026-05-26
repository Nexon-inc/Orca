import { createServiceSupabaseClient } from '@/lib/supabase/server'

/**
 * Retrieves agent-specific memory for a company.
 * This combines long-term compacted Markdown memory with recent operational history.
 */
export async function getAgentMemory(agentId: string, orgId: string): Promise<string> {
  const supabase = createServiceSupabaseClient()

  // 1. Fetch long-term compacted Markdown memory
  const { data: dbMemory } = await supabase
    .from('llm_memories')
    .select('memory_data')
    .eq('org_id', orgId)
    .eq('agent_id', agentId)
    .maybeSingle()

  const compactSummary = (dbMemory as any)?.memory_data?.context_summary || ''

  // 2. Fetch recent operational events (short-term history)
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('content, result_items, created_at, conversations!inner(agent_id, org_id)')
    .eq('conversations.org_id', orgId)
    .eq('conversations.agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(10)

  const memoryParts = recentMessages
    ? recentMessages
        .filter(m => m.result_items && m.result_items.length > 0)
        .map(m => `- **[${new Date(m.created_at).toLocaleDateString()}]**: ${m.result_items?.join(', ')}`)
        .join('\n')
    : ''

  let markdownMemory = '### 🧠 AGENT EXECUTIVE BRAIN / MEMORY\n\n'

  if (compactSummary) {
    markdownMemory += `#### 📌 Long-Term Context Summary:\n${compactSummary}\n\n`
  }

  if (memoryParts) {
    markdownMemory += `#### 📝 Recent Key Operational Outcomes:\n${memoryParts}\n`
  }

  if (!compactSummary && !memoryParts) {
    markdownMemory += 'No previous operations logged for this organization yet. Ready to build context!\n'
  }

  return markdownMemory
}
