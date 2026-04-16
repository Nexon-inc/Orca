import { inngest } from './client'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

// Send approval reminder after 2 hours of no action
export const approvalReminderFn = inngest.createFunction(
  { id: 'approval-reminder', name: 'Approval Reminder' },
  { event: 'approval/created' },
  async ({ event, step }) => {
    await step.sleep('wait-2h', '2h')

    const supabase = createServiceSupabaseClient()
    const approvalId = event.data.approval_id

    const { data: approval } = await supabase
      .from('approval_requests')
      .select('status, org_id, context, target_department_key')
      .eq('id', approvalId)
      .single()

    // Only send reminder if still pending
    if (approval?.status !== 'pending') return { skipped: true }

    // Get the department head to notify
    const { data: head } = await supabase
      .from('org_members')
      .select('profiles(email, full_name)')
      .eq('org_id', approval.org_id)
      .eq('department_key', approval.target_department_key ?? '')
      .eq('role', 'head')
      .single()

    console.log(`[Inngest] Approval ${approvalId} still pending — would send reminder to head`)

    return { reminded: true, approval_id: approvalId }
  }
)

// Agent status reset at end of each day
export const agentDailyResetFn = inngest.createFunction(
  { id: 'agent-daily-reset', name: 'Agent Daily Reset' },
  { cron: 'TZ=Africa/Nairobi 0 23 * * *' }, // 11pm Nairobi
  async ({ step }) => {
    const supabase = createServiceSupabaseClient()

    await step.run('reset-tasks-today', async () => {
      await supabase.from('agents').update({ tasks_today: 0, status: 'idle' }).neq('id', '')
    })

    return { reset: true }
  }
)

// Clean up expired OAuth states hourly
export const oauthStateCleanupFn = inngest.createFunction(
  { id: 'oauth-state-cleanup', name: 'OAuth State Cleanup' },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    const supabase = createServiceSupabaseClient()

    await step.run('delete-expired-states', async () => {
      await supabase.from('oauth_states').delete().lt('expires_at', new Date().toISOString())
    })

    return { cleaned: true }
  }
)

// Agent Coordination Logic (Phase 10)
export const agentCoordinationFn = inngest.createFunction(
  { id: 'agent-coordination', name: 'Agent Coordination' },
  { event: 'agent/coordination.requested' },
  async ({ event, step }) => {
    const { 
      org_id, 
      from_agent_id, 
      target_department_key, 
      target_agent_acronym, 
      reason, 
      context,
      conversation_id,
      depth = 0 
    } = event.data

    // CRITICAL: Max Depth logic (Phase 10)
    if (depth >= 3) {
      console.warn(`[Inngest] Coordination depth limit reached for org ${org_id}. Breaking loop.`)
      return { success: false, reason: 'max_depth_reached' }
    }

    const supabase = createServiceSupabaseClient()

    // 1. Check Concurrency Limit (Phase 12)
    const activeCount = await step.run('check-concurrency', async () => {
      const { data } = await supabase.rpc('get_active_coordination_count', { p_org_id: org_id })
      return data as number
    })

    const MAX_CONCURRENT_COORDINATIONS = 3
    if (activeCount >= MAX_CONCURRENT_COORDINATIONS) {
      console.log(`[Inngest] Concurrency limit reached for org ${org_id}. Queuing...`)
      // Delay retry using Inngest sleep or just re-send event with delay
      // For simplicity, we re-send with a delay
      await step.sleep('throttle-retry', '30s')
      await inngest.send({
        name: 'agent/coordination.requested',
        data: { ...event.data, queued_at: new Date().toISOString() },
      })
      return { queued: true, reason: 'concurrency_limit_reached' }
    }

    // 2. Find the target agent
    const { data: targetAgent } = await supabase
      .from('agents')
      .select('id, name')
      .eq('org_id', org_id)
      .eq('acronym', target_agent_acronym)
      .single()

    if (!targetAgent) return { success: false, reason: 'target_agent_not_found' }

    // 3. Track this event in coordination_events to count towards concurrency
    const { data: coordEvent } = await supabase
      .from('coordination_events')
      .insert({
        org_id,
        from_agent_id,
        to_agent_id: targetAgent.id,
        type: 'handoff',
        description: reason,
        context,
        status: 'pending',
        chain_depth: depth
      })
      .select()
      .single()

    // 4. Create/Find a conversation between the source and target agent
    const { data: internalConv } = await supabase
      .from('conversations')
      .insert({
        org_id,
        agent_id: targetAgent.id,
        user_id: event.data.user_id, // Inherit user_id for permission checks
        title: `Internal Bridge: ${reason.slice(0, 30)}...`,
        created_by_agent_id: from_agent_id
      })
      .select()
      .single()

    if (!internalConv) return { success: false, reason: 'conv_creation_failed' }

    // 5. Post the request context as a message
    await supabase.from('messages').insert({
      conversation_id: internalConv.id,
      sender_type: 'user', 
      content: `[COORDINATION_REQUEST from Agent ${from_agent_id}]\nContext: ${context}\nReason: ${reason}`
    })

    // 6. Mark coordination event as complete if auto-approvable (internal bridges usually are)
    if (coordEvent) {
      await supabase.from('coordination_events').update({ status: 'complete' }).eq('id', coordEvent.id)
    }

    return { success: true, conv_id: internalConv.id }
  }
)

