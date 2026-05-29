export const dynamic = 'force-dynamic'
export const maxDuration = 60
import { streamText, StreamData, generateText } from 'ai'
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
import { parseAndExecuteActions } from '@/lib/agents/parseActions'
import { getAgentMemory } from '@/lib/agents/memory'
import { inngest } from '@/lib/inngest/client'

/** Skip Gemini probe for 2 min after quota/rate-limit failure */
let geminiBlockedUntil = 0

function isQuotaOrRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /quota|rate.?limit|429|exceeded|RESOURCE_EXHAUSTED|limit:\s*0/i.test(msg)
}

async function probeModel(model: Parameters<typeof generateText>[0]['model'], label: string): Promise<boolean> {
  try {
    await generateText({
      model,
      prompt: 'Reply with exactly: ok',
      maxTokens: 8,
      maxRetries: 0,
    })
    return true
  } catch (err: unknown) {
    console.warn(`[ORCA] ${label} probe failed:`, err instanceof Error ? err.message : err)
    if (isQuotaOrRateLimitError(err)) {
      geminiBlockedUntil = Date.now() + 2 * 60 * 1000
    }
    return false
  }
}

function collectTextFromSteps(steps: Array<{ text?: string }>, fallback: string): string {
  const fromSteps = steps.map((s) => s.text?.trim() || '').filter(Boolean).join('\n\n').trim()
  return fallback?.trim() || fromSteps
}

function pickToolsForMode(
  tools: Record<string, unknown>,
  chatMode: string
): Record<string, unknown> | undefined {
  const keys = Object.keys(tools)
  if (keys.length === 0) return undefined

  if (chatMode === 'planning') {
    const planningKeys = ['read_wiki_page', 'list_wiki_pages', 'get_org_analytics']
    const picked = planningKeys.filter((k) => k in tools)
    if (picked.length === 0) return undefined
    return Object.fromEntries(picked.map((k) => [k, tools[k]]))
  }

  return tools
}

