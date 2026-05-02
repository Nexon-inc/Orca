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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: conversationId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { content: rawContent, mode, model: modelOverride } = await request.json()
    const supabase = await createServerSupabaseClient()
    const serviceClient = createServiceSupabaseClient()

    // 1. Sanitize & Context
    const content = sanitizeInput(rawContent)
    const { data: conversation } = await serviceClient
      .from('conversations')
      .select('org_id, user_id, agent_id, title, agents:agent_id(*, departments(*))')
      .eq('id', conversationId)
      .single()

    if (!conversation || conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const orgId = conversation.org_id
    const agent = Array.isArray(conversation.agents) ? conversation.agents[0] : conversation.agents
    if (!agent) return NextResponse.json({ error: 'No agent' }, { status: 400 })

    // 2. Security
    const { allowed: rlAllowed } = await checkRateLimit(user.id, 'agent_briefs')
    if (!rlAllowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

    // 3. Fetch Company & Member
    const { data: company } = await supabase.from('company_identity').select('*').eq('org_id', orgId).single()
    const { data: member } = await supabase.from('org_members').select('*').eq('user_id', user.id).eq('org_id', orgId).single()

    // 4. History
    const { data: history } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5)

    // 5. Memory
    const { data: memoryRow } = await supabase.from('llm_memories').select('*').eq('org_id', orgId).eq('agent_id', agent.id).single()
    const memoryContext = memoryRow?.memory_data?.context_summary || ''
    const messageCount = (memoryRow?.message_count || 0) + 1

    // 6. Build Prompt
    const systemPrompt = buildAgentSystemPrompt(agent, company, member, memoryContext)
    const langchainMessages: any[] = [
      new SystemMessage(systemPrompt),
      ...(history || []).reverse().map((m: any) =>
        m.sender_type === 'user' ? new HumanMessage(m.content) : new SystemMessage(`Previous response: ${m.content}`)
      ),
      new HumanMessage(content)
    ]

    // 7. AI Call
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
    } catch (err) {
      const groq = getGroq()
      const result = await groq.invoke(langchainMessages)
      agentResponse = result.content as string
    }

    // 8. Parse & Save
    const resultMatch = agentResponse.match(/RESULT:\s*([\s\S]+?)(?:\n|$)/)
    const resultItems = resultMatch ? resultMatch[1].split('|').map(s => s.trim()) : []
    const coordMatch = agentResponse.match(/COORDINATION_NEEDED:\s*dept=(\w+)/)

    const { data: agentMessage } = await serviceClient.from('messages').insert({
      conversation_id: conversationId,
      sender_type: 'agent',
      content: agentResponse,
      result_items: resultItems,
      status: 'pending',
      metadata: { thinking_steps: mode === 'planning' ? ['Analyzing...', 'Strategizing...'] : ['Executing...'] }
    }).select().single()

    // 9. Background Side Effects
    const updateData: any = { updated_at: new Date().toISOString() }
    
    // Auto-title if currently default
    if (!conversation.title || conversation.title.includes('SESSION_')) {
      updateData.title = content.length > 25 ? content.substring(0, 25) + '...' : content
    }

    serviceClient.from('conversations').update(updateData).eq('id', conversationId).then(({ error }) => {
      if (error) console.error('CONV_TS_UPDATE_ERR:', error)
    })
    serviceClient.from('llm_memories').upsert({ org_id: orgId, agent_id: agent.id, message_count: messageCount }, { onConflict: 'org_id,agent_id' }).then(({ error }) => {
      if (error) console.error('MEMORY_UPDATE_ERR:', error)
    })

    // 10. Auto-Onboarding (If mission is missing)
    if (!company?.mission || company.mission.includes('not defined')) {
      const nameMatch = content.match(/company is called (.*?)\./i)
      const missionMatch = content.match(/Our goal is (.*?)\./i) || content.match(/We are building (.*?)\./i)
      
      if (nameMatch || missionMatch) {
        serviceClient.from('company_identity').update({
          company_name: nameMatch ? nameMatch[1] : company?.company_name,
          mission: missionMatch ? missionMatch[1] : content,
          updated_at: new Date().toISOString()
        }).eq('org_id', orgId).then(({ error }) => {
          if (error) console.error('ONBOARDING_UPDATE_ERR:', error)
        })
      }
    }

    if (coordMatch) {
      inngest.send({ name: 'agent/coordination.requested', data: { org_id: orgId, conversation_id: conversationId, context: agentResponse } }).catch(() => {})
    }

    return NextResponse.json({ message: agentMessage, resultItems })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Error', details: err.message }, { status: 500 })
  }
}
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: conversationId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabase = await createServerSupabaseClient()
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, agent:agent_id(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Error', details: err.message }, { status: 500 })
  }
}
