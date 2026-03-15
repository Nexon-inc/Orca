import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function validateIntegrationToken(
  orgId: string,
  serviceKey: string
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { data: integration, error } = await supabase
    .from('integrations')
    .select('status, metadata, access_token_encrypted')
    .eq('org_id', orgId)
    .eq('service_name', serviceKey)
    .single()

  if (error || !integration || !integration.access_token_encrypted) {
    return { valid: false, error: `${serviceKey} is not connected.` }
  }

  // Basic check based on expiry metadata if available (for OAuth tokens)
  if (integration.metadata?.expires_in && integration.connected_at) {
    const expiresAt = new Date(
      new Date(integration.connected_at).getTime() + integration.metadata.expires_in * 1000
    )
    if (new Date() >= expiresAt) {
      return { valid: false, error: 'Token expired' }
    }
  }

  return { valid: true }
}
