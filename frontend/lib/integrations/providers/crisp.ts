// lib/integrations/providers/crisp.ts
export async function getCrispConversations(websiteId: string) {
  const response = await fetch(
    `https://api.crisp.chat/v1/website/${websiteId}/conversations/1`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.CRISP_API_TOKEN}:`
        ).toString('base64')}`,
        'X-Crisp-Tier': 'plugin',
      }
    }
  )
  return response.json()
}
