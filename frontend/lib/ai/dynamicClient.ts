import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatOllama } from '@langchain/community/chat_models/ollama';

import OpenRouter from '@openrouter/sdk';
import type { ResolvedLLM } from './resolveModel';
import type { HybridAIClient } from './HybridClient';

// Helper to coerce Langchain models into our Hybrid interface
function asHybrid(langchainModel: any): HybridAIClient {
  return {
    invoke: async (prompt: string | any[]) => {
      const response = await langchainModel.invoke(prompt);
      return { content: response.content?.toString() || '' };
    }
  };
}

export function buildDynamicLLMClient(config: ResolvedLLM): HybridAIClient {
  const commonOptions = {
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };

  switch (config.provider) {
    case 'openrouter':
      // The native OpenRouter SDK adapter
      return {
        invoke: async (prompt: string | any[]) => {
          const client = new OpenRouter({ apiKey: config.apiKey });
          const messages = Array.isArray(prompt) 
            ? prompt 
            : [{ role: "user", content: prompt }];
            
          const response = await client.chat.send({
            model: config.model,
            // @ts-ignore
            messages: messages,
            temperature: config.temperature,
          });
          return { content: response.choices[0]?.message?.content || '' };
        }
      };

    case 'gemini':
      return asHybrid(new ChatGoogleGenerativeAI({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
        maxOutputTokens: config.maxTokens, 
      }));

    case 'groq':
      return asHybrid(new ChatGroq({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
      }));

    case 'openai':
      return asHybrid(new ChatOpenAI({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
      }));

    case 'anthropic':
      return asHybrid(new ChatAnthropic({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
      }));

    case 'deepseek':
      return asHybrid(new ChatOpenAI({
        modelName: config.model,
        apiKey: config.apiKey,
        configuration: { baseURL: 'https://api.deepseek.com' },
        ...commonOptions,
      }));

    case 'perplexity':
      return asHybrid(new ChatOpenAI({
        modelName: config.model,
        apiKey: config.apiKey,
        configuration: { baseURL: 'https://api.perplexity.ai' },
        ...commonOptions,
      }));

    case 'mistral':
      return asHybrid(new ChatMistralAI({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
      }));

    case 'ollama':
      return asHybrid(new ChatOllama({
        model: config.model,
        baseUrl: config.baseUrl || 'http://localhost:11434',
        temperature: config.temperature,
      }));

    default:
      // Fallback to ORCA default (Gemini via Hybrid wrapper)
      return asHybrid(new ChatGoogleGenerativeAI({
        modelName: 'gemini-1.5-pro',
        apiKey: process.env.GEMINI_API_KEY!,
        temperature: 0.7,
      }));
  }
}
