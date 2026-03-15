import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { decryptToken } from '../security/encrypt';

export interface ResolvedLLM {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
}

export async function resolveLLMForAgent(
  orgId: string,
  agentId: string,
  departmentKey: string
): Promise<ResolvedLLM> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Fetch configs: agent > dept > org
  const { data: configs } = await supabase
    .from('llm_configs')
    .select('*')
    .eq('org_id', orgId);

  const agentConfig = configs?.find(c => c.scope === 'agent' && c.agent_id === agentId);
  const deptConfig = configs?.find(c => c.scope === 'department' && c.department_key === departmentKey);
  const orgConfig = configs?.find(c => c.scope === 'org');

  const resolved = agentConfig || deptConfig || orgConfig;

  if (!resolved || resolved.provider === 'orca_default') {
    return {
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      apiKey: process.env.GEMINI_API_KEY!,
      temperature: 0.7,
      maxTokens: 4000,
    };
  }

  const apiKey = resolved.api_key_encrypted
    ? decryptToken(resolved.api_key_encrypted)
    : getDefaultKeyForProvider(resolved.provider);

  return {
    provider: resolved.provider,
    model: resolved.model,
    apiKey,
    baseUrl: resolved.base_url || undefined,
    temperature: resolved.temperature,
    maxTokens: resolved.max_tokens,
  };
}

function getDefaultKeyForProvider(provider: string): string {
  const keyMap: Record<string, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    groq: process.env.GROQ_API_KEY,
  };
  return keyMap[provider] || '';
}
