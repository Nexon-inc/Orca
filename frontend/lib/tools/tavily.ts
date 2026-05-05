// lib/tools/tavily.ts
export async function tavilySearch(query: string, searchDepth: 'basic' | 'advanced' = 'basic') {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not configured in environment variables.')
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: searchDepth,
      include_answer: true,
      include_raw_content: false,
      max_results: 5,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Tavily API error (${response.status}): ${errorData.detail || response.statusText}`)
  }

  const data = await response.json()
  return (data.results || []) as { title: string; url: string; content: string; score: number }[]
}
