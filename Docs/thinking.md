# ORCA — Executive Streaming & Real Actions
## streaming.md · Complete implementation for Antigravity
### This makes executives show their work in real time, take real actions, and feel alive

---

## THE PROBLEM WE ARE SOLVING

Right now users brief an executive and see a spinner for 10+ seconds then
get a wall of text. They have no idea what is happening. The executive feels
like a chatbot, not a team member.

What we want instead: the user briefs ARIA and immediately sees:

```
ARIA (CMO) is working on your brief...

🔍 Searching: "best LinkedIn post formats for SaaS founders 2026"
✓ Found 8 relevant results

🔍 Scraping: linkedin.com/pulse/viral-saas-content-guide
✓ Extracted content strategy data

✍️ Drafting 5 LinkedIn posts...
▋ (text streaming in word by word)
```

This is what makes ORCA feel like a real executive team, not a chatbot wrapper.

---

## PART 1 — INSTALL THE RIGHT PACKAGES

```bash
npm install ai @ai-sdk/openai @ai-sdk/google @ai-sdk/groq zod
```

The Vercel AI SDK is the foundation for everything in this file.
It handles streaming, tool calls, and the UI hooks that show live progress.

---

## PART 2 — THE BACKEND API ROUTE

### Replace the current message handler with this streaming version

**File: `app/api/conversations/[id]/messages/route.ts`**

```typescript
import { streamText, tool } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildAgentSystemPrompt } from '@/lib/agents/prompt'
import { tavilySearch } from '@/lib/tools/tavily'
import { scrapeUrl, crawlWebsite } from '@/lib/tools/firecrawl'
import { executeViaComposio } from '@/lib/agents/composio'
import { NextResponse } from 'next/server'

// OpenRouter as the unified AI gateway
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://orca-sigma.vercel.app',
    'X-Title': 'ORCA Company OS',
  },
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, attachments } = await request.json()
  const conversationId = params.id

  // Load conversation with agent and company context
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      *,
      agents(*, departments(*)),
      organizations(*, company_identity(*))
    `)
    .eq('id', conversationId)
    .single()

  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const agent = conversation.agents
  const company = conversation.organizations.company_identity
  const member = await getOrgMember(supabase, user.id, conversation.org_id)

  // Get connected integrations for this org
  const { data: integrations } = await supabase
    .from('integrations')
    .select('service_name')
    .eq('org_id', conversation.org_id)
    .eq('status', 'connected')

  const connectedServices = integrations?.map(i => i.service_name) || []

  // Load conversation history
  const { data: previousMessages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20)

  // Save user message
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    org_id: conversation.org_id,
    role: 'user',
    content,
    attachments: attachments || null,
  })

  // Build the system prompt
  const systemPrompt = buildAgentSystemPrompt(
    agent,
    company,
    member,
    undefined, // memory
    connectedServices
  )

  // Build message history for the AI
  const messages = [
    ...(previousMessages || []).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content },
  ]

  // Select model based on task complexity and org plan
  const model = selectModel(conversation.organizations.plan, agent.name)

  // ─────────────────────────────────────────────
  // DEFINE TOOLS — what each executive can DO
  // ─────────────────────────────────────────────
  const executiveTools = buildToolsForAgent(agent.name, conversation.org_id, connectedServices)

  // ─────────────────────────────────────────────
  // STREAM THE RESPONSE
  // ─────────────────────────────────────────────
  const result = streamText({
    model: openrouter(model),
    system: systemPrompt,
    messages,
    tools: executiveTools,
    maxSteps: 10, // allows multiple tool call rounds
    onStepFinish: async ({ text, toolCalls, toolResults, finishReason, usage }) => {
      // Save each step to DB for audit trail
      if (toolCalls && toolCalls.length > 0) {
        await supabase.from('agent_actions').insert(
          toolCalls.map(tc => ({
            conversation_id: conversationId,
            org_id: conversation.org_id,
            agent_name: agent.name,
            tool_name: tc.toolName,
            tool_input: tc.args,
            status: 'executed',
          }))
        )
      }
    },
    onFinish: async ({ text, toolCalls, toolResults, usage }) => {
      // Save final assistant message
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        org_id: conversation.org_id,
        role: 'assistant',
        content: text,
        agent_name: agent.name,
        tokens_used: usage?.totalTokens || 0,
      })

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    },
  })

  // Return the stream to the frontend
  return result.toDataStreamResponse()
}

