import { createOpenAI } from '@ai-sdk/openai'

// Base OpenAI adapter configuration for NVIDIA NIM
export const createNvidiaClient = (apiKey?: string) => {
  return createOpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: apiKey || process.env.NVIDIA_NIM_API_KEY || '',
  })
}

// Best model per executive based on task type
export const EXECUTIVE_MODELS: Record<string, string> = {
  Atlas:  'moonshotai/kimi-k2-instruct',           // best reasoning — CEO strategy
  Aria:   'mistralai/mistral-large-3-675b-instruct-2512', // best creative content — CMO
  Rex:    'meta/llama-3.1-405b-instruct',           // fast + coherent — CSO sales
  Purity: 'nvidia/llama-3.3-nemotron-super-49b-v1', // warm + precise — CCO support
  Roman:  'moonshotai/kimi-k2-instruct',            // long context — CIO research
  Ghost:  'qwen/qwen3-coder-480b-a35b-instruct',   // best code model — CTO
}

export function getModelForExecutive(agentName: string): string {
  return EXECUTIVE_MODELS[agentName] ?? 'meta/llama-3.1-405b-instruct'
}

// Temperature configuration per executive for response vibe tuning
export const EXECUTIVE_TEMPERATURES: Record<string, number> = {
  Atlas:  0.8,
  Aria:   0.9,
  Rex:    0.6,
  Purity: 0.7,
  Roman:  0.5,
  Ghost:  0.1,
}

export function getTemperatureForExecutive(agentName: string): number {
  return EXECUTIVE_TEMPERATURES[agentName] ?? 0.7
}
