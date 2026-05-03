export const dynamic = 'force-dynamic'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { createOpenAI } from '@ai-sdk/openai'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { buildAgentSystemPrompt } from '@/lib/ai/prompt'
import { buildToolsForAgent } from '@/lib/agents/tools'
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
    const { messages: rawMessages, model: modelOverride } = await request.json()
    const lastMessage = rawMessages[rawMessages.length - 1]
    const rawContent = lastMessage?.content || ''
    
    const supabase = await createServerSupabaseClient()
    const serviceClient = createServiceSupabaseClient()

    // 1. Sanitize & Fetch Context
    const content = sanitizeInput(rawContent)
    const { data: conversation } = await serviceClient
      .from('conversations')
      .select('org_id, user_id, agent_id')
      .eq('id', conversationId)
      .single()

    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    if (conversation.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const orgId = conversation.org_id
    const { data: agent } = await serviceClient.from('agents').select('*').eq('id', conversation.agent_id).single()
    if (!agent) return NextResponse.json({ error: 'No agent found' }, { status: 400 })

    // 2. Security & Rate Limiting
    const { allowed: rlAllowed } = await checkRateLimit(user.id, 'agent_briefs')
    if (!rlAllowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

    // 3. Fetch Company & Member Data
    const { data: company } = await supabase.from('company_identity').select('*').eq('org_id', orgId).single()
    const { data: member } = await supabase.from('org_members').select('*').eq('user_id', user.id).eq('org_id', orgId).single()
    const { data: integrations } = await supabase.from('integrations').select('service_name').eq('org_id', orgId)
    const connectedIntegrations = integrations?.map(i => i.service_name) || []

    // 4. Memory Context
    const { data: memoryRow } = await supabase.from('llm_memories').select('*').eq('org_id', orgId).eq('agent_id', agent.id).single()
    const memoryContext = memoryRow?.memory_data?.context_summary || ''

    // 5. History
    const { data: history } = await supabase
      .from('messages')
      .select('sender_type, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)

    // 6. Save User Message immediately
    await serviceClient.from('messages').insert({
      conversation_id: conversationId,
      sender_type: 'user',
      content: content
    })

    // 7. Prepare Prompt & Tools
    const systemPrompt = buildAgentSystemPrompt(agent, company, member, memoryContext, connectedIntegrations)
    const tools = buildToolsForAgent(agent.name, orgId, connectedIntegrations)

    const messages = [
      ...(history || []).map(m => ({
        role: m.sender_type === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      { role: 'user', content }
    ]

    // 8. Model Selection with Failover for Orca Intelligence
    let model: any
    const isOrcaIntel = !modelOverride || modelOverride === 'orca-intel'

    if (isOrcaIntel) {
      // Primary: Gemini 1.5 Pro
      try {
        model = google('gemini-1.5-pro-latest')
      } catch (err) {
        // Failover: Groq Llama 3.3 70b
        model = groq('llama-3.3-70b-versatile')
      }
    } else {
      // BYO-LLM via OpenRouter
      const openrouter = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY
      })
      model = openrouter(modelOverride)
    }

    // 9. Stream Response
    const result = await streamText({
      model,
      system: systemPrompt,
      // @ts-ignore
      messages,
      tools,
      maxSteps: 5,
      onFinish: async ({ text, toolResults }) => {
        // Save Agent Response to DB on completion
        const resultMatch = text.match(/RESULT:\s*([\s\S]+?)(?:\n|$)/)
        const resultItems = resultMatch ? resultMatch[1].split('|').map(s => s.trim()) : []
        const directiveMatch = text.match(/DIRECTIVE_DOCUMENT:\s*([\s\S]+?)(?:\nRESULT:|\nCOORDINATION_NEEDED:|$)/)
        const directiveRaw = directiveMatch ? directiveMatch[1].trim() : null

        await serviceClient.from('messages').insert({
          conversation_id: conversationId,
          sender_type: 'agent',
          content: text,
          result_items: resultItems,
          metadata: { 
            directive_raw: directiveRaw,
            tool_results: toolResults 
          }
        })
      }
    })

    return result.toDataStreamResponse()
  } catch (err: any) {
    console.error('STREAM_ROUTE_ERR:', err)
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
    const serviceClient = createServiceSupabaseClient()
    const { data: conversation } = await serviceClient.from('conversations').select('user_id').eq('id', conversationId).single()
    if (!conversation || conversation.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { data: messages, error } = await serviceClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Error', details: err.message }, { status: 500 })
  }
}