// ─────────────────────────────────────────────
// MODEL SELECTION
// ─────────────────────────────────────────────
function selectModel(plan: string, agentName: string): string {
  // Atlas gets the smartest model — she's running the company
  if (agentName === 'Atlas') return 'google/gemini-2.5-pro'
  
  // Pro plan gets premium models
  if (plan === 'pro') return 'google/gemini-2.5-pro'
  
  // Builder plan gets fast capable models
  if (plan === 'builder') return 'google/gemini-2.0-flash'
  
  // Free plan gets efficient models
  return 'meta-llama/llama-3.3-70b-instruct'
}

// ─────────────────────────────────────────────
// TOOLS — what executives can actually DO
// ─────────────────────────────────────────────
function buildToolsForAgent(
  agentName: string,
  orgId: string,
  connectedServices: string[]
) {
  const tools: Record<string, any> = {}

  // ── RESEARCH TOOLS (Aria + Roman have these) ──
  if (['Aria', 'Roman', 'Atlas', 'Rex'].includes(agentName)) {
    
    tools.search_web = tool({
      description: 'Search the internet for current information, trends, competitor data, market signals, or any real-world information needed to complete this task.',
      parameters: z.object({
        query: z.string().describe('The search query. Be specific and targeted.'),
        purpose: z.string().describe('Why you are searching — what you expect to find'),
      }),
      execute: async ({ query, purpose }) => {
        const results = await tavilySearch(query)
        return {
          query,
          results: results.slice(0, 5).map(r => ({
            title: r.title,
            url: r.url,
            content: r.content.slice(0, 500),
          })),
        }
      },
    })

    tools.scrape_webpage = tool({
      description: 'Read the full content of a specific webpage. Use after searching to get the complete details of a relevant result.',
      parameters: z.object({
        url: z.string().url().describe('The URL to scrape'),
        reason: z.string().describe('What you expect to extract from this page'),
      }),
      execute: async ({ url, reason }) => {
        const content = await scrapeUrl(url)
        return { url, content: content.slice(0, 3000) }
      },
    })
  }

  // ── MARKETING TOOLS (Aria) ──
  if (agentName === 'Aria') {

    if (connectedServices.includes('linkedin')) {
      tools.post_to_linkedin = tool({
        description: 'Publish a post to the company LinkedIn page. Only use when the user has explicitly approved the content.',
        parameters: z.object({
          content: z.string().describe('The LinkedIn post content'),
          visibility: z.enum(['public', 'connections']).default('public'),
        }),
        execute: async ({ content, visibility }) => {
          const result = await executeViaComposio(orgId, 'LINKEDIN_CREATE_POST', {
            text: content,
            visibility,
          })
          return { posted: true, platform: 'LinkedIn', result }
        },
      })
    }

    if (connectedServices.includes('twitter')) {
      tools.post_to_twitter = tool({
        description: 'Post a tweet or X post. Only use when the user has explicitly approved the content.',
        parameters: z.object({
          content: z.string().max(280).describe('Tweet content, max 280 characters'),
        }),
        execute: async ({ content }) => {
          const result = await executeViaComposio(orgId, 'TWITTER_CREATE_TWEET', {
            text: content,
          })
          return { posted: true, platform: 'X/Twitter', result }
        },
      })
    }

    if (connectedServices.includes('brevo')) {
      tools.send_email_campaign = tool({
        description: 'Send an email campaign via Brevo to the subscriber list.',
        parameters: z.object({
          subject: z.string(),
          htmlContent: z.string(),
          listIds: z.array(z.number()).describe('Brevo list IDs to send to'),
          senderName: z.string(),
          senderEmail: z.string(),
        }),
        execute: async (params) => {
          const result = await executeViaComposio(orgId, 'BREVO_SEND_EMAIL', params)
          return { sent: true, platform: 'Brevo', result }
        },
      })
    }
  }

  // ── SALES TOOLS (Rex) ──
  if (agentName === 'Rex') {

    if (connectedServices.includes('hubspot')) {
      tools.create_hubspot_contact = tool({
        description: 'Create a new contact in HubSpot CRM when a new lead is identified.',
        parameters: z.object({
          email: z.string().email(),
          firstname: z.string(),
          lastname: z.string().optional(),
          company: z.string().optional(),
          jobtitle: z.string().optional(),
          linkedin_url: z.string().optional(),
          lead_source: z.string().default('ORCA Research'),
        }),
        execute: async (params) => {
          const result = await executeViaComposio(orgId, 'HUBSPOT_CREATE_CONTACT', params)
          return { created: true, platform: 'HubSpot', contact: params.email }
        },
      })

      tools.create_hubspot_deal = tool({
        description: 'Create a deal in HubSpot CRM pipeline for a qualified opportunity.',
        parameters: z.object({
          dealname: z.string(),
          amount: z.number().optional(),
          dealstage: z.string().default('appointmentscheduled'),
          contact_email: z.string().email().optional(),
        }),
        execute: async (params) => {
          const result = await executeViaComposio(orgId, 'HUBSPOT_CREATE_DEAL', params)
          return { created: true, platform: 'HubSpot', deal: params.dealname }
        },
      })
    }

    tools.find_leads = tool({
      description: 'Research and compile a list of potential leads matching the ICP by searching the web.',
      parameters: z.object({
        icp_description: z.string().describe('Who we are looking for'),
        industry: z.string(),
        company_size: z.string().optional(),
        location: z.string().optional(),
        count: z.number().min(1).max(20).default(10),
      }),
      execute: async ({ icp_description, industry, company_size, location, count }) => {
        const query = `${icp_description} ${industry} ${company_size || ''} ${location || ''} startup founders LinkedIn site:linkedin.com/in`
        const results = await tavilySearch(query)
        return {
          query,
          leads_found: results.slice(0, count).map(r => ({
            name: r.title,
            url: r.url,
            snippet: r.content.slice(0, 200),
          })),
        }
      },
    })
  }

  // ── CUSTOMER SUCCESS TOOLS (Purity) ──
  if (agentName === 'Purity') {

    if (connectedServices.includes('slack')) {
      tools.send_slack_message = tool({
        description: 'Send a message to a Slack channel for team alerts or customer notifications.',
        parameters: z.object({
          channel: z.string().describe('Channel name like #general or #customer-success'),
          message: z.string(),
        }),
        execute: async ({ channel, message }) => {
          const result = await executeViaComposio(orgId, 'SLACK_SEND_MESSAGE', {
            channel,
            text: message,
          })
          return { sent: true, channel }
        },
      })
    }

    if (connectedServices.includes('gmail')) {
      tools.send_customer_email = tool({
        description: 'Send a transactional or support email to a customer.',
        parameters: z.object({
          to: z.string().email(),
          subject: z.string(),
          body: z.string().describe('Email body in plain text'),
        }),
        execute: async ({ to, subject, body }) => {
          const result = await executeViaComposio(orgId, 'GMAIL_SEND_EMAIL', {
            to,
            subject,
            body,
          })
          return { sent: true, to, subject }
        },
      })
    }
  }

  // ── INTELLIGENCE TOOLS (Roman) ──
  if (agentName === 'Roman') {
    
    tools.research_competitor = tool({
      description: 'Do a deep research on a competitor — crawl their website, pricing page, and recent content to build a competitive intelligence report.',
      parameters: z.object({
        competitor_name: z.string(),
        competitor_url: z.string().url(),
        focus: z.enum(['pricing', 'features', 'content_strategy', 'team', 'full']).default('full'),
      }),
      execute: async ({ competitor_name, competitor_url, focus }) => {
        const pages = await crawlWebsite(competitor_url, 5)
        return {
          competitor: competitor_name,
          pages_analyzed: pages.length,
          data: pages.map(p => ({
            url: p.url,
            content: p.markdown.slice(0, 1000),
          })),
        }
      },
    })

    if (connectedServices.includes('notion')) {
      tools.save_to_notion = tool({
        description: 'Save a research report or intelligence brief to Notion.',
        parameters: z.object({
          title: z.string(),
          content: z.string().describe('Markdown content to save'),
          database_id: z.string().optional(),
        }),
        execute: async ({ title, content, database_id }) => {
          const result = await executeViaComposio(orgId, 'NOTION_CREATE_PAGE', {
            title,
            content,
          })
          return { saved: true, platform: 'Notion', title }
        },
      })
    }
  }

  // ── TECH TOOLS (Ghost) ──
  if (agentName === 'Ghost') {

    if (connectedServices.includes('github')) {
      tools.create_github_pr = tool({
        description: 'Create a GitHub Pull Request with generated code or a security fix.',
        parameters: z.object({
          repo: z.string().describe('Repository name e.g. "orca-sigma"'),
          title: z.string(),
          branch: z.string().describe('New branch name e.g. "fix/sql-injection"'),
          base: z.string().default('main'),
          body: z.string().describe('PR description in markdown'),
          files: z.array(z.object({
            path: z.string().describe('File path e.g. "app/api/users/route.ts"'),
            content: z.string().describe('Complete file content'),
          })),
        }),
        execute: async ({ repo, title, branch, base, body, files }) => {
          const result = await executeViaComposio(orgId, 'GITHUB_CREATE_PULL_REQUEST', {
            repo, title, branch, base, body,
          })
          return {
            created: true,
            platform: 'GitHub',
            pr_title: title,
            files_changed: files.length,
          }
        },
      })
    }

    if (connectedServices.includes('vercel')) {
      tools.trigger_deployment = tool({
        description: 'Trigger a Vercel deployment for a project.',
        parameters: z.object({
          project_name: z.string(),
          environment: z.enum(['production', 'preview']).default('preview'),
        }),
        execute: async ({ project_name, environment }) => {
          const result = await executeViaComposio(orgId, 'VERCEL_CREATE_DEPLOYMENT', {
            projectName: project_name,
            target: environment,
          })
          return { deployed: true, project: project_name, environment }
        },
      })
    }

    tools.security_scan = tool({
      description: 'Scan a codebase or specific file for security vulnerabilities by analyzing the code structure.',
      parameters: z.object({
        code: z.string().describe('The code to scan for vulnerabilities'),
        language: z.string().describe('Programming language'),
        file_path: z.string().optional(),
      }),
      execute: async ({ code, language, file_path }) => {
        // Ghost analyzes the code internally via its LLM capabilities
        // This tool signals to the UI that a scan is happening
        return {
          scanned: true,
          file: file_path || 'provided code',
          language,
          scan_complete: true,
          // Ghost will produce the actual findings in its response text
        }
      },
    })
  }

  // ── ATLAS TOOLS (AI CEO) ──
  if (agentName === 'Atlas') {

    tools.research_business_opportunity = tool({
      description: 'Research a new business opportunity, market trend, or growth idea by searching the web and analyzing current market conditions.',
      parameters: z.object({
        topic: z.string().describe('The opportunity or market to research'),
        questions: z.array(z.string()).describe('Specific questions to answer'),
      }),
      execute: async ({ topic, questions }) => {
        const results = await Promise.all(
          questions.map(q => tavilySearch(`${topic} ${q}`))
        )
        return {
          topic,
          research: questions.map((q, i) => ({
            question: q,
            findings: results[i].slice(0, 2).map(r => ({
              title: r.title,
              content: r.content.slice(0, 400),
              source: r.url,
            })),
          })),
        }
      },
    })

    tools.analyze_company_health = tool({
      description: 'Analyze the current health and performance of the company by reviewing recent activity across all departments.',
      parameters: z.object({
        time_period: z.string().default('last 7 days'),
      }),
      execute: async ({ time_period }) => {
        const supabase = createServerSupabaseClient()
        const [briefs, actions, approvals] = await Promise.all([
          supabase.from('messages').select('agent_name, created_at', { count: 'exact' })
            .eq('role', 'assistant').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('agent_actions').select('agent_name, tool_name', { count: 'exact' })
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('pending_briefs').select('status', { count: 'exact' }),
        ])
        return {
          period: time_period,
          briefs_completed: briefs.count || 0,
          actions_taken: actions.count || 0,
          pending_approvals: approvals.count || 0,
        }
      },
    })
  }

  return tools
}
```

---

## PART 3 — THE FRONTEND — Show every step in real time

### Install the AI SDK UI hook

```bash
npm install @ai-sdk/react
```

### Replace the chat message component

**File: `components/chat/ExecutiveChat.tsx`**

```typescript
'use client'
import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'

