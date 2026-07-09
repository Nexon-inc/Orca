export interface LLMModel {
  id: string;
  name: string;
  contextWindow: number;
  bestFor: string;
}

export interface LLMProvider {
  key: string;
  name: string;
  models: LLMModel[];
  apiKeyEnv?: string;
  baseUrl: string;
  supportsCustomKey: boolean;
  planRequired: 'starter' | 'pro' | 'enterprise';
}

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    key: 'gemini',
    name: 'ORCA-powered AI',
    models: [
      { id: 'gemini-1.5-pro', name: 'ORCA 1.5 Pro', contextWindow: 1000000, bestFor: 'Complex tasks, long context' },
      { id: 'gemini-2.0-flash', name: 'ORCA 2.0 Flash', contextWindow: 1000000, bestFor: 'Fast, cost-effective' },
      { id: 'gemini-1.5-flash', name: 'ORCA 1.5 Flash', contextWindow: 1000000, bestFor: 'Speed + cost balance' },
    ],
    apiKeyEnv: 'GEMINI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com',
    supportsCustomKey: true,
    planRequired: 'starter',
  },
  {
    key: 'groq',
    name: 'ORCA-powered AI (Turbo)',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', contextWindow: 128000, bestFor: 'Fast execution, low latency' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', contextWindow: 128000, bestFor: 'Ultra fast, simple tasks' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextWindow: 32768, bestFor: 'Balanced speed and quality' },
    ],
    apiKeyEnv: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com',
    supportsCustomKey: true,
    planRequired: 'starter',
  },
  {
    key: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, bestFor: 'Most capable, familiar output' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, bestFor: 'Cost-effective, fast' },
    ],
    baseUrl: 'https://api.openai.com',
    supportsCustomKey: true,
    planRequired: 'pro',
  },
  {
    key: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', contextWindow: 200000, bestFor: 'Writing, analysis' },
      { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku', contextWindow: 200000, bestFor: 'Fast, affordable' },
    ],
    baseUrl: 'https://api.anthropic.com',
    supportsCustomKey: true,
    planRequired: 'pro',
  },
  {
    key: 'deepseek',
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', contextWindow: 64000, bestFor: 'Reasoning, efficient' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', contextWindow: 64000, bestFor: 'Complex logic' },
    ],
    baseUrl: 'https://api.deepseek.com',
    supportsCustomKey: true,
    planRequired: 'pro',
  },
  {
    key: 'perplexity',
    name: 'Perplexity',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro', contextWindow: 32000, bestFor: 'Real-time research' },
      { id: 'sonar-deep-research', name: 'Sonar Deep Research', contextWindow: 32000, bestFor: 'Deep factual analysis' },
    ],
    baseUrl: 'https://api.perplexity.ai',
    supportsCustomKey: true,
    planRequired: 'pro',
  },
  {
    key: 'cohere',
    name: 'Cohere',
    models: [
      { id: 'command-r-plus', name: 'Command R+', contextWindow: 128000, bestFor: 'RAG, enterprise search' },
    ],
    baseUrl: 'https://api.cohere.ai',
    supportsCustomKey: true,
    planRequired: 'pro',
  },
  {
    key: 'mistral',
    name: 'Mistral AI',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', contextWindow: 128000, bestFor: 'EU data residency' },
    ],
    baseUrl: 'https://api.mistral.ai',
    supportsCustomKey: true,
    planRequired: 'pro',
  },
  {
    key: 'ollama',
    name: 'Ollama (Self-hosted)',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', contextWindow: 128000, bestFor: 'Private, local' },
      { id: 'mistral', name: 'Mistral 7B', contextWindow: 32000, bestFor: 'Local, efficient' },
    ],
    baseUrl: '',
    supportsCustomKey: false,
    planRequired: 'enterprise',
  },
  {
    key: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', contextWindow: 200000, bestFor: 'Elite reasoning and writing' },
      { id: 'openai/gpt-4o', name: 'GPT-4o', contextWindow: 128000, bestFor: 'Multimodal versatility' },
      { id: 'meta-llama/llama-3.1-405b', name: 'Llama 3.1 405B', contextWindow: 128000, bestFor: 'Open-weights intelligence' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro (Native)', contextWindow: 1000000, bestFor: 'Massive context' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (OR)', contextWindow: 64000, bestFor: 'Efficiency' },
    ],
    baseUrl: 'https://openrouter.ai/api/v1',
    supportsCustomKey: true,
    planRequired: 'pro',
  },
  {
    key: 'nvidia',
    name: 'NVIDIA NIM',
    models: [
      { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2 Instruct (NIM)', contextWindow: 128000, bestFor: 'Elite reasoning and planning' },
      { id: 'mistralai/mistral-large-3-675b-instruct-2512', name: 'Mistral Large 3 (NIM)', contextWindow: 128000, bestFor: 'Creative copywriting' },
      { id: 'meta/llama-3.1-405b-instruct', name: 'Llama 3.1 405B Instruct (NIM)', contextWindow: 128000, bestFor: 'Fast reasoning' },
      { id: 'nvidia/llama-3.3-nemotron-super-49b-v1', name: 'Nemotron Super 49B (NIM)', contextWindow: 128000, bestFor: 'High precision response' },
      { id: 'qwen/qwen3-coder-480b-a35b-instruct', name: 'Qwen3 Coder 480B (NIM)', contextWindow: 128000, bestFor: 'Deterministic code' },
    ],
    apiKeyEnv: 'NVIDIA_NIM_API_KEY',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    supportsCustomKey: true,
    planRequired: 'pro',
  },
];

export function getProvider(key: string): LLMProvider | undefined {
  return LLM_PROVIDERS.find(p => p.key === key);
}
