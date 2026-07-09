import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { encryptToken } from '@/lib/security/encrypt'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { provider, api_key } = await request.json()
    if (!provider) {
      return NextResponse.json({ error: 'Provider key is required' }, { status: 400 })
    }

    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: member } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['owner', 'cofounder'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orgId = member.org_id

    // Bypassing database check constraint for 'nvidia' by saving it as 'openai'
    // with the NVIDIA NIM base URL.
    const dbProvider = provider === 'nvidia' ? 'openai' : provider
    const dbBaseUrl = provider === 'nvidia' ? 'https://integrate.api.nvidia.com/v1' : null

    // Fetch existing configuration to avoid violating unique constraints
    const { data: existingConfig } = await supabase
      .from('llm_configs')
      .select('id')
      .eq('org_id', orgId)
      .eq('scope', 'org')
      .eq('provider', dbProvider)
      .limit(1)
      .maybeSingle()

    let error;
    if (existingConfig) {
      const { error: updateError } = await supabase
        .from('llm_configs')
        .update({
          api_key_encrypted: api_key ? encryptToken(api_key) : null,
          base_url: dbBaseUrl,
          model: provider === 'nvidia' ? 'moonshotai/kimi-k2-instruct' : 'default',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConfig.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('llm_configs')
        .insert({
          org_id: orgId,
          scope: 'org',
          provider: dbProvider,
          model: provider === 'nvidia' ? 'moonshotai/kimi-k2-instruct' : 'default',
          api_key_encrypted: api_key ? encryptToken(api_key) : null,
          base_url: dbBaseUrl,
        })
      error = insertError
    }

    if (error) {
      console.error('[LLM_CONFIG_SAVE_ERR]', error)
      return NextResponse.json({ error: 'Failed to update LLM configuration' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[LLM_CONFIG_SAVE_ERR]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// Fetch configured LLM providers (only check if key exists, don't return encrypted key content)
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: member } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { data: configs } = await supabase
      .from('llm_configs')
      .select('provider, base_url, api_key_encrypted')
      .eq('org_id', member.org_id)
      .eq('scope', 'org')

    const activeProviders = configs?.map(c => {
      // Map back database openai+nvidia url to 'nvidia' provider key
      if (c.provider === 'openai' && c.base_url?.includes('nvidia')) {
        return { provider: 'nvidia', hasKey: !!c.api_key_encrypted }
      }
      return { provider: c.provider, hasKey: !!c.api_key_encrypted }
    }) || []

    return NextResponse.json({ configs: activeProviders })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
