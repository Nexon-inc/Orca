import { tool } from 'ai'
import { z } from 'zod'
import { tavilySearch } from '@/lib/tools/tavily'
import { scrapeUrl } from '@/lib/tools/firecrawl'
import { executeViaComposio } from '@/lib/agents/composioExecutor'

/**
 * Builds the native tools available for an executive.
 * All execute() functions are wrapped in try/catch so a missing API key
 * never crashes the streamText call — it returns a graceful error instead.
 */
export function buildToolsForAgent(
  agentName: string,
  orgId: string,
  connectedServices: string[]
) {
  const tools: Record<string, any> = {}

  // ── 1. RESEARCH TOOLS (Available to all Strategic Agents) ──
  if (['Atlas', 'Aria', 'Rex', 'Roman', 'Ghost'].includes(agentName)) {
    tools.web_search = tool({
      description: 'Search the internet for real-time information, market trends, or competitor data.',
      parameters: z.object({
        query: z.string().describe('The specific search query'),
      }),
      execute: async ({ query }) => {
        try {
          const results = await tavilySearch(query)
          return {
            results: results.slice(0, 5).map((r: any) => ({ title: r.title, url: r.url, snippet: r.content?.slice(0, 300) }))
          }
        } catch (err: any) {
          return { error: `Web search unavailable: ${err.message}` }
        }
      },
    })

    tools.scrape_page = tool({
      description: 'Read the full content of a specific webpage.',
      parameters: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }) => {
        try {
          const content = await scrapeUrl(url)
          return { content: content.slice(0, 5000) }
        } catch (err: any) {
          return { error: `Page scraping unavailable: ${err.message}` }
        }
      },
    })
  }

  // ── 2. MARKETING TOOLS (Aria) ──
  if (agentName === 'Aria') {
    if (connectedServices.includes('linkedin')) {
      tools.linkedin_post = tool({
        description: 'Post to LinkedIn.',
        parameters: z.object({ content: z.string() }),
        execute: async ({ content }) => {
          try {
            return await executeViaComposio(orgId, 'linkedin', 'linkedin_post', { content })
          } catch (err: any) {
            return { error: `LinkedIn unavailable: ${err.message}` }
          }
        },
      })
    }
    if (connectedServices.includes('twitter')) {
      tools.twitter_post = tool({
        description: 'Post a tweet.',
        parameters: z.object({ text: z.string().max(280) }),
        execute: async ({ text }) => {
          try {
            return await executeViaComposio(orgId, 'twitter', 'twitter_post', { text })
          } catch (err: any) {
            return { error: `Twitter unavailable: ${err.message}` }
          }
        },
      })
    }
  }

  // ── 3. SALES TOOLS (Rex) ──
  if (agentName === 'Rex') {
    if (connectedServices.includes('hubspot')) {
      tools.hubspot_create_deal = tool({
        description: 'Create a new deal in HubSpot CRM.',
        parameters: z.object({
          dealname: z.string(),
          amount: z.number().optional(),
          contact_email: z.string().email(),
        }),
        execute: async (params) => {
          try {
            return await executeViaComposio(orgId, 'hubspot', 'hubspot_create_deal', params)
          } catch (err: any) {
            return { error: `HubSpot unavailable: ${err.message}` }
          }
        },
      })
    }
  }

  // ── 4. TECH TOOLS (Ghost) ──
  if (agentName === 'Ghost') {
    if (connectedServices.includes('github')) {
      tools.github_create_pr = tool({
        description: 'Create a GitHub Pull Request.',
        parameters: z.object({
          repo: z.string(),
          title: z.string(),
          body: z.string(),
          branch: z.string(),
        }),
        execute: async (params) => {
          try {
            return await executeViaComposio(orgId, 'github', 'github_create_pr', params)
          } catch (err: any) {
            return { error: `GitHub unavailable: ${err.message}` }
          }
        },
      })
    }
  }

  return tools
}
