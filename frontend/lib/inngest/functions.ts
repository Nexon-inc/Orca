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
      .select('id, name, acronym, departments!inner(org_id, agent_mode)')
      .eq('departments.org_id', org_id)
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
    let { data: internalConv } = await supabase
      .from('conversations')
      .select('*')
      .eq('org_id', org_id)
      .eq('agent_id', targetAgent.id)
      .eq('user_id', event.data.user_id)
      .maybeSingle()

    if (!internalConv) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          org_id,
          agent_id: targetAgent.id,
          user_id: event.data.user_id, // Inherit user_id for permission checks
          department_key: target_department_key
        })
        .select()
        .single()
      internalConv = newConv
    }

    if (!internalConv) return { success: false, reason: 'conv_creation_failed' }

    // 5. Post the request context as a message
    const { data: insertedUserMsg } = await supabase.from('messages').insert({
      conversation_id: internalConv.id,
      sender_type: 'user', 
      content: `[COORDINATION_REQUEST from Agent ${from_agent_id}]\nContext: ${context}\nReason: ${reason}`
    }).select('id').single()

    // 6. Mark coordination event as complete if auto-approvable (internal bridges usually are)
    if (coordEvent) {
      await supabase.from('coordination_events').update({ status: 'complete' }).eq('id', coordEvent.id)
    }

    // 7. If target agent's department is in autopilot mode, run target agent execution in background
    const isAutopilot = (targetAgent.departments as any)?.agent_mode === 'autopilot'
    if (isAutopilot) {
      await step.run('execute-background-agent', async () => {
        const { getGemini } = await import('@/lib/ai/client')
        const { buildAgentSystemPrompt } = await import('@/lib/ai/prompt')
        const { parseAndExecuteActions } = await import('@/lib/agents/parseActions')
        const { getAgentMemory } = await import('@/lib/agents/memory')

        // Fetch company details, org members and active template rules
        const { data: company } = await supabase.from('company_identity').select('*').eq('org_id', org_id).single()
        const { data: member } = await supabase.from('org_members').select('*').eq('org_id', org_id).eq('role', 'owner').limit(1).single()
        const { data: orgData } = await supabase.from('organizations').select('active_template').eq('id', org_id).single()
        const { data: integrations } = await supabase.from('integrations').select('service_name').eq('org_id', org_id)
        const connectedIntegrations = integrations?.map(i => i.service_name) || []

        const memoryContext = await getAgentMemory(targetAgent.id, org_id)

        // Compile prompt
        const systemPrompt = buildAgentSystemPrompt(
          targetAgent as any,
          company as any,
          member as any,
          memoryContext,
          connectedIntegrations,
          'automate',
          orgData?.active_template
        )

        // Fetch conversation history
        const { data: history } = await supabase
          .from('messages')
          .select('sender_type, content')
          .eq('conversation_id', internalConv.id)
          .order('created_at', { ascending: true })

        // Format history
        const historyText = (history || []).map(m => {
          const sender = m.sender_type === 'user' ? 'CEO' : targetAgent.name
          return `${sender}: ${m.content}`
        }).join('\n\n')

        const promptText = `
System Prompt:
${systemPrompt}

Conversation History:
${historyText}

Assistant:`

        const ai = getGemini()
        const response = await ai.invoke(promptText)
        const textResponse = response.content

        // Parse result items and directive raw if present
        const resultMatch = textResponse.match(/(?:RESULT|RESULTS|OUTCOME):\s*([\s\S]+?)(?:\n|$)/i)
        const resultItems = resultMatch ? resultMatch[1].split('|').map((s: string) => s.trim()) : []
        const directiveMatch = textResponse.match(/(?:DIRECTIVE_DOCUMENT|DIRECTIVE|MASTER_DIRECTIVE):\s*([\s\S]+?)(?:\n(?:RESULT|RESULTS|COORDINATION_NEEDED):|$)/i)
        const directiveRaw = directiveMatch ? directiveMatch[1].trim() : null

        // Execute actions/handoffs
        const { cleanResponse } = await parseAndExecuteActions(textResponse, org_id, targetAgent.id, event.data.user_id, depth)

        // Save response message to Supabase
        const { data: insertedMsg } = await supabase.from('messages').insert({
          conversation_id: internalConv.id,
          sender_type: 'agent',
          content: cleanResponse,
          result_items: resultItems,
          metadata: { 
            directive_raw: directiveRaw,
            agent_name: targetAgent.name 
          }
        }).select('id').single()

        // Auto-save briefing if needed
        try {
          const wordCount = cleanResponse.split(/\s+/).filter(Boolean).length
          const hasHeading = /^#{1,6}\s+/m.test(cleanResponse)
          const bulletMatches = cleanResponse.match(/^[\s]*[-*+]\s+/gm) || []
          const hasThreeBullets = bulletMatches.length >= 3

          if (wordCount > 500 || hasHeading || hasThreeBullets) {
            const headingMatch = cleanResponse.match(/^#{1,6}\s+(.+)$/m)
            let title = headingMatch ? headingMatch[1].trim() : ''
            if (!title) {
              title = cleanResponse.substring(0, 60).replace(/[*#_`>]/g, '').trim() || 'Executive Briefing'
            }

            const lines = cleanResponse.split('\n')
            const highlightsList: string[] = [];
            const listItemsFirst200Words: string[] = [];
            let totalWordsProcessed = 0;

            lines.forEach((line: string) => {
              const trimmed = line.trim()
              const words = trimmed.split(/\s+/)
              const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ')

              if (isBullet) {
                const textContent = trimmed.substring(2).trim()
                const hasPercentageOrCash = /[\d%]|[\d\$]/.test(textContent) && (textContent.includes('%') || textContent.includes('$'))
                const hasUrgentWords = /\b(urgent|immediately|critical|warning|opportunity|danger|attention)\b/i.test(textContent)
                const isFirst200 = totalWordsProcessed < 200

                if (hasPercentageOrCash || hasUrgentWords) {
                  highlightsList.push(textContent)
                } else if (isFirst200) {
                  listItemsFirst200Words.push(textContent)
                }
              }
              if (trimmed !== '') {
                totalWordsProcessed += words.length
              }
            })
            const finalHighlights = [...new Set([...highlightsList, ...listItemsFirst200Words])].slice(0, 5)

            const tasksList: any[] = []
            lines.forEach((line: string) => {
              const trimmed = line.trim()
              if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
                const checked = trimmed.startsWith('- [x] ')
                const taskTitle = trimmed.substring(6).trim()
                tasksList.push({ title: taskTitle, status: checked ? 'done' : 'pending' })
              }
            })

            await supabase.from('briefings').insert({
              org_id,
              conversation_id: internalConv.id,
              message_id: insertedMsg?.id || null,
              agent_name: targetAgent.name,
              agent_acronym: targetAgent.acronym,
              title,
              content: cleanResponse,
              word_count: wordCount,
              highlights: finalHighlights,
              tasks: tasksList,
              document_type: 'executive_brief'
            })
          }
        } catch (saveErr) {
          console.error('Failed to auto-save briefing in background:', saveErr)
        }
      })
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
