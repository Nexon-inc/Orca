// app/api/webhooks/instagram/route.ts

// GET — Meta calls this to verify the webhook
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// POST — Meta sends real-time events here
export async function POST(request: Request) {
  const body = await request.json()
  console.log('Instagram webhook event:', JSON.stringify(body))
  return new Response('OK', { status: 200 })
}
