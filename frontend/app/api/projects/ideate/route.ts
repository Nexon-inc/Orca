'use server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getGemini } from '@/lib/ai/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await request.json()
  const supabase = await createServerSupabaseClient()

  // 1. Verify Tier (PRO/BUILDER only)
  const { data: member } = await supabase
    .from('org_members')
    .select('organizations(plan)')
    .eq('user_id', user.id)
    .single()

  const plan = (member?.organizations as any)?.plan || 'free'
  if (!['builder', 'pro', 'enterprise'].includes(plan)) {
    return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
  }

  // 2. Perform AI Analysis (Simulating Search/Evaluation)
  try {
    const ai = getGemini()
    const aiPrompt = `
      You are ATLAS, the CEO/Ops Executive of an Autonomous OS.
      A user wants you to ideate a new business project.
      
      USER_PROMPT: "${prompt}"
      
      Your task:
      1. Briefly research/evaluate the feasibility of this idea (Simulate market knowledge).
      2. Provide a "MARKET_EVALUATION" score (1-10).
      3. Provide a "RECOMMENDED_STRATEGY" (3-4 sentences).
      4. List the "CORE_EXECUTIVES" that should be deployed first.
      
      Format the response in a clean, terminal-style text block with headers.
      Use ALL_CAPS for headers.
    `
    const result = await ai.invoke(aiPrompt)
    const recommendation = result.content.toString()

    return NextResponse.json({ recommendation })
  } catch (err) {
    console.error('IDEATION_ERROR:', err)
    return NextResponse.json({ error: 'Ideation engine failed' }, { status: 500 })
  }
}