async function saveAgentMessage(
  serviceClient: ReturnType<typeof createServiceSupabaseClient>,
  conversationId: string,
  orgId: string,
  agent: { id: string; name: string; acronym: string },
  userId: string,
  rawText: string,
  toolResults: unknown
) {
  const resultMatch = rawText.match(/(?:RESULT|RESULTS|OUTCOME):\s*([\s\S]+?)(?:\n|$)/i)
  const resultItems = resultMatch ? resultMatch[1].split('|').map((s: string) => s.trim()) : []
  const directiveMatch = rawText.match(
    /(?:DIRECTIVE_DOCUMENT|DIRECTIVE|MASTER_DIRECTIVE):\s*([\s\S]+?)(?:\n(?:RESULT|RESULTS|COORDINATION_NEEDED):|$)/i
  )
  const directiveRaw = directiveMatch ? directiveMatch[1].trim() : null

  const { cleanResponse } = await parseAndExecuteActions(rawText, orgId, agent.id, userId)
  const finalContent =
    cleanResponse?.trim() ||
    rawText?.trim() ||
    'The executive completed processing but returned no visible text. Please resend your brief or switch to Automate mode.'

  const { data: insertedMsg, error: insertErr } = await serviceClient
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_type: 'agent',
      content: finalContent,
      result_items: resultItems,
      metadata: {
        directive_raw: directiveRaw,
        tool_results: toolResults,
        agent_name: agent.name,
      },
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('[ORCA] Failed to save agent message:', insertErr.message)
  }

  // Auto-save briefings (non-blocking errors)
  try {
    const wordCount = finalContent.split(/\s+/).filter(Boolean).length
    const hasHeading = /^#{1,6}\s+/m.test(finalContent)
    const bulletMatches = finalContent.match(/^[\s]*[-*+]\s+/gm) || []
    const hasThreeBullets = bulletMatches.length >= 3

    if (wordCount > 500 || hasHeading || hasThreeBullets) {
      const headingMatch = finalContent.match(/^#{1,6}\s+(.+)$/m)
      let title = headingMatch ? headingMatch[1].trim() : ''
      if (!title) {
        title =
          finalContent.substring(0, 60).replace(/[*#_`>]/g, '').trim() || 'Briefing Room Brief'
      }

      const lines = finalContent.split('\n')
      const highlightsList: string[] = []
      const listItemsFirst200Words: string[] = []
      let totalWordsProcessed = 0

      lines.forEach((line: string) => {
        const trimmed = line.trim()
        const words = trimmed.split(/\s+/)
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ')

        if (isBullet) {
          const textContent = trimmed.substring(2).trim()
          const hasPercentageOrCash =
            /[\d%]|[\d\$]/.test(textContent) && (textContent.includes('%') || textContent.includes('$'))
          const hasUrgentWords =
            /\b(urgent|immediately|critical|warning|opportunity|danger|attention)\b/i.test(textContent)
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

      const tasksList: Array<{ title: string; status: string }> = []
      lines.forEach((line: string) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
          const checked = trimmed.startsWith('- [x] ')
          const taskTitle = trimmed.substring(6).trim()
          tasksList.push({ title: taskTitle, status: checked ? 'done' : 'pending' })
        }
      })

      await serviceClient.from('briefings').insert({
        org_id: orgId,
        conversation_id: conversationId,
        message_id: insertedMsg?.id || null,
        agent_name: agent.name,
        agent_acronym: agent.acronym,
        title,
        content: finalContent,
        word_count: wordCount,
        highlights: finalHighlights,
        tasks: tasksList,
        document_type: 'executive_brief',
      })
    }
  } catch (saveErr) {
    console.error('Failed to auto-save briefing:', saveErr)
  }

  try {
    await inngest.send({
      name: 'agent/memory.update',
      data: {
        org_id: orgId,
        agent_id: agent.id,
        conversation_id: conversationId,
      },
    })
  } catch (err) {
    console.error('Failed to trigger memory update event:', err)
  }

  return { finalContent, directiveRaw, resultItems }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params
  const user = await getAuthUser()
  if (!user) return new NextResponse('Unauthorized access', { status: 401 })

  const streamData = new StreamData()

  try {
    const body = await request.json()
    const rawMessages = body.messages || []
    const modelOverride = body.model
    const chatMode = (body.mode || 'planning').toLowerCase()
    const pastedDocumentContent =
      typeof body.pastedDocumentContent === 'string' && body.pastedDocumentContent.trim().length > 0
        ? body.pastedDocumentContent.trim()
        : null
    const lastUserMessage = rawMessages.filter((m: { role: string }) => m.role === 'user').pop()
    const rawContent =
      body.content ||
      lastUserMessage?.content ||
      rawMessages[rawMessages.length - 1]?.content ||
      ''

    const supabase = await createServerSupabaseClient()
    const serviceClient = createServiceSupabaseClient()

    const content = sanitizeInput(rawContent)
    const { data: conversation } = await serviceClient
      .from('conversations')
      .select('org_id, user_id, agent_id')
      .eq('id', conversationId)
      .single()

    if (!conversation) return new NextResponse('Conversation not found: ' + conversationId, { status: 404 })
    if (conversation.user_id !== user.id) return new NextResponse('Unauthorized (Wrong User)', { status: 403 })

    const orgId = conversation.org_id
    const { data: agent } = await serviceClient
      .from('agents')
      .select('*')
      .eq('id', conversation.agent_id)
      .single()
    if (!agent) return new NextResponse('No agent found for this conversation', { status: 400 })

    const { allowed: rlAllowed } = await checkRateLimit(user.id, 'agent_briefs')
    if (!rlAllowed) return new NextResponse('Rate limit exceeded. Please wait a moment.', { status: 429 })

    const { data: company } = await supabase.from('company_identity').select('*').eq('org_id', orgId).single()
    const { data: member } = await supabase
      .from('org_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .single()
    const { data: orgData } = await supabase
      .from('organizations')
      .select('active_template, plan')
      .eq('id', orgId)
      .single()
    const orgPlan = orgData?.plan || 'free'

    const combinedInput = pastedDocumentContent ? `${content}\n\n${pastedDocumentContent}` : content
    const { enforceInputLimit } = await import('@/lib/security/tokenGuard')
    // Attached documents are separate from the typed instruction — only enforce limit on instruction when a doc is attached
    const inputCheck = pastedDocumentContent
      ? enforceInputLimit(content, orgPlan)
      : enforceInputLimit(combinedInput, orgPlan)
    if (!inputCheck.allowed) {
      return new NextResponse(inputCheck.error || 'Message too long for your plan.', { status: 400 })
    }

    const { checkMonthlyBriefQuota } = await import('@/lib/plans/usage')
    const briefQuota = await checkMonthlyBriefQuota(orgId, orgPlan)
    if (!briefQuota.allowed) {
      return new NextResponse(
        `Monthly agent task limit reached (${briefQuota.used}/${briefQuota.limit}). Upgrade your plan to continue.`,
        { status: 403 }
      )
    }

    const { fetchOrgMetrics, formatOrgMetricsForPrompt } = await import('@/lib/analytics/orgMetrics')
    const orgMetrics = await fetchOrgMetrics(orgId)
    const orgMetricsBlock = formatOrgMetricsForPrompt(orgMetrics)

    const { data: integrations } = await supabase
      .from('integrations')
      .select('service_name')
      .eq('org_id', orgId)
    const connectedIntegrations = integrations?.map((i) => i.service_name) || []

    const memoryContext = await getAgentMemory(agent.id, orgId)

    const { data: history } = await supabase
      .from('messages')
      .select('sender_type, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)

    const { data: lastMsg } = await serviceClient
      .from('messages')
      .select('content, created_at')
      .eq('conversation_id', conversationId)
      .eq('sender_type', 'user')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const isDuplicate =
      lastMsg?.content?.trim() === content.trim() &&
      Date.now() - new Date(lastMsg.created_at).getTime() < 30_000

    if (!isDuplicate) {
      await serviceClient.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'user',
        content,
      })
    }

    if (pastedDocumentContent && !isDuplicate) {
      try {
        const docWordCount = pastedDocumentContent.split(/\s+/).filter(Boolean).length
        const firstLine =
          pastedDocumentContent.split('\n').find((l: string) => l.trim())?.trim() || ''
        const docTitle =
          firstLine.replace(/^#{1,6}\s+/, '').slice(0, 80) ||
          `User Document — ${new Date().toISOString().slice(0, 10)}`

        await serviceClient.from('briefings').insert({
          org_id: orgId,
          conversation_id: conversationId,
          agent_name: 'User',
          agent_acronym: 'CEO',
          title: docTitle,
          content: pastedDocumentContent,
          word_count: docWordCount,
          highlights: [],
          tasks: [],
          document_type: 'user_document',
        })
      } catch (docErr) {
        console.error('Failed to save user document briefing:', docErr)
      }
    }

    const documentContextBlock = pastedDocumentContent
      ? `\n\nUSER_UPLOADED_DOCUMENT (reference for this turn only):\n---\n${pastedDocumentContent}\n---\nThe user's message is an instruction about this document. Follow their instruction using the full document above.\n`
      : ''

    const systemPrompt =
      buildAgentSystemPrompt(
        agent,
        company as Parameters<typeof buildAgentSystemPrompt>[1],
        member as Parameters<typeof buildAgentSystemPrompt>[2],
        memoryContext,
        connectedIntegrations,
        chatMode,
        orgData?.active_template,
        orgMetricsBlock
      ) + documentContextBlock

    const allTools = buildToolsForAgent(agent.name, orgId, connectedIntegrations)
    const tools = pickToolsForMode(allTools, chatMode)

    const rawHistory = (history || []).map((m: { sender_type: string; content: string }) => ({
      role: (m.sender_type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: String(m.content || ''),
    }))

    const normalizedHistory = rawHistory.reduce(
      (acc: Array<{ role: 'user' | 'assistant'; content: string }>, msg) => {
        const last = acc[acc.length - 1]
        if (last && last.role === msg.role) {
          last.content = `${last.content}\n\n${msg.content}`
        } else {
          acc.push({ ...msg })
        }
        return acc
      },
      []
    )

    const lastHistoryRole = normalizedHistory[normalizedHistory.length - 1]?.role
    const cleanHistory =
      lastHistoryRole === 'user' ? normalizedHistory.slice(0, -1) : normalizedHistory

    const messages = [...cleanHistory, { role: 'user' as const, content }]

    console.log(
      `[ORCA] stream: agent=${agent.name} mode=${chatMode} msgs=${messages.length} tools=${Object.keys(tools || {}).length}`
    )

    const isOrcaIntel = !modelOverride || modelOverride === 'orca-intel'
    const geminiKey = process.env.GEMINI_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    const streamOptions = {
      system: systemPrompt,
      messages,
      tools,
      maxSteps: chatMode === 'planning' ? 2 : 5,
      onFinish: async ({
        text,
        toolResults,
        steps,
      }: {
        text: string
        toolResults: unknown
        steps: Array<{ text?: string }>
      }) => {
        try {
          let rawText = collectTextFromSteps(steps, text)

          if (!rawText.trim()) {
            console.warn('[ORCA] Empty stream text — running generateText fallback')
            try {
              const fallback = await buildFallbackResult(
                isOrcaIntel,
                modelOverride,
                geminiKey,
                groqKey,
                streamOptions
              )
              rawText = fallback.text
            } catch (fallbackErr: unknown) {
              console.error('[ORCA] Fallback generate failed:', fallbackErr)
              rawText =
                'I hit a processing limit before finishing your brief. Please try again — your message was saved.'
            }
          }

          const saved = await saveAgentMessage(
            serviceClient,
            conversationId,
            orgId,
            agent,
            user.id,
            rawText,
            toolResults
          )

          streamData.append({
            type: 'metadata',
            directive_raw: saved.directiveRaw,
            result_items: saved.resultItems,
            agent_name: agent.name,
            assistant_content: saved.finalContent,
          })
        } catch (finishErr: unknown) {
          console.error('[ORCA] onFinish error:', finishErr)
          streamData.append({
            type: 'metadata',
            agent_name: agent.name,
            assistant_content:
              'Something went wrong while saving the executive response. Please refresh and try again.',
          })
        } finally {
          await streamData.close()
        }
      },
    }

    const result = await buildStreamResult(
      isOrcaIntel,
      modelOverride,
      geminiKey,
      groqKey,
      streamOptions
    )

    return result.toDataStreamResponse({
      data: streamData,
      getErrorMessage: (error) => {
        const msg = error instanceof Error ? error.message : String(error)
        console.error('[ORCA_STREAM_ERR]', msg)
        return msg
      },
    })
  } catch (err: unknown) {
    console.error('[ORCA_STREAM_ERR]', err)
    try {
      await streamData.close()
    } catch {
      /* already closed */
    }
    const message = err instanceof Error ? err.message : 'Unknown stream error'
    return new NextResponse(message, { status: 500 })
  }
}

async function buildStreamResult(
  isOrcaIntel: boolean,
  modelOverride: string | undefined,
  geminiKey: string | undefined,
  groqKey: string | undefined,
  streamOptions: Parameters<typeof streamText>[0]
) {
  if (!isOrcaIntel) {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })
    return streamText({ ...streamOptions, model: openrouter(modelOverride!) })
  }

  const groq = groqKey ? createGroq({ apiKey: groqKey }) : null
  const google = geminiKey ? createGoogleGenerativeAI({ apiKey: geminiKey }) : null
  const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash']

  // streamText() returns immediately — quota errors happen mid-stream, so probe Gemini first
  const geminiCacheValid = Date.now() >= geminiBlockedUntil
  if (google && geminiCacheValid) {
    for (const modelId of geminiModels) {
      const model = google(modelId)
      if (await probeModel(model, `Gemini ${modelId}`)) {
        console.log(`[ORCA] Using Gemini ${modelId}`)
        return streamText({
          ...streamOptions,
          model,
          maxRetries: 0,
          experimental_toolCallStreaming: true,
          onStepFinish: (step) => {
            console.log(`[ORCA_STEP] ${step.stepType} tokens=${step.usage?.completionTokens ?? 0}`)
          },
        })
      }
    }
    geminiBlockedUntil = Date.now() + 2 * 60 * 1000
  } else if (!geminiCacheValid) {
    console.log('[ORCA] Gemini skipped (recent quota/rate-limit failure)')
  }

  if (groq) {
    console.log('[ORCA] Falling back to Groq (llama-3.3-70b-versatile)')
    return streamText({
      ...streamOptions,
      model: groq('llama-3.3-70b-versatile'),
    })
  }

  throw new Error(
    'Gemini quota exceeded and Groq fallback unavailable. Set GROQ_API_KEY in your environment.'
  )
}

async function buildFallbackResult(
  isOrcaIntel: boolean,
  modelOverride: string | undefined,
  geminiKey: string | undefined,
  groqKey: string | undefined,
  options: Parameters<typeof generateText>[0]
) {
  const { onFinish: _omit, onStepFinish: _omit2, ...textOptions } = options as Record<string, unknown>

  if (!isOrcaIntel) {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })
    return generateText({ ...textOptions, model: openrouter(modelOverride!), maxSteps: 1, tools: undefined } as Parameters<typeof generateText>[0])
  }

  const groq = groqKey ? createGroq({ apiKey: groqKey }) : null
  const google = geminiKey ? createGoogleGenerativeAI({ apiKey: geminiKey }) : null

  if (google && Date.now() >= geminiBlockedUntil) {
    for (const modelId of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
      try {
        return await generateText({
          ...textOptions,
          model: google(modelId),
          maxSteps: 1,
          tools: undefined,
          maxRetries: 0,
        } as Parameters<typeof generateText>[0])
      } catch (err: unknown) {
        console.warn(`[ORCA] Fallback Gemini ${modelId} failed:`, err instanceof Error ? err.message : err)
        if (isQuotaOrRateLimitError(err)) {
          geminiBlockedUntil = Date.now() + 2 * 60 * 1000
          break
        }
      }
    }
  }

  if (groq) {
    console.log('[ORCA] Fallback using Groq')
    return generateText({
      ...textOptions,
      model: groq('llama-3.3-70b-versatile'),
      maxSteps: 1,
      tools: undefined,
    } as Parameters<typeof generateText>[0])
  }

  throw new Error('No AI provider available. Set GROQ_API_KEY for failover when Gemini is rate-limited.')
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const serviceClient = createServiceSupabaseClient()
    const { data: conversation } = await serviceClient
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single()
    if (!conversation || conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: messages, error } = await serviceClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(
      { messages },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server Error'
    return NextResponse.json({ error: 'Server Error', details: message }, { status: 500 })
  }
}
