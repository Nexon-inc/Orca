export const dynamic = 'force-dynamic'
export const maxDuration = 60
import { streamText, StreamData, generateText } from 'ai'
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
import { streamTextWithFallback, generateTextWithFallback } from '@/lib/ai/modelRouter'

/** After a Gemini quota/rate-limit hit, skip probe and use Groq briefly */
const GEMINI_BLOCK_MS = 15 * 1000

/** Skip Gemini probe for a short window after quota/rate-limit failure */
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
      geminiBlockedUntil = Date.now() + GEMINI_BLOCK_MS
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
  toolResults: unknown,
  provider?: string,
  model?: string
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
        provider,
        model,
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
    let { data: agent } = await serviceClient
      .from('agents')
      .select('*')
      .eq('id', conversation.agent_id)
      .single()
    if (!agent) return new NextResponse('No agent found for this conversation', { status: 400 })

    // Parse the prompt content for mentions of other executives
    const lowerContent = content.toLowerCase()
    let targetAcronym: string | null = null

    if (lowerContent.includes('@cmo') || lowerContent.includes('/cmo') || /\bcmo\b/.test(lowerContent) || lowerContent.includes('aria') || lowerContent.includes('marketing')) {
      targetAcronym = 'CMO'
    } else if (lowerContent.includes('@cso') || lowerContent.includes('/cso') || /\bcso\b/.test(lowerContent) || lowerContent.includes('rex') || lowerContent.includes('sales')) {
      targetAcronym = 'CSO'
    } else if (lowerContent.includes('@cco') || lowerContent.includes('/cco') || /\bcco\b/.test(lowerContent) || lowerContent.includes('purity') || lowerContent.includes('customer success') || /\bcs\b/.test(lowerContent)) {
      targetAcronym = 'CCO'
    } else if (lowerContent.includes('@cio') || lowerContent.includes('/cio') || /\bcio\b/.test(lowerContent) || lowerContent.includes('roman') || lowerContent.includes('intel') || lowerContent.includes('intelligence')) {
      targetAcronym = 'CIO'
    } else if (lowerContent.includes('@cto') || lowerContent.includes('/cto') || /\bcto\b/.test(lowerContent) || lowerContent.includes('ghost') || lowerContent.includes('tech') || lowerContent.includes('technology')) {
      targetAcronym = 'CTO'
    } else if (lowerContent.includes('@ceo') || lowerContent.includes('/ceo') || /\bceo\b/.test(lowerContent) || lowerContent.includes('atlas') || lowerContent.includes('ops') || lowerContent.includes('operations')) {
      targetAcronym = 'CEO'
    }

    if (targetAcronym && agent.acronym !== targetAcronym) {
      const { data: newAgent } = await serviceClient
        .from('agents')
        .select('*')
        .eq('org_id', orgId)
        .eq('acronym', targetAcronym)
        .single()
        
      if (newAgent) {
        await serviceClient
          .from('conversations')
          .update({ agent_id: newAgent.id })
          .eq('id', conversationId)
        
        agent = newAgent
      }
    }

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

    // Fetch BCP Spec from Shared Org Wiki Memory
    let bcpConfig = null
    try {
      const { data: bcpMemory } = await serviceClient
        .from('llm_memories')
        .select('memory_data')
        .eq('org_id', orgId)
        .eq('agent_id', '00000000-0000-0000-0000-000000000000')
        .maybeSingle()

      const wikiPages = (bcpMemory as any)?.memory_data?.wiki_pages || {}
      const businessProtocolPage = wikiPages['business_protocol'] || wikiPages['business_protocol_spec']
      if (businessProtocolPage?.content) {
        const { parseBcpMarkdown } = await import('@/lib/agents/bcpParser')
        bcpConfig = parseBcpMarkdown(businessProtocolPage.content)
      }
    } catch (bcpErr) {
      console.warn('[BCP] Failed to load/parse BCP config:', bcpErr)
    }

    let bcpBlock = ''
    if (bcpConfig) {
      bcpBlock = `\n\nBUSINESS_CONTEXT_PROTOCOL (BCP):\n---\n`
      if (bcpConfig.domain) bcpBlock += `Organization Domain: ${bcpConfig.domain}\n`
      if (bcpConfig.metrics) bcpBlock += `Metrics Endpoint: ${bcpConfig.metrics}\n`
      
      const currentAgentAcronym = agent.acronym
      const deptKey = Object.keys(bcpConfig.departments).find(k => 
        k.toLowerCase().includes(currentAgentAcronym.toLowerCase()) || 
        currentAgentAcronym.toLowerCase().includes(k.toLowerCase())
      )
      if (deptKey) {
        const dept = bcpConfig.departments[deptKey]
        bcpBlock += `Your Role Context (${dept.name}):\n`
        if (dept.resources && dept.resources.length > 0) {
          bcpBlock += `- Accessible Resources: ${dept.resources.join(', ')}\n`
        }
        if (dept.tools && dept.tools.length > 0) {
          bcpBlock += `- Bound Tools: ${dept.tools.join(', ')}\n`
        }
      }
      
      if (bcpConfig.workflows && Object.keys(bcpConfig.workflows).length > 0) {
        bcpBlock += `Active Workflows:\n`
        for (const [wfName, wf] of Object.entries(bcpConfig.workflows)) {
          bcpBlock += `Workflow "${wfName}":\n`
          if (wf.steps) {
            wf.steps.forEach((s: any) => {
              bcpBlock += `  Step ${s.step}. [${s.department}] ${s.action}\n`
            })
          }
        }
      }
      bcpBlock += `---\n`
    }

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
      ) + documentContextBlock + bcpBlock

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

    let selectedProvider = 'nvidia'
    let selectedModel = ''

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
                streamOptions,
                agent.name,
                orgId
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
            toolResults,
            selectedProvider,
            selectedModel
          )

          streamData.append({
            type: 'metadata',
            directive_raw: saved.directiveRaw,
            result_items: saved.resultItems,
            agent_name: agent.name,
            assistant_content: saved.finalContent,
            provider: selectedProvider,
            model: selectedModel,
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
      streamOptions,
      agent.name,
      orgId,
      (selected) => {
        selectedProvider = selected.provider
        selectedModel = selected.model
        streamData.append({
          type: 'metadata',
          provider: selected.provider,
          model: selected.model,
        })
      }
    )

    return result.toDataStreamResponse({
      data: streamData,
      getErrorMessage: (error: any) => {
        const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
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
  streamOptions: Parameters<typeof streamText>[0],
  agentName: string,
  orgId: string,
  onSelected: (selected: { provider: string; model: string }) => void
) {
  if (!isOrcaIntel) {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })
    const modelId = modelOverride || 'openai/gpt-4o'
    onSelected({ provider: 'openrouter', model: modelId })
    return streamText({ ...streamOptions, model: openrouter(modelId) })
  }

  return streamTextWithFallback({
    orgId,
    agentName,
    systemPrompt: streamOptions.system!,
    messages: streamOptions.messages,
    tools: streamOptions.tools,
    maxSteps: streamOptions.maxSteps!,
    onFinish: streamOptions.onFinish!,
    onSelected,
  })
}

async function buildFallbackResult(
  isOrcaIntel: boolean,
  modelOverride: string | undefined,
  geminiKey: string | undefined,
  groqKey: string | undefined,
  options: Parameters<typeof generateText>[0],
  agentName: string,
  orgId: string
) {
  const { onFinish: _omit, onStepFinish: _omit2, ...textOptions } = options as Record<string, unknown>

  if (!isOrcaIntel) {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })
    return generateText({ ...textOptions, model: openrouter(modelOverride!), maxSteps: 1, tools: undefined } as Parameters<typeof generateText>[0])
  }

  return generateTextWithFallback({
    orgId,
    agentName,
    systemPrompt: textOptions.system as string || textOptions.prompt as string || '',
    messages: textOptions.messages as any[],
  })
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
