export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
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

  try {
    const { content: rawContent, attachments, mode, model: modelOverride } = await request.json()
    const supabase = await createServerSupabaseClient()
    const serviceClient = createServiceSupabaseClient()

    // 1a. Security: Sanitize Input
    const content = sanitizeInput(rawContent)

    // 1. Get conversation + agent + company context
    const { data: conversation, error: convError } = await serviceClient
      .from('conversations')
      .select('org_id, user_id, agent_id, agents:agent_id(*, departments(*))')
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      console.error('CONVERSATION_NOT_FOUND:', convError);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orgId = conversation.org_id
    const agent = Array.isArray(conversation.agents) ? conversation.agents[0] : conversation.agents

    if (!agent) {
      return NextResponse.json({ error: 'No agent assigned to this conversation' }, { status: 400 });
    }

    // 1b. Rate Limit
    const { allowed: rlAllowed } = await checkRateLimit(user.id, 'agent_briefs')
    if (!rlAllowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

    // 2. Context
    const { data: company } = await supabase.from('company_identity').select('*').eq('org_id', orgId).single()
    const { data: member } = await supabase.from('org_members').select('*').eq('user_id', user.id).eq('org_id', orgId).single()

    if (!company || !member) return NextResponse.json({ error: 'Context missing' }, { status: 500 })

    // 3. History
    const { data: history } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    // 4. Save user message
    const { error: userMsgErr } = await serviceClient.from('messages').insert({
      conversation_id: conversationId,
      sender_type: 'user',
      content,
    })
    if (userMsgErr) console.error('USER_MSG_INSERT_ERR:', userMsgErr)

    // 5. Build Prompt
    const { data: memoryRow } = await supabase.from('llm_memories').select('*').eq('org_id', orgId).eq('agent_id', agent.id).single()
    const memoryContext = memoryRow?.memory_data?.context_summary || ''
    let systemPrompt = buildAgentSystemPrompt(agent, company, member, memoryContext)

    const langchainMessages: any[] = [
      new SystemMessage(systemPrompt),
      ...(history || []).reverse().map((m: any) =>
        m.sender_type === 'user' ? new HumanMessage(m.content) : new SystemMessage(`Previous response: ${m.content}`)
      ),
      new HumanMessage(content)
    ]

    // 6. AI Call
    let agentResponse = ''
    try {
      if (!modelOverride || modelOverride === 'orca-intel') {
        const gemini = getGemini()
        const result = await gemini.invoke(langchainMessages)
        agentResponse = result.content as string
      } else {
        const { buildDynamicLLMClient } = await import('@/lib/ai/dynamicClient')
        const ai = buildDynamicLLMClient({ provider: 'openrouter', model: modelOverride, apiKey: process.env.OPENROUTER_API_KEY! })
        const result = await ai.invoke(langchainMessages)
        agentResponse = result.content as string
      }
    } catch (aiErr) {
      console.error('AI_ERROR:', aiErr)
      const groq = getGroq()
      const result = await groq.invoke(langchainMessages)
      agentResponse = result.content as string
    }

    // 7. Process Result
    const resultMatch = agentResponse.match(/RESULT:\s*([\s\S]+?)(?:\n|$)/)
    const resultItems = resultMatch ? resultMatch[1].split('|').map(s => s.trim()) : []
    const coordMatch = agentResponse.match(/COORDINATION_NEEDED:\s*dept=(\w+)/)

    // 8. Save agent message
    let { data: agentMessage, error: agentMsgErr } = await serviceClient.from('messages').insert({
      conversation_id: conversationId,
      sender_type: 'agent',
      content: agentResponse,
      result_items: resultItems,
      status: 'pending',
      metadata: { thinking_steps: mode === 'planning' ? ['Analyzing...', 'Strategizing...'] : ['Executing...'] }
    }).select().single()

    if (agentMsgErr) {
      console.warn('FULL_INSERT_FAILED, TRYING FALLBACK:', agentMsgErr.message);
      // Fallback for older schemas missing metadata/result_items/status
      const { data: fallbackMsg, error: fallbackErr } = await serviceClient.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'agent',
        content: agentResponse
      }).select().single()
      
      if (fallbackErr) {
        console.error('FALLBACK_INSERT_ERR:', fallbackErr)
        return NextResponse.json({ error: 'Failed to save agent response', details: fallbackErr.message }, { status: 500 })
      }
      agentMessage = fallbackMsg;
    }

    // 9. Side effects (async)
    if (coordMatch) {
       inngest.send({ name: 'agent/coordination.requested', data: { org_id: orgId, from_agent_id: agent.id, conversation_id: conversationId, context: agentResponse } }).catch(console.error)
    }

    return NextResponse.json({
      message: agentMessage,
      resultItems,
      coordinationRequested: !!coordMatch
    })

  } catch (globalErr: any) {
    console.error('GLOBAL_POST_ERROR:', globalErr)
    return NextResponse.json({ error: 'Internal Server Error', details: globalErr.message }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: conversationId } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServerSupabaseClient();
  
  const { data: conversation } = await serviceClient
    .from('conversations')
    .select('user_id, agents(*)')
    .eq('id', conversationId)
    .single();

  if (!conversation || conversation.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
  }

  const { data: dbMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  const agent = Array.isArray(conversation.agents) ? conversation.agents[0] : conversation.agents;
  
  const messages = (dbMessages || []).map(m => ({
    ...m,
    role: m.sender_type === 'user' ? 'user' : 'assistant',
    agent: m.sender_type === 'agent' ? { 
      name: agent?.name || 'Aria', 
      role: agent?.role_description || 'CMO',
      icon: agent?.icon || 'smart_toy'
    } : null
  }));

  return NextResponse.json({ messages });
}
