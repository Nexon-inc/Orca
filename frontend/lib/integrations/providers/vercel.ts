// lib/integrations/providers/vercel.ts
export async function triggerVercelDeploy(projectId: string) {
  const response = await fetch(
    `https://api.vercel.com/v13/deployments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: projectId, target: 'production' })
    }
  )
  return response.json()
}
