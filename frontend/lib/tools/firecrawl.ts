import FirecrawlApp from '@mendable/firecrawl-js'

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!
})

// Scrape a single URL — returns clean markdown for LLM
export async function scrapeUrl(url: string): Promise<string> {
  const result = await firecrawl.scrapeUrl(url, {
    formats: ['markdown'] as any,
  })
  if (!result.success) throw new Error(`Scrape failed: ${result.error}`)
  return (result as any).markdown || ''
}

// Crawl an entire website — returns all pages as markdown
export async function crawlWebsite(url: string, limit = 10): Promise<{
  url: string
  markdown: string
}[]> {
  const result = await firecrawl.crawlUrl(url, {
    limit,
    scrapeOptions: { formats: ['markdown'] as any }
  })
  if (!result.success) throw new Error(`Crawl failed: ${result.error}`)
  return (result as any).data?.map((page: any) => ({
    url: page.metadata?.sourceURL || url,
    markdown: page.markdown || ''
  })) || []
}

// Search the web — returns full content from top results
export async function searchWeb(query: string, limit = 5): Promise<{
  url: string
  title: string
  content: string
}[]> {
  const result = await firecrawl.search(query, { limit })
  if (!result.success) throw new Error(`Search failed`)
  return (result as any).data?.map((item: any) => ({
    url: item.url || '',
    title: item.title || '',
    content: item.markdown || item.description || ''
  })) || []
}

// Extract structured data from a URL using AI
export async function extractFromUrl(
  url: string,
  prompt: string
): Promise<Record<string, unknown>> {
  const result = await firecrawl.extract([url], {
    prompt,
  })
  if (!result.success) throw new Error(`Extract failed`)
  return (result as any).data || {}
}

// Map all URLs on a website — fast, no content
export async function mapWebsite(url: string): Promise<string[]> {
  const result = await firecrawl.mapUrl(url)
  if (!result.success) throw new Error(`Map failed`)
  return (result as any).links || []
}
