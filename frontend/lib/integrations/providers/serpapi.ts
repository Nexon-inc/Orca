// lib/integrations/providers/serpapi.ts
export async function googleSearch(query: string) {
  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('q', query)
  url.searchParams.set('api_key', process.env.SERPAPI_KEY!)
  url.searchParams.set('engine', 'google')
  url.searchParams.set('num', '10')

  const response = await fetch(url.toString())
  const data = await response.json()
  return data.organic_results as {
    title: string
    link: string
    snippet: string
    position: number
  }[]
}
