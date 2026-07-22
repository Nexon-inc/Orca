import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const { domain, idea } = await request.json()
    const target = domain || idea || 'a new SaaS startup'

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      throw new Error('Groq API Key is not configured on the server.')
    }

    const groq = createGroq({ apiKey: groqKey })

    const systemPrompt = `You are a simulated AI Executive Board consisting of Atlas (CEO), Aria (CMO), and Ghost (CTO) coordinating a launch sprint for the user's SaaS startup: "${target}".
You must output a live collaboration log where each executive speaks in turn. Use the exact agent tags [AGENT: CEO], [AGENT: CMO], and [AGENT: CTO] on their own lines before they speak.

Write a realistic, professional launch blueprint tailored to this specific SaaS concept:
1. [AGENT: CEO] Atlas outlines the launch timeline, coordination steps, and hands off to the CMO.
2. [AGENT: CMO] Aria drafts a bold Twitter/X announcement tweet under 280 characters, details the organic outreach strategy, and hands off to the CTO.
3. [AGENT: CTO] Ghost defines the modern tech stack, lists security controls (e.g., Supabase RLS policies), and creates a pull request details list.

Keep each agent's contribution concise and punchy (about 80-120 words per agent). Do not include any other conversational filler.`

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `Generate the launch sprint plan for: ${target}`,
      system: systemPrompt,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (err: any) {
    console.error('[DEMO_STREAM_ERR]', err)
    return NextResponse.json({ error: err.message || 'Failed to generate demo' }, { status: 500 })
  }
}