// Agent Memory Compression Logic
export const agentMemoryUpdateFn = inngest.createFunction(
  { id: 'agent-memory-update', name: 'Agent Memory Update' },
  { event: 'agent/memory.update' },
  async ({ event, step }) => {
    const { org_id, agent_id, conversation_id } = event.data
    const supabase = createServiceSupabaseClient()

    // 1. Fetch last 10 messages for context
    const { data: messages } = await step.run('fetch-messages', async () => {
      const { data } = await supabase
        .from('messages')
        .select('sender_type, content')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .limit(10)
      return { messages: data }
    })

    if (!messages?.messages || messages.messages.length === 0) return { success: false }

    // 2. Fetch current memory
    const { data: currentMemory } = await step.run('fetch-current-memory', async () => {
      const { data } = await supabase
        .from('llm_memories')
        .select('*')
        .eq('org_id', org_id)
        .eq('agent_id', agent_id)
        .single()
      return { memory: data }
    })

    // 3. Summarize/Compress Memory using LLM
    const newSummary = await step.run('compress-memory', async () => {
      const { getGemini } = await import('@/lib/ai/client')
      const ai = getGemini()
      
      const historyText = messages.messages.reverse().map(m => `${m.sender_type.toUpperCase()}: ${m.content}`).join('\n')
      const existingContext = currentMemory?.memory?.memory_data?.context_summary || 'None'

      const prompt = `
        You are the Memory Management Engine for an Autonomous OS.
        Your task is to update the long-term context summary for an AI Executive.
        
        EXISTING_CONTEXT:
        ${existingContext}
        
        RECENT_MESSAGES:
        ${historyText}
        
        INSTRUCTIONS:
        1. Extract new key learnings, decisions made, or user preferences.
        2. Merge them with the existing context to create a concise, high-density summary (max 500 words).
        3. Maintain specific brand names, project goals, and personal preferences mentioned by the user.
        4. Focus on "What do I need to remember for the next interaction?"
        
        Provide ONLY the updated summary.
      `
      const result = await ai.invoke(prompt)
      return result.content.toString()
    })

    // 4. Update the DB
    await step.run('update-db', async () => {
      await supabase.from('llm_memories').upsert({
        org_id,
        agent_id,
        memory_data: { 
          context_summary: newSummary,
          updated_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'org_id,agent_id' })
    })

    return { success: true, updated: true }
  }
)

// AI Auto-Titling Logic
export const conversationTitleFn = inngest.createFunction(
  { id: 'conversation-title-generate', name: 'Generate Conversation Title' },
  { event: 'agent/conversation.title.generate' },
  async ({ event, step }) => {
    const { org_id, conversation_id, first_message } = event.data
    const supabase = createServiceSupabaseClient()

    const title = await step.run('generate-title', async () => {
      const { getGemini } = await import('@/lib/ai/client')
      const ai = getGemini()
      
      const prompt = `
        You are the Brand & Systems Identity Engine for an Autonomous OS.
        Generate a snappy, professional, and descriptive 3-5 word title for a chat session.
        The title MUST be in ALL_CAPS with UNDERSCORES.
        Example: Q4_MARKET_EXPANSION, TECH_AUDIT_PHASE_1, BRAND_OUTREACH_LOG.
        
        USER_FIRST_PROMPT: "${first_message}"
        
        Provide ONLY the generated title.
      `
      const result = await ai.invoke(prompt)
      return result.content.toString().trim().replace(/['"]/g, '')
    })

    await step.run('update-conversation', async () => {
      await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversation_id)
    })

    return { title }
  }
)

export const functions = [
  approvalReminderFn, 
  agentDailyResetFn, 
  oauthStateCleanupFn, 
  agentCoordinationFn,
  agentMemoryUpdateFn,
  conversationTitleFn
]
