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

  const { content: rawContent } = await request.json()
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
  })

  // 6. Update agent to busy
  const agent = Array.isArray(conversation.agents) ? conversation.agents[0] : conversation.agents
  await supabase
    .from('agents')
    .update({ status: 'busy' })
    .eq('id', agent.id)

  // 7. Build system prompt
  const systemPrompt = buildAgentSystemPrompt(agent, company, member)

  // 8. Build messages array
  const langchainMessages = [
    new SystemMessage(systemPrompt),
    ...(history || []).reverse().map((m: any) =>
      m.sender_type === 'user'
        ? new HumanMessage(m.content)
        : new SystemMessage(`Previous agent response: ${m.content}`)
    ),
    new HumanMessage(content),
  ]

  // 9. Call AI
  const isComplexTask = content.length > 100
  const ai = isComplexTask ? getGemini() : getGroq()

  // Thinking Steps simulation
  const thinkingSteps = [
    `Analyzing requirements for ${agent.name}...`,
    `Retrieving ${company.company_name} brand context...`,
    `Cross-referencing with ${member.role}'s brief...`,
    `Generating structured output...`
  ]

  const result = await ai.invoke(langchainMessages)
  let agentResponse = result.content as string

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

  // 12. Save agent message
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

  // 13. Update agent status
  await supabase.from('agents').update({
    status: 'active',
    tasks_today: (agent.tasks_today || 0) + 1,
    last_action: content.slice(0, 80),
    last_active_at: new Date().toISOString(),
  }).eq('id', agent.id)

  // Audit Log
  await writeAuditLog({
    orgId,
    actorUserId: user.id,
    action: 'agent_interaction',
    resourceType: 'agent',
    resourceId: agent.id,
    metadata: { conversation_id: conversationId }
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
