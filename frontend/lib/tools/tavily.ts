// lib/tools/tavily.ts
export async function tavilySearch(query: string, searchDepth: 'basic' | 'advanced' = 'basic') {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: searchDepth,
      include_answer: true,
      include_raw_content: false,
      max_results: 5,
    }),
  })
  const data = await response.json()
  return data.results as { title: string; url: string; content: string; score: number }[]
}
