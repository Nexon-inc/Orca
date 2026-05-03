import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { getIntegrationConfig } from './registry'
import { decryptToken, encryptToken } from '@/lib/security/encrypt'

/**
 * Refreshes an OAuth token for a given organization and service.
 * Returns the new access token or null if refresh fails.
 */
export async function refreshOAuthToken(
  orgId: string,
  serviceKey: string
): Promise<string | null> {
  const supabase = createServiceSupabaseClient()
  const config = getIntegrationConfig(serviceKey)

  if (!config || config.auth_method !== 'oauth' || !config.oauth_token_url) {
    return null
  }

  // 1. Get encrypted tokens from DB
  const { data: integration } = await supabase
    .from('integrations')
    .select('refresh_token_encrypted, metadata')
    .eq('org_id', orgId)
    .eq('service_name', serviceKey)
    .single()

  if (!integration?.refresh_token_encrypted) return null

  try {
    // 2. Decrypt refresh token
    const refreshToken = decryptToken(integration.refresh_token_encrypted)

    // 3. Get client credentials from environment
    const clientId = process.env[config.oauth_client_id_env!]
    const clientSecret = process.env[config.oauth_client_secret_env!]

    if (!clientId || !clientSecret) {
      console.error(`Missing client credentials for ${serviceKey}`)
      return null
    }

    // 4. Request new tokens from provider
    const response = await fetch(config.oauth_token_url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`Token refresh failed for ${serviceKey}:`, data)
      return null
    }

    // 5. Encrypt new tokens
    const newAccessTokenEncrypted = encryptToken(data.access_token)
    const newRefreshTokenEncrypted = data.refresh_token 
      ? encryptToken(data.refresh_token) 
      : integration.refresh_token_encrypted

    // 6. Update database
    await supabase
      .from('integrations')
      .update({
        access_token_encrypted: newAccessTokenEncrypted,
        refresh_token_encrypted: newRefreshTokenEncrypted,
        metadata: {
          ...integration.metadata,
          expires_in: data.expires_in,
          refresh_token_expires_in: data.refresh_token_expires_in,
        },
        connected_at: new Date().toISOString()
      })
      .eq('org_id', orgId)
      .eq('service_name', serviceKey)

    return data.access_token
  } catch (error) {
    console.error(`Error refreshing token for ${serviceKey}:`, error)
    return null
  }
}