interface ExecutiveChatProps {
  conversationId: string
  agentName: string
  agentRole: string  // 'CMO' | 'CSO' etc.
  agentEmoji: string
}

// Tool call display names — what users see instead of technical names
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  search_web: '🔍 Searching the web',
  scrape_webpage: '📄 Reading webpage',
  post_to_linkedin: '📤 Publishing to LinkedIn',
  post_to_twitter: '📤 Publishing to X/Twitter',
  send_email_campaign: '📧 Sending email campaign',
  create_hubspot_contact: '👤 Adding contact to CRM',
  create_hubspot_deal: '💼 Creating deal in CRM',
  find_leads: '🔎 Researching leads',
  send_slack_message: '💬 Sending Slack message',
  send_customer_email: '📧 Sending customer email',
  research_competitor: '🕵️ Researching competitor',
  save_to_notion: '📝 Saving to Notion',
  create_github_pr: '🔧 Opening GitHub PR',
  trigger_deployment: '🚀 Triggering deployment',
  security_scan: '🛡️ Running security scan',
  research_business_opportunity: '💡 Researching opportunity',
  analyze_company_health: '📊 Analyzing company health',
}

export function ExecutiveChat({
  conversationId,
  agentName,
  agentRole,
  agentEmoji,
}: ExecutiveChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: `/api/conversations/${conversationId}/messages`,
    id: conversationId,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      
      {/* Message thread */}
      <div className="flex-1 overflow-y-auto space-y-6 p-6">
        {messages.map(message => (
          <div key={message.id}>
            
            {/* User message */}
            {message.role === 'user' && (
              <div className="flex justify-end">
                <div className="max-w-[70%] px-5 py-3 bg-surface-container-high 
                               border border-outline-variant/10 rounded-lg text-sm 
                               text-on-surface font-body leading-relaxed">
                  {message.content}
                </div>
              </div>
            )}

            {/* Executive message with tool calls */}
            {message.role === 'assistant' && (
              <div className="flex gap-4">
                
                {/* Executive identifier */}
                <div className="flex-shrink-0 pt-1">
                  <div className="text-[9px] font-black font-mono text-primary-container/60 
                                 uppercase tracking-widest">
                    {agentEmoji} {agentRole}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  
                  {/* Executive name header */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black font-headline text-on-surface 
                                   uppercase tracking-wider">
                      {agentName}
                    </span>
                    <span className="text-[9px] font-mono text-primary-container/60 uppercase">
                      {agentRole}
                    </span>
                  </div>

                  {/* Tool calls — shown WHILE they are happening */}
                  {message.parts?.map((part, i) => {
                    
                    // Tool call in progress
                    if (part.type === 'tool-invocation') {
                      const toolCall = part.toolInvocation
                      const displayName = TOOL_DISPLAY_NAMES[toolCall.toolName] || toolCall.toolName
                      
                      return (
                        <div key={i} className="flex items-start gap-3 px-4 py-2.5 
                                               bg-surface-container-low rounded-lg 
                                               border-l-2 border-primary-container/30">
                          <div className="flex-1">
                            
                            {/* What the executive is doing */}
                            <div className="text-[10px] font-mono text-primary-container 
                                          uppercase tracking-widest mb-1">
                              {displayName}
                            </div>
                            
                            {/* Specific details (search query, URL, etc.) */}
                            {'query' in toolCall.args && (
                              <div className="text-[10px] font-mono text-on-surface/40 truncate">
                                "{toolCall.args.query as string}"
                              </div>
                            )}
                            {'url' in toolCall.args && (
                              <div className="text-[10px] font-mono text-on-surface/40 truncate">
                                {toolCall.args.url as string}
                              </div>
                            )}
                            {'competitor_name' in toolCall.args && (
                              <div className="text-[10px] font-mono text-on-surface/40">
                                {toolCall.args.competitor_name as string}
                              </div>
                            )}

                            {/* Status indicator */}
                            <div className="flex items-center gap-2 mt-1.5">
                              {toolCall.state === 'call' || toolCall.state === 'partial-call' ? (
                                <>
                                  {/* Animated dots while running */}
                                  <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-primary-container/60 
                                                   animate-bounce [animation-delay:-0.3s]"/>
                                    <div className="w-1 h-1 rounded-full bg-primary-container/60 
                                                   animate-bounce [animation-delay:-0.15s]"/>
                                    <div className="w-1 h-1 rounded-full bg-primary-container/60 
                                                   animate-bounce"/>
                                  </div>
                                  <span className="text-[9px] font-mono text-on-surface/30 uppercase">
                                    running...
                                  </span>
                                </>
                              ) : (
                                <>
                                  {/* Green checkmark when done */}
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-container"/>
                                  <span className="text-[9px] font-mono text-primary-container/60 uppercase">
                                    done
                                  </span>
                                  
                                  {/* Show result count if applicable */}
                                  {toolCall.state === 'result' && toolCall.result && (
                                    <span className="text-[9px] font-mono text-on-surface/30 uppercase ml-2">
                                      {'results' in toolCall.result
                                        ? `${(toolCall.result as any).results?.length} results`
                                        : ''}
                                      {'leads_found' in toolCall.result
                                        ? `${(toolCall.result as any).leads_found?.length} leads`
                                        : ''}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    }

                    // Text content streaming in
                    if (part.type === 'text') {
                      return (
                        <div key={i} className="text-sm text-on-secondary-container 
                                               font-body leading-relaxed">
                          <MarkdownContent content={part.text} />
                        </div>
                      )
                    }

                    return null
                  })}

                  {/* Action buttons — only on completed messages */}
                  {!isLoading && message.role === 'assistant' && (
                    <div className="flex items-center gap-3 mt-3 pt-3 
                                   border-t border-outline-variant/10">
                      <button className="text-[9px] font-black text-on-surface/30 uppercase 
                                        tracking-widest hover:text-primary-container 
                                        transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check</span>
                        Approve
                      </button>
                      <button className="text-[9px] font-black text-on-surface/30 uppercase 
                                        tracking-widest hover:text-error transition-colors 
                                        flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">close</span>
                        Reject
                      </button>
                      <button className="text-[9px] font-black text-on-surface/30 uppercase 
                                        tracking-widest hover:text-on-surface transition-colors 
                                        flex items-center gap-1 ml-auto">
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        ))}

        {/* Loading state — shown while executive is thinking before first tool call */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="text-[9px] font-black font-mono text-primary-container/60 
                             uppercase tracking-widest">
                {agentEmoji} {agentRole}
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 
                           bg-surface-container-low rounded-lg border-l-2 
                           border-primary-container/20">
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-primary-container/60 
                               animate-bounce [animation-delay:-0.3s]"/>
                <div className="w-1 h-1 rounded-full bg-primary-container/60 
                               animate-bounce [animation-delay:-0.15s]"/>
                <div className="w-1 h-1 rounded-full bg-primary-container/60 
                               animate-bounce"/>
              </div>
              <span className="text-[10px] font-mono text-on-surface/30 uppercase tracking-widest">
                {agentName} is working on your brief...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

// Simple markdown renderer for executive responses
function MarkdownContent({ content }: { content: string }) {
  // Split on newlines to handle basic formatting
  return (
    <div className="space-y-2">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-[13px] font-black font-headline text-on-surface uppercase tracking-wide mt-4">{line.replace('## ', '')}</h2>
        if (line.startsWith('# ')) return <h1 key={i} className="text-[15px] font-black font-headline text-on-surface uppercase tracking-wide mt-4">{line.replace('# ', '')}</h1>
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-black text-on-surface">{line.replace(/\*\*/g, '')}</p>
        if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} className="flex gap-2"><span className="text-primary-container mt-0.5">✓</span><span>{line.replace(/^[-•] /, '')}</span></div>
        if (line.startsWith('→ ')) return <div key={i} className="flex gap-2 text-primary-container/80"><span>→</span><span className="text-on-secondary-container">{line.replace('→ ', '')}</span></div>
        if (line.trim() === '') return <div key={i} className="h-2" />
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}
```

---

## PART 4 — DATABASE: Track every action

```sql
-- Agent actions audit table
create table public.agent_actions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  agent_name text not null,
  tool_name text not null,
  tool_input jsonb,
  tool_result jsonb,
  status text default 'executed' check (status in ('executing', 'executed', 'failed')),
  created_at timestamptz default now()
);

alter table public.agent_actions enable row level security;
create policy "agent_actions_org_only" on public.agent_actions
  for all using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

-- Index for fast queries
create index agent_actions_org_id_idx on public.agent_actions(org_id);
create index agent_actions_conversation_idx on public.agent_actions(conversation_id);
```

---


---

## PART 7 — IMPLEMENTATION ORDER

Tell Antigravity to implement in this exact order:

### Step 1 — Install packages
```bash
npm install ai @ai-sdk/openai @ai-sdk/react zod
```

### Step 2 — Add OpenRouter API key to env
```env
OPENROUTER_API_KEY=sk-or-v1-...
```
Get it at: openrouter.ai → Keys → Create Key

### Step 3 — Replace the message API route
Replace `app/api/conversations/[id]/messages/route.ts` with the streaming
version from Part 2 of this file.

### Step 4 — Create the agent_actions table
Run the SQL from Part 4 in Supabase SQL editor.

### Step 5 — Replace the chat component
Replace whatever is currently rendering messages with
`components/chat/ExecutiveChat.tsx` from Part 3.

### Step 6 — Wire ExecutiveChat into the Chat page
```typescript
// In app/(dashboard)/dashboard/chat/page.tsx
import { ExecutiveChat } from '@/components/chat/ExecutiveChat'

// Inside the page, where conversations render:
<ExecutiveChat
  conversationId={activeConversationId}
  agentName="Aria"
  agentRole="CMO"
  agentEmoji="📣"
/>
```

### Step 7 — Add the Atlas Inngest function
Add `handleAtlasWeeklyBriefing` to `lib/inngest/functions/atlas.ts`
and register it in the Inngest serve handler.

### Step 8 — Test locally
Run the app. Open Chat. Brief ARIA: "Find me 5 LinkedIn post ideas about AI for solo founders."

You should see:
```
ARIA (CMO) is working on your brief...
🔍 Searching the web... "LinkedIn post ideas AI solo founders 2026"
✓ done — 5 results
📄 Reading webpage... linkedin.com/...
✓ done
✍️ [text streaming in...]
```

If you see that — it's working.

### Step 9 — Deploy to Vercel
Push to main. Vercel auto-deploys.

