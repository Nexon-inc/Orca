export const dynamic = 'force-dynamic'
export const maxDuration = 60
import { streamText, createDataStreamResponse } from 'ai'
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: conversationId } = await params
  const user = await getAuthUser()
  if (!user) return new NextResponse('Unauthorized access', { status: 401 })

  try {
    const body = await request.json()
    const rawMessages = body.messages || []
    const modelOverride = body.model
    const chatMode = body.mode || 'planning'
    const pastedDocumentContent =
      typeof body.pastedDocumentContent === 'string' && body.pastedDocumentContent.trim().length > 0
        ? body.pastedDocumentContent.trim()
        : null
    const lastUserMessage = rawMessages.filter((m: any) => m.role === 'user').pop()
    const rawContent = body.content || lastUserMessage?.content || rawMessages[rawMessages.length - 1]?.content || ''
    
    const supabase = await createServerSupabaseClient()
    const serviceClient = createServiceSupabaseClient()

    // 1. Sanitize & Fetch Context
    const content = sanitizeInput(rawContent)
    const { data: conversation } = await serviceClient
      .from('conversations')
      .select('org_id, user_id, agent_id')
      .eq('id', conversationId)
      .single()

    if (!conversation) return new NextResponse('Conversation not found: ' + conversationId, { status: 404 })
    if (conversation.user_id !== user.id) return new NextResponse('Unauthorized (Wrong User)', { status: 403 })

    const orgId = conversation.org_id
    const { data: agent } = await serviceClient.from('agents').select('*').eq('id', conversation.agent_id).single()
    if (!agent) return new NextResponse('No agent found for this conversation', { status: 400 })

    // 2. Security & Rate Limiting
    const { allowed: rlAllowed } = await checkRateLimit(user.id, 'agent_briefs')
    if (!rlAllowed) return new NextResponse('Rate limit exceeded. Please wait a moment.', { status: 429 })

    // 3. Fetch Company & Member Data
    const { data: company } = await supabase.from('company_identity').select('*').eq('org_id', orgId).single()
    const { data: member } = await supabase.from('org_members').select('*').eq('user_id', user.id).eq('org_id', orgId).single()
    const { data: orgData } = await supabase.from('organizations').select('active_template, plan').eq('id', orgId).single()
    const orgPlan = orgData?.plan || 'free'

    const { enforceInputLimit } = await import('@/lib/security/tokenGuard')
    const inputCheck = enforceInputLimit(content, orgPlan)
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

    const { data: integrations } = await supabase.from('integrations').select('service_name').eq('org_id', orgId)
    const connectedIntegrations = integrations?.map(i => i.service_name) || []

    // 4. Memory Context — Dynamic retrieval from past operations
    const memoryContext = await getAgentMemory(agent.id, orgId)

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
      (Date.now() - new Date(lastMsg.created_at).getTime()) < 30_000

    if (!isDuplicate) {
      await serviceClient.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'user',
        content: content
      })
    }

    // Save pasted long-form document to Briefing Room vault
    if (pastedDocumentContent && !isDuplicate) {
      try {
        const docWordCount = pastedDocumentContent.split(/\s+/).filter(Boolean).length
        const firstLine = pastedDocumentContent.split('\n').find((l: string) => l.trim())?.trim() || ''
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

    // 7. Prepare Prompt & Tools — DB history is the ONLY source of truth
    const systemPrompt =
      buildAgentSystemPrompt(agent, company as any, member as any, memoryContext, connectedIntegrations, chatMode, orgData?.active_template, orgMetricsBlock) +
      documentContextBlock
    const tools = buildToolsForAgent(agent.name, orgId, connectedIntegrations)

    const rawHistory = (history || []).map((m: any) => ({
      role: (m.sender_type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: String(m.content || '')
    }))

    const normalizedHistory = rawHistory.reduce((acc: any[], msg: any) => {
      const last = acc[acc.length - 1]
      if (last && last.role === msg.role) {
        last.content = `${last.content}\n\n${msg.content}`
      } else {
        acc.push({ ...msg })
      }
      return acc
    }, [])

    const lastHistoryRole = normalizedHistory[normalizedHistory.length - 1]?.role
    const cleanHistory = lastHistoryRole === 'user'
      ? normalizedHistory.slice(0, -1)
      : normalizedHistory

    const messages = [
      ...cleanHistory,
      { role: 'user' as const, content }
    ]

    console.log(`[ORCA] messages to streamText: ${messages.length} (${messages.map((m: any) => m.role).join(',')})`)

    // 8. Model Selection with Runtime Failover for Orca Intelligence
    const isOrcaIntel = !modelOverride || modelOverride === 'orca-intel'

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const geminiKey = process.env.GEMINI_API_KEY
        const groqKey = process.env.GROQ_API_KEY

        const streamOptions = {
          system: systemPrompt,
          // @ts-ignore
          messages,
          tools: Object.keys(tools).length > 0 ? tools : undefined,
          maxSteps: 5,
          onFinish: async ({ text, toolResults }: { text: string; toolResults: any }) => {
            // Flexible regex for Directive and Result
            const resultMatch = text.match(/(?:RESULT|RESULTS|OUTCOME):\s*([\s\S]+?)(?:\n|$)/i)
            const resultItems = resultMatch ? resultMatch[1].split('|').map((s: string) => s.trim()) : []
            const directiveMatch = text.match(/(?:DIRECTIVE_DOCUMENT|DIRECTIVE|MASTER_DIRECTIVE):\s*([\s\S]+?)(?:\n(?:RESULT|RESULTS|COORDINATION_NEEDED):|$)/i)
            const directiveRaw = directiveMatch ? directiveMatch[1].trim() : null

            const { cleanResponse } = await parseAndExecuteActions(text, orgId, agent.id, user.id)

            // Send to DB
            const { data: insertedMsg } = await serviceClient.from('messages').insert({
              conversation_id: conversationId,
              sender_type: 'agent',
              content: cleanResponse,
              result_items: resultItems,
              metadata: { 
                directive_raw: directiveRaw, 
                tool_results: toolResults,
                agent_name: agent.name 
              }
            }).select('id').single()

            // Feature 1 Auto-save briefings
            try {
              const wordCount = cleanResponse.split(/\s+/).filter(Boolean).length;
              const hasHeading = /^#{1,6}\s+/m.test(cleanResponse);
              const bulletMatches = cleanResponse.match(/^[\s]*[-*+]\s+/gm) || [];
              const hasThreeBullets = bulletMatches.length >= 3;

              if (wordCount > 500 || hasHeading || hasThreeBullets) {
                // Extract first heading as title
                const headingMatch = cleanResponse.match(/^#{1,6}\s+(.+)$/m);
                let title = headingMatch ? headingMatch[1].trim() : '';
                if (!title) {
                  title = cleanResponse.substring(0, 60).replace(/[*#_`>]/g, '').trim() || 'Briefing Room Brief';
                }

                // Extract highlights
                const lines = cleanResponse.split('\n');
                const highlightsList: string[] = [];
                const listItemsFirst200Words: string[] = [];
                let totalWordsProcessed = 0;

                lines.forEach((line: string) => {
                  const trimmed = line.trim();
                  const words = trimmed.split(/\s+/);
                  const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');

                  if (isBullet) {
                    const textContent = trimmed.substring(2).trim();
                    const hasPercentageOrCash = /[\d%]|[\d\$]/.test(textContent) && (textContent.includes('%') || textContent.includes('$'));
                    const hasUrgentWords = /\b(urgent|immediately|critical|warning|opportunity|danger|attention)\b/i.test(textContent);
                    const isFirst200 = totalWordsProcessed < 200;

                    if (hasPercentageOrCash || hasUrgentWords) {
                      highlightsList.push(textContent);
                    } else if (isFirst200) {
                      listItemsFirst200Words.push(textContent);
                    }
                  }
                  if (trimmed !== '') {
                    totalWordsProcessed += words.length;
                  }
                });
                const finalHighlights = [...new Set([...highlightsList, ...listItemsFirst200Words])].slice(0, 5);

                // Extract tasks
                const tasksList: any[] = [];
                lines.forEach((line: string) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
                    const checked = trimmed.startsWith('- [x] ');
                    const taskTitle = trimmed.substring(6).trim();
                    tasksList.push({ title: taskTitle, status: checked ? 'done' : 'pending' });
                  }
                });

                await serviceClient.from('briefings').insert({
                  org_id: orgId,
                  conversation_id: conversationId,
                  message_id: insertedMsg?.id || null,
                  agent_name: agent.name,
                  agent_acronym: agent.acronym,
                  title: title,
                  content: cleanResponse,
                  word_count: wordCount,
                  highlights: finalHighlights,
                  tasks: tasksList,
                  document_type: 'executive_brief'
                });
              }
            } catch (saveErr) {
              console.error('Failed to auto-save briefing:', saveErr);
            }

            // Trigger background memory update event to compact conversation history into Markdown
            try {
              await inngest.send({
                name: 'agent/memory.update',
                data: {
                  org_id: orgId,
                  agent_id: agent.id,
                  conversation_id: conversationId
                }
              })
            } catch (err) {
              console.error('Failed to trigger memory update event:', err)
            }

            // Send to Client via dataStream writeData (replaces StreamData.append)
            dataStream.writeData({
              type: 'metadata',
              directive_raw: directiveRaw,
              result_items: resultItems,
              agent_name: agent.name
            })
          }
        }

        const getStream = async () => {
          if (!isOrcaIntel) {
            const openrouter = createOpenAI({
              baseURL: 'https://openrouter.ai/api/v1',
              apiKey: process.env.OPENROUTER_API_KEY
            })
            return streamText({ ...streamOptions, model: openrouter(modelOverride) })
          }

          if (geminiKey) {
            const google = createGoogleGenerativeAI({ apiKey: geminiKey })
            try {
              return await streamText({ 
                ...streamOptions, 
                model: google('gemini-2.5-flash'),
                experimental_toolCallStreaming: true,
                onStepFinish: (step) => {
                  console.log(`[ORCA_STEP] ${step.stepType} (tokens: ${step.usage.completionTokens})`)
                }
              })
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

          throw new Error('No AI provider API key configured.')
        }

        try {
          const result = await getStream()
          result.mergeIntoDataStream(dataStream)
        } catch (streamErr: any) {
          console.error('[ORCA_ASYNC_STREAM_ERR]', streamErr?.message)
          dataStream.writeMessageAnnotation({ error: String(streamErr?.message || streamErr) })
        }
      }
    })
  } catch (err: any) {
    console.error('[ORCA_STREAM_ERR]', err?.message, err?.stack)
    return new NextResponse(err.message || 'Unknown stream error', { status: 500 })
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

    return NextResponse.json({ messages }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server Error', details: err.message }, { status: 500 })
  }
}
