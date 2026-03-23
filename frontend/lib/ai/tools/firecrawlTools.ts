import { DynamicTool } from '@langchain/core/tools'
import { scrapeUrl, crawlWebsite, searchWeb, extractFromUrl } from '../firecrawl'

export const firecrawlTools = [

  new DynamicTool({
    name: 'scrape_url',
    description: 'Scrape a single URL and get its content as clean markdown. Use when you need to read a specific webpage.',
    func: async (url: string) => {
      const content = await scrapeUrl(url)
      return content.slice(0, 8000) // limit to 8k chars for context window
    }
  }),

  new DynamicTool({
    name: 'search_web',
    description: 'Search the web for information and get full page content from results. Use for research, market intelligence, competitor analysis.',
    func: async (query: string) => {
      const results = await searchWeb(query, 5)
      return results.map(r => `URL: ${r.url}\nTitle: ${r.title}\n${r.content}`).join('\n\n---\n\n')
    }
  }),

  new DynamicTool({
    name: 'crawl_website',
    description: 'Crawl an entire website and get content from all its pages. Use for deep competitor research or comprehensive content analysis.',
    func: async (url: string) => {
      const pages = await crawlWebsite(url, 5) // limit to 5 pages per crawl
      return pages.map(p => `URL: ${p.url}\n${p.markdown}`).join('\n\n---\n\n')
    }
  }),

  new DynamicTool({
    name: 'extract_data',
    description: 'Extract specific structured data from a URL using AI. Use to get pricing, features, team info, or any specific data from a webpage.',
    func: async (input: string) => {
      // Input format: "url|prompt" e.g. "https://example.com/pricing|Extract all pricing tiers and features"
      const [url, prompt] = input.split('|')
      const data = await extractFromUrl(url.trim(), prompt.trim())
      return JSON.stringify(data, null, 2)
    }
  }),

]
