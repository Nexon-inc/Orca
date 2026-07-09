import { streamText, generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createGroq } from '@ai-sdk/groq'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/security/encrypt'
import { createNvidiaClient, getModelForExecutive, getTemperatureForExecutive } from './nvidia'

// Decrypt and load organization custom LLM credentials (BYOLLM)
export async function getDecryptedOrgKey(orgId: string, provider: string): Promise<string | null> {
  try {
    const supabase = createServiceSupabaseClient()
    const { data: configs } = await supabase
      .from('llm_configs')
      .select('api_key_encrypted, base_url, provider')
      .eq('org_id', orgId)
      .eq('scope', 'org')

    if (!configs) return null

    // Match provider key. Handle NVIDIA custom bypass on 'openai' provider row
    const config = configs.find(c => {
      if (provider === 'nvidia') {
        return (c.provider === 'openai' && c.base_url?.includes('nvidia')) || c.provider === 'nvidia'
      }
      return c.provider === provider
    })

    if (config?.api_key_encrypted) {
      return decryptToken(config.api_key_encrypted)
    }
  } catch (e) {
    console.error(`[ORCA] Failed to fetch/decrypt BYOLLM key for ${provider}:`, e)
  }
  return null
}

// Probes a model with a micro-prompt to verify rate limits and health
async function probeModel(model: any, label: string): Promise<boolean> {
  try {
    await generateText({
      model,
      prompt: 'Reply with: ok',
      maxTokens: 5,
      maxRetries: 0,
    })
    return true
  } catch (err: any) {
    console.warn(`[ORCA] ${label} health probe failed:`, err?.message || err)
    return false
  }
}

// Model Fallback chain configuration
interface FallbackStreamOptions {
  orgId: string
  agentName: string
  systemPrompt: string
  messages: any[]
  tools: any
  maxSteps: number
  onFinish: (event: any) => Promise<void>
  onSelected: (selected: { provider: string; model: string }) => void
}

export async function streamTextWithFallback(options: FallbackStreamOptions) {
  const { orgId, agentName, systemPrompt, messages, tools, maxSteps, onFinish, onSelected } = options

  // Resolve custom keys (if any)
  const orgNvidiaKey = await getDecryptedOrgKey(orgId, 'nvidia')
  const orgGroqKey = await getDecryptedOrgKey(orgId, 'groq')
  const orgGeminiKey = await getDecryptedOrgKey(orgId, 'gemini')

  // Load clients
  const nvidiaClient = createNvidiaClient(orgNvidiaKey || undefined)
  const groqClient = createGroq({ apiKey: orgGroqKey || process.env.GROQ_API_KEY })
  const geminiClient = createGoogleGenerativeAI({ apiKey: orgGeminiKey || process.env.GEMINI_API_KEY })

  // Route executive details
  const nvidiaModelId = getModelForExecutive(agentName)
  const temperature = getTemperatureForExecutive(agentName)

  // ── ATTEMPT 1: NVIDIA NIM (Primary) ──────────────────────
  const nvidiaModel = nvidiaClient(nvidiaModelId)
  console.log(`[ORCA] Probing NVIDIA NIM (${nvidiaModelId}) for ${agentName}...`)
  
  if (await probeModel(nvidiaModel, `NIM ${nvidiaModelId}`)) {
    console.log(`[ORCA] NIM healthy. Streaming from NVIDIA NIM (${nvidiaModelId})`)
    onSelected({ provider: 'nvidia', model: nvidiaModelId })
    return streamText({
      model: nvidiaModel,
      system: systemPrompt,
      messages,
      tools,
      maxSteps,
      temperature,
      onFinish,
    })
  }

  // ── ATTEMPT 2: GROQ (Fallback 1) ─────────────────────────
  const groqModelId = 'llama-3.3-70b-versatile'
  const groqModel = groqClient(groqModelId)
  console.log(`[ORCA] NIM busy or unconfigured. Probing Groq (${groqModelId}) for ${agentName}...`)

  if (await probeModel(groqModel, `Groq ${groqModelId}`)) {
    console.log(`[ORCA] Groq healthy. Streaming from Groq (${groqModelId})`)
    onSelected({ provider: 'groq', model: groqModelId })
    return streamText({
      model: groqModel,
      system: systemPrompt,
      messages,
      tools,
      maxSteps,
      temperature,
      onFinish,
    })
  }

  // ── ATTEMPT 3: GEMINI (Fallback 2) ───────────────────────
  const geminiModelId = 'gemini-1.5-flash'
  const geminiModel = geminiClient(geminiModelId)
  console.log(`[ORCA] NIM and Groq unavailable. Streaming from Gemini fallback (${geminiModelId})`)
  onSelected({ provider: 'gemini', model: geminiModelId })

  return streamText({
    model: geminiModel,
    system: systemPrompt,
    messages,
    tools,
    maxSteps,
    temperature,
    onFinish,
  })
}

interface FallbackTextOptions {
  orgId: string
  agentName: string
  systemPrompt: string
  messages: any[]
}

export async function generateTextWithFallback(options: FallbackTextOptions) {
  const { orgId, agentName, systemPrompt, messages } = options

  // Resolve custom keys
  const orgNvidiaKey = await getDecryptedOrgKey(orgId, 'nvidia')
  const orgGroqKey = await getDecryptedOrgKey(orgId, 'groq')
  const orgGeminiKey = await getDecryptedOrgKey(orgId, 'gemini')

  // Load clients
  const nvidiaClient = createNvidiaClient(orgNvidiaKey || undefined)
  const groqClient = createGroq({ apiKey: orgGroqKey || process.env.GROQ_API_KEY })
  const geminiClient = createGoogleGenerativeAI({ apiKey: orgGeminiKey || process.env.GEMINI_API_KEY })

  // Route executive details
  const nvidiaModelId = getModelForExecutive(agentName)
  const temperature = getTemperatureForExecutive(agentName)

  // NIM
  try {
    const nvidiaModel = nvidiaClient(nvidiaModelId)
    return await generateText({
      model: nvidiaModel,
      system: systemPrompt,
      messages,
      temperature,
    })
  } catch (e) {
    console.warn('[ORCA] Fallback generate with NIM failed, trying Groq...', e)
  }

  // Groq
  try {
    const groqModelId = 'llama-3.3-70b-versatile'
    const groqModel = groqClient(groqModelId)
    return await generateText({
      model: groqModel,
      system: systemPrompt,
      messages,
      temperature,
    })
  } catch (e) {
    console.warn('[ORCA] Fallback generate with Groq failed, trying Gemini...', e)
  }

  // Gemini
  const geminiModelId = 'gemini-1.5-flash'
  const geminiModel = geminiClient(geminiModelId)
  return await generateText({
    model: geminiModel,
    system: systemPrompt,
    messages,
    temperature,
  })
}
