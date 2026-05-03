export const dynamic = 'force-dynamic'
import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
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
    const body = await request.json()
    // Only extract the last user message — ignore full frontend history (avoids 48KB duplicate payload)
    const rawMessages = body.messages || []
    const modelOverride = body.model
    const lastUserMessage = rawMessages.filter((m: any) => m.role === 'user').pop()
    const rawContent = lastUserMessage?.content || rawMessages[rawMessages.length - 1]?.content || ''
    
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

    // 6. Save User Message — deduplicated (prevent double-saves from retried requests)
    const { data: lastMsg } = await serviceClient
      .from('messages')
      .select('content, created_at')
      .eq('conversation_id', conversationId)
      .eq('sender_type', 'user')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const isDuplicate = lastMsg?.content?.trim() === content.trim() &&
      (Date.now() - new Date(lastMsg.created_at).getTime()) < 30_000 // same message within 30s = retry

    if (!isDuplicate) {
      await serviceClient.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'user',
        content: content
      })
    }

    // 7. Prepare Prompt & Tools — DB history is the ONLY source of truth for context
    const systemPrompt = buildAgentSystemPrompt(agent, company as any, member as any, memoryContext, connectedIntegrations)
    const tools = buildToolsForAgent(agent.name, orgId, connectedIntegrations)

    // Build and normalize the messages array:
    // - Convert DB rows to AI SDK format
    // - CRITICAL: collapse consecutive same-role messages (model APIs hard-reject these)
    const rawHistory = (history || []).map((m: any) => ({
      role: (m.sender_type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: String(m.content || '')
    }))

    // Deduplicate: merge consecutive messages of the same role into one
    const normalizedHistory = rawHistory.reduce((acc: any[], msg: any) => {
      const last = acc[acc.length - 1]
      if (last && last.role === msg.role) {
        // Merge content instead of having two consecutive same-role messages
        last.content = `${last.content}\n\n${msg.content}`
      } else {
        acc.push({ ...msg })
      }
      return acc
    }, [])

    // Ensure history ends with an assistant message (not user) before appending new user msg
    // This prevents user→user consecutive issue if DB is out of sync
    const lastHistoryRole = normalizedHistory[normalizedHistory.length - 1]?.role
    const cleanHistory = lastHistoryRole === 'user'
      ? normalizedHistory.slice(0, -1) // drop trailing user msg, we'll add the fresh one
      : normalizedHistory

    const messages = [
      ...cleanHistory,
      { role: 'user' as const, content }
    ]

    console.log(`[ORCA] messages to streamText: ${messages.length} (${messages.map((m: any) => m.role).join(',')})`)

    // 8. Model Selection with Runtime Failover for Orca Intelligence
    const isOrcaIntel = !modelOverride || modelOverride === 'orca-intel'

    const getStreamResult = async () => {
      const streamOptions = {
        system: systemPrompt,
        // @ts-ignore
        messages,
        tools,
        maxSteps: 5,
        onFinish: async ({ text, toolResults }: { text: string; toolResults: any }) => {
          const resultMatch = text.match(/RESULT:\s*([\s\S]+?)(?:\n|$)/)
          const resultItems = resultMatch ? resultMatch[1].split('|').map((s: string) => s.trim()) : []
          const directiveMatch = text.match(/DIRECTIVE_DOCUMENT:\s*([\s\S]+?)(?:\nRESULT:|\nCOORDINATION_NEEDED:|$)/)
          const directiveRaw = directiveMatch ? directiveMatch[1].trim() : null

          await serviceClient.from('messages').insert({
            conversation_id: conversationId,
            sender_type: 'agent',
            content: text,
            result_items: resultItems,
            metadata: { directive_raw: directiveRaw, tool_results: toolResults }
          })
        }
      }

      if (!isOrcaIntel) {
        // BYO-LLM via OpenRouter
        const openrouter = createOpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY
        })
        return streamText({ ...streamOptions, model: openrouter(modelOverride) })
      }

      // Orca Intelligence: Gemini primary → Groq fallback
      const geminiKey = process.env.GEMINI_API_KEY
      const groqKey = process.env.GROQ_API_KEY

      if (geminiKey) {
        const google = createGoogleGenerativeAI({ apiKey: geminiKey })
        try {
          return await streamText({ ...streamOptions, model: google('gemini-1.5-pro-latest') })
        } catch (geminiErr: any) {
          console.warn('GEMINI_FAILOVER:', geminiErr.message)
          if (!groqKey) throw geminiErr
          console.log('ORCA_INTEL: Switching to Groq fallback')
          const groq = createGroq({ apiKey: groqKey })
          return await streamText({ ...streamOptions, model: groq('llama-3.3-70b-versatile') })
        }
      }

      if (groqKey) {
        const groq = createGroq({ apiKey: groqKey })
        return await streamText({ ...streamOptions, model: groq('llama-3.3-70b-versatile') })
      }

      throw new Error('No AI provider API key configured. Please set GEMINI_API_KEY or GROQ_API_KEY in your Vercel environment variables.')
    }

    const result = await getStreamResult()
    return result.toDataStreamResponse()
  } catch (err: any) {
    console.error('[ORCA_STREAM_ERR]', err?.message, err?.stack)
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
