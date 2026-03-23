import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import type { ResolvedLLM } from './resolveModel';

export function buildDynamicLLMClient(config: ResolvedLLM) {
  const commonOptions = {
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };

  switch (config.provider) {
    case 'gemini':
      return new ChatGoogleGenerativeAI({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
        maxOutputTokens: config.maxTokens, // Gemini specific key
      });

    case 'groq':
      return new ChatGroq({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
      });

    case 'openai':
      return new ChatOpenAI({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
      });

    case 'anthropic':
      return new ChatAnthropic({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
      });

    case 'deepseek':
      // DeepSeek uses OpenAI-compatible API
      return new ChatOpenAI({
        modelName: config.model,
        apiKey: config.apiKey,
        configuration: {
          baseURL: 'https://api.deepseek.com',
        },
        ...commonOptions,
      });

    case 'perplexity':
      // Perplexity uses OpenAI-compatible API
      return new ChatOpenAI({
        modelName: config.model,
        apiKey: config.apiKey,
        configuration: {
          baseURL: 'https://api.perplexity.ai',
        },
        ...commonOptions,
      });

    case 'mistral':
      return new ChatMistralAI({
        modelName: config.model,
        apiKey: config.apiKey,
        ...commonOptions,
      });

    case 'ollama':
      return new ChatOllama({
        model: config.model,
        baseUrl: config.baseUrl || 'http://localhost:11434',
        temperature: config.temperature,
      });

    default:
      // Fallback to ORCA default (Gemini)
      return new ChatGoogleGenerativeAI({
        modelName: 'gemini-1.5-pro',
        apiKey: process.env.GEMINI_API_KEY!,
        temperature: 0.7,
      });
  }
}
