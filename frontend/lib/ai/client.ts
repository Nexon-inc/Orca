import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { OpenRouter } from '@openrouter/sdk';
import type { HybridAIClient } from './HybridClient';

// Helper to coerce Langchain models into our Hybrid interface natively
function asHybrid(langchainModel: any): HybridAIClient {
  return {
    invoke: async (prompt: string | any[]) => {
      const response = await langchainModel.invoke(prompt);
      return { content: response.content?.toString() || '' };
    }
  };
}

// Langchain Lazy Helpers
let _gemini: any = null;
let _groq: any = null;

export const getGemini = () => {
  if (!_gemini) {
    _gemini = asHybrid(new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-pro',
      apiKey: process.env.GEMINI_API_KEY || '',
      temperature: 0.7,
    }));
  }
  return _gemini;
};

export const getGroq = () => {
  if (!_groq) {
    _groq = asHybrid(new ChatGroq({
      modelName: 'llama-3.3-70b-versatile',
      apiKey: process.env.GROQ_API_KEY || '',
      temperature: 0.5,
    }));
  }
  return _groq;
};

// New OpenRouter Hybrid Export
export const getOpenRouter = (modelSlug: string): HybridAIClient => {
  const client = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || ''
  });

  return {
    invoke: async (prompt: string | any[]) => {
      // Basic translation: convert string to user message
      const messages = Array.isArray(prompt) 
        ? prompt // If it's already an array (e.g. ChatPromptTemplate array), pass it through if compatible, but usually Langchain arrays need parsing. We assume simple string for now or array of {role, content}.
        : [{ role: "user", content: prompt }];
        
      const response = await client.chat.send({
        model: modelSlug,
        // @ts-ignore
        messages: messages,
      });

      return { 
        content: response.choices[0]?.message?.content || ''
      };
    }
  };
};
