// lib/integrations/providers/newsapi.ts
export async function getTopNews(query: string, language = 'en') {
  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', query)
  url.searchParams.set('language', language)
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', '10')
  url.searchParams.set('apiKey', process.env.NEWSAPI_KEY!)

  const response = await fetch(url.toString())
  const data = await response.json()
  return data.articles as {
    title: string
    description: string
    url: string
    publishedAt: string
    source: { name: string }
  }[]
}
