// lib/integrations/providers/hunter.ts
export async function findEmail(domain: string, firstName: string, lastName: string) {
  const url = new URL('https://api.hunter.io/v2/email-finder')
  url.searchParams.set('domain', domain)
  url.searchParams.set('first_name', firstName)
  url.searchParams.set('last_name', lastName)
  url.searchParams.set('api_key', process.env.HUNTER_API_KEY!)

  const response = await fetch(url.toString())
  const data = await response.json()
  return data.data as { email: string; score: number; sources: any[] }
}
