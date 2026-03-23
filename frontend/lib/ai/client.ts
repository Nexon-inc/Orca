import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatGroq } from '@langchain/groq'

// Primary — Gemini 1.5 Pro (complex tasks, long context)
export const getGemini = () => new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-pro',
  apiKey: process.env.GEMINI_API_KEY!,
  temperature: 0.7,
})

// Fast — Groq Llama 3.3 70B (quick tasks, low latency)
export const getGroq = () => new ChatGroq({
  model: 'llama-3.3-70b-versatile',
  apiKey: process.env.GROQ_API_KEY!,
  temperature: 0.5,
})
