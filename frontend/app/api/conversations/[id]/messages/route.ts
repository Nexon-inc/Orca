import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildAgentSystemPrompt } from '@/lib/ai/prompt'
import { getGemini, getGroq } from '@/lib/ai/client'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { inngest } from '@/lib/inngest/client'
import { sanitizeInput } from '@/lib/security/sanitizeInput'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { checkTokenGuard } from '@/lib/security/tokenGuard'
import { filterAgentOutput } from '@/lib/security/outputFilter'
import { writeAuditLog } from '@/lib/security/auditLog'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: conversationId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content: rawContent, attachments, mode, model: modelOverride } = await request.json()
  const supabase = await createServerSupabaseClient()

  // 1a. Security: Sanitize Input
  const content = sanitizeInput(rawContent)

  // 1. Get conversation + agent + company context
  const { data: conversation } = await supabase
    .from('conversations')
    .select('org_id, agent_id, agents:agent_id(*, departments(*))')
    .eq('id', conversationId)
    .single()

  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const orgId = conversation.org_id

  // 1b. Security: Rate Limit (using agent_briefs bucket)
  const { allowed: rlAllowed } = await checkRateLimit(user.id, 'agent_briefs')
  if (!rlAllowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  // 1c. Security: Token/Size Guard
  const { allowed: tgAllowed, reason: tgReason } = await checkTokenGuard(orgId, content.length)
  if (!tgAllowed) return NextResponse.json({ error: tgReason }, { status: 403 })

  // 2. Get company identity
  const { data: company } = await supabase
    .from('company_identity')
    .select('*')
    .eq('org_id', orgId)
    .single()

  // 3. Get member context
  const { data: member } = await supabase
    .from('org_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .single()

  if (!company || !member) return NextResponse.json({ error: 'Context missing' }, { status: 500 })

  // 4. Get conversation history (last 10 messages)
  const { data: history } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10)

  // 5. Save user message
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_type: 'user',
    content,
    // Note: attachments could be saved to DB here if schema supported it
  })

  // 6. Update agent to busy
  const agent = Array.isArray(conversation.agents) ? conversation.agents[0] : conversation.agents
  await supabase
    .from('agents')
    .update({ status: 'busy' })
    .eq('id', agent.id)

  // 7. Get Agent Memory
  const { data: memoryRow } = await supabase
    .from('llm_memories')
    .select('*')
    .eq('org_id', orgId)
    .eq('agent_id', agent.id)
    .single()

  const messageCount = (memoryRow?.message_count || 0) + 1
  const memoryContext = memoryRow?.memory_data?.context_summary || ''

  // 8. Build system prompt with memory
  let systemPrompt = buildAgentSystemPrompt(agent, company, member, memoryContext)
  
  // 8b. Append document attachments text to system prompt
  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      if (file.type !== 'image') {
        systemPrompt += `\n\nATTACHED FILE — ${file.name}:\n${file.text || 'No text extracted'}`
      }
    }
  }

  // 8. Build messages array
  const langchainMessages: any[] = [
    new SystemMessage(systemPrompt),
    ...(history || []).reverse().map((m: any) =>
      m.sender_type === 'user'
        ? new HumanMessage(m.content)
        : new SystemMessage(`Previous agent response: ${m.content}`)
    ),
  ]

  // 8b. Construct Human Message with potential Vision Images
  if (attachments && attachments.some((f: any) => f.type === 'image')) {
    const messageContent: any[] = [{ type: 'text', text: content }]
    for (const file of attachments) {
      if (file.type === 'image') {
        messageContent.push({ 
          type: 'image_url', 
          image_url: { url: `data:image/jpeg;base64,${file.data}` } 
        })
      }
    }
    langchainMessages.push(new HumanMessage({ content: messageContent }))
  } else {
    langchainMessages.push(new HumanMessage(content))
  }

  // 9. Call AI (Conditional Model Selection with Fallback)
  let agentResponse = ''
  let finalModelUsed = ''

  try {
    if (!modelOverride || modelOverride === 'orca-intel') {
      // Primary: Gemini
      const gemini = getGemini()
      const result = await gemini.invoke(langchainMessages)
      agentResponse = result.content as string
      finalModelUsed = 'gemini'
    } else {
      // Specific Model Selection (OpenRouter or others)
      const { buildDynamicLLMClient } = await import('@/lib/ai/dynamicClient')
      const [provider, ...modelParts] = modelOverride.split('/')
      
      const ai = buildDynamicLLMClient({
        provider: provider === 'anthropic' || provider === 'openai' || provider === 'meta-llama' || provider === 'google' || provider === 'deepseek' ? 'openrouter' : provider,
        model: modelOverride,
        apiKey: process.env.OPENROUTER_API_KEY!,
        temperature: 0.7,
        maxTokens: 4000
      })
      const result = await ai.invoke(langchainMessages)
      agentResponse = result.content as string
      finalModelUsed = modelOverride
    }
  } catch (error) {
    console.error('AI Primary Call Failed:', error)
    
    // Fallback logic for ORCA Intelligence
    if (!modelOverride || modelOverride === 'orca-intel') {
      console.log('Falling back to Groq...')
      try {
        const groq = getGroq()
        const result = await groq.invoke(langchainMessages)
        agentResponse = result.content as string
        finalModelUsed = 'groq'
      } catch (fallbackError) {
        console.error('Groq Fallback also failed:', fallbackError)
        return NextResponse.json({ error: 'All AI models are currently unavailable.' }, { status: 503 })
      }
    } else {
      // If a specific model was requested and failed, we don't fallback to maintain deterministic choice
      return NextResponse.json({ error: `Request for ${modelOverride} failed.` }, { status: 500 })
    }
  }

  // Thinking Steps simulation (Adjust based on mode)
  const thinkingSteps = mode === 'planning' 
    ? [`Initiating Deep Planning Mode...`, `Architecting multi-step solution...`, `Validating constraints...`]
    : [`Executing ${agent.name} protocol...`, `Synthesizing response...`]

  // 9b. Security: Output Filtering
  agentResponse = filterAgentOutput(agentResponse)

  // 10. Parse result items
  const resultMatch = agentResponse.match(/RESULT:\s*([\s\S]+?)(?:\n|$)/)
  const resultItems = resultMatch
    ? resultMatch[1].split('|').map(s => s.trim()).filter(Boolean)
    : []

  // 11. Check for coordination
  const coordMatch = agentResponse.match(/COORDINATION_NEEDED:\s*dept=(\w+),\s*agent=(\w+),\s*reason=(.+?)(?:\n|$)/)
  const visualMatch = agentResponse.match(/request visual for (.+)/i)

  // 12. Update agent status & Increment Memory Counter
  await supabase.from('agents').update({
    status: 'active',
    tasks_today: (agent.tasks_today || 0) + 1,
    last_action: content.slice(0, 80),
    last_active_at: new Date().toISOString(),
  }).eq('id', agent.id)

  // 13. Message Counter & Memory Update Trigger
  await supabase.from('llm_memories').upsert({
    org_id: orgId,
    agent_id: agent.id,
    message_count: messageCount,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'org_id,agent_id' })

  if (messageCount === 1) {
    // Trigger AI Auto-Titling for new conversations
    await inngest.send({
      name: 'agent/conversation.title.generate',
      data: {
        org_id: orgId,
        conversation_id: conversationId,
        first_message: content
      }
    })
  }

  if (messageCount % 10 === 0) {
    // Trigger memory compression via Inngest or inline
    await inngest.send({
      name: 'agent/memory.update',
      data: {
        org_id: orgId,
        agent_id: agent.id,
        conversation_id: conversationId,
      }
    })
  }

  // Save agent message
  const mode = agent.departments ? agent.departments.agent_mode : 'approve_first'
  const { data: agentMessage } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_type: 'agent',
    content: agentResponse,
    result_items: resultItems,
    status: mode === 'autopilot' ? 'approved' : 'pending',
    metadata: {
      thinking_steps: thinkingSteps,
      has_visual_request: !!visualMatch,
      visual_prompt: visualMatch ? visualMatch[1].trim() : null
    }
  }).select().single()

  // Audit Log
  await writeAuditLog({
    orgId,
    actorUserId: user.id,
    action: 'agent_interaction',
    resourceType: 'agent',
    resourceId: agent.id,
    metadata: { conversation_id: conversationId, message_count: messageCount }
  })

  // 14. Handle coordination
  if (coordMatch) {
    const [, targetDept, targetAgent, reason] = coordMatch
    await inngest.send({
      name: 'agent/coordination.requested',
      data: {
        org_id: orgId,
        from_agent_id: agent.id,
        target_department_key: targetDept,
        target_agent_acronym: targetAgent,
        reason,
        context: agentResponse,
        conversation_id: conversationId,
      }
    })
  }

  // 14b. Handle Wren Code Generation & PRs
  const prMatch = agentResponse.match(/\[OPEN_PR: title="(.+?)" branch="(.+?)"\]/)
  const githubConnected = !!member.github_access_token // Assuming this exists in member context

  if (prMatch && githubConnected) {
    const [, title, branch] = prMatch
    const codeBlocks = [...agentResponse.matchAll(/FILE: (.+?)\n```\w+\n([\s\S]+?)```/g)]

    for (const [, filePath, code] of codeBlocks) {
      await inngest.send({
        name: 'github/file.update',
        data: { org_id: orgId, path: filePath, content: code, branch, message: title }
      })
    }

    await inngest.send({
      name: 'github/pr.create',
      data: { org_id: orgId, title, head: branch, base: 'main', body: agentResponse }
    })
  }

  // 14c. Handle Ghost -> Wren coordination
  const wrenFixMatch = agentResponse.match(/\[WREN_FIX_NEEDED: file=(.+?), line=(\d+), issue=(.+?)\]/)
  if (wrenFixMatch) {
    const [, file, line, issue] = wrenFixMatch
    await inngest.send({
      name: 'agent/coordination.requested',
      data: {
        org_id: orgId,
        from_agent_id: agent.id,
        target_department_key: 'tech',
        target_agent_name: 'Wren',
        reason: `Security fix needed in ${file} line ${line}: ${issue}`,
        context: agentResponse,
        conversation_id: conversationId,
      }
    })
  }

  if (visualMatch) {
    await inngest.send({
      name: 'marketing/creative.generate',
      data: {
        org_id: orgId,
        conversation_id: conversationId,
        prompt: visualMatch[1].trim(),
        type: 'image'
      }
    })
  }

  return NextResponse.json({
    message: agentMessage,
    resultItems,
    coordinationRequested: !!coordMatch,
    visualRequested: !!visualMatch
  })
}
