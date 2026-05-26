import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * Shared corporate wiki knowledge base.
 * Directory of LLM-generated markdown files: Summaries, Entity pages, Concept pages, Comparisons, Overview, Synthesis.
 */
export const readWikiPage = tool({
  description: 'Read a specific strategic plan, blueprint, or markdown page from the shared corporate wiki directory.',
  parameters: z.object({
    pageTitle: z.string().describe('The title of the wiki page to read (e.g. "product_roadmap")')
  }),
  execute: async ({ orgId, pageTitle }: { orgId: string; pageTitle: string }) => {
    try {
      const supabase = createServiceSupabaseClient()
      const { data } = await supabase
        .from('llm_memories')
        .select('memory_data')
        .eq('org_id', orgId)
        .eq('agent_id', '00000000-0000-0000-0000-000000000000') // Shared org namespace
        .maybeSingle()

      const wikiPages = (data as any)?.memory_data?.wiki_pages || {}
      const pageKey = pageTitle.toLowerCase().replace(/\s+/g, '_')
      const pageInfo = wikiPages[pageKey]
      
      if (!pageInfo) {
        return { error: `Wiki page "${pageTitle}" not found in corporate directory.` }
      }
      return { 
        title: pageTitle,
        type: pageInfo.type || 'general',
        content: pageInfo.content,
        updated_at: pageInfo.updated_at 
      }
    } catch (err: any) {
      return { error: `Failed to read wiki page: ${err.message}` }
    }
  }
})

export const writeWikiPage = tool({
  description: 'Publish or update a markdown page (Summary, Entity page, Concept page, Comparison, Overview, or Synthesis) to the shared corporate wiki directory.',
  parameters: z.object({
    pageTitle: z.string().describe('The title of the wiki page (e.g. "competitor_battlecard", "q3_overview")'),
    pageType: z.enum(['overview', 'summary', 'entity', 'concept', 'comparison', 'synthesis']).describe('The category of the wiki markdown file'),
    markdownContent: z.string().describe('The content of the wiki page in high-density markdown')
  }),
  execute: async ({ orgId, pageTitle, pageType, markdownContent }: { orgId: string; pageTitle: string; pageType: string; markdownContent: string }) => {
    try {
      const supabase = createServiceSupabaseClient()
      const { data } = await supabase
        .from('llm_memories')
        .select('*')
        .eq('org_id', orgId)
        .eq('agent_id', '00000000-0000-0000-0000-000000000000')
        .maybeSingle()

      const wikiPages = (data as any)?.memory_data?.wiki_pages || {}
      const pageKey = pageTitle.toLowerCase().replace(/\s+/g, '_')

      wikiPages[pageKey] = {
        title: pageTitle,
        type: pageType,
        content: markdownContent,
        updated_at: new Date().toISOString()
      }

      await supabase.from('llm_memories').upsert({
        org_id: orgId,
        agent_id: '00000000-0000-0000-0000-000000000000',
        memory_data: { 
          ...((data as any)?.memory_data || {}),
          wiki_pages: wikiPages,
          updated_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'org_id,agent_id' })

      return { success: true, message: `Successfully published "${pageTitle}" as a "${pageType}" page in the corporate wiki directory.` }
    } catch (err: any) {
      return { error: `Failed to publish to wiki: ${err.message}` }
    }
  }
})

export const listWikiPages = tool({
  description: 'List the entire directory of corporate wiki pages, categorizing them by Overview, Summaries, Entities, Concepts, Comparisons, and Synthesis to make it easy for LLMs to find relevant context.',
  parameters: z.object({}),
  execute: async ({ orgId }: { orgId: string }) => {
    try {
      const supabase = createServiceSupabaseClient()
      const { data } = await supabase
        .from('llm_memories')
        .select('memory_data')
        .eq('org_id', orgId)
        .eq('agent_id', '00000000-0000-0000-0000-000000000000')
        .maybeSingle()

      const wikiPages = (data as any)?.memory_data?.wiki_pages || {}
      const directory: Record<string, string[]> = {
        overview: [],
        summary: [],
        entity: [],
        concept: [],
        comparison: [],
        synthesis: [],
        general: []
      }

      for (const [key, value] of Object.entries(wikiPages)) {
        const page = value as any
        const type = page.type || 'general'
        if (directory[type]) {
          directory[type].push(`${page.title || key} (key: ${key})`)
        } else {
          directory.general.push(`${page.title || key} (key: ${key})`)
        }
      }

      return {
        message: 'Shared Corporate Wiki Directory (Markdown Pages)',
        directory
      }
    } catch (err: any) {
      return { error: `Failed to list wiki pages: ${err.message}` }
    }
  }
})
