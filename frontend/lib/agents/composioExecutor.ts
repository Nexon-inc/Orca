import { createServerSupabaseClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/security/encrypt'
import { refreshOAuthToken } from '@/lib/integrations/tokenRefresh'
import { validateIntegrationToken } from '@/lib/agents/validateToken'

export async function executeViaComposio(
  orgId: string,
  serviceKey: string,
  action: string,
  parameters: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const supabase = createServerSupabaseClient()

  // 1. Check integration is connected and token is valid
  const { valid, error: tokenError } = await validateIntegrationToken(orgId, serviceKey)

  if (!valid) {
    // Try refreshing token first
    const newToken = await refreshOAuthToken(orgId, serviceKey)
    if (!newToken) {
      return { success: false, error: tokenError }
    }
  }

  // 2. Retrieve encrypted token
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token_encrypted')
    .eq('org_id', orgId)
    .eq('service_name', serviceKey)
    .single()

  if (!integration?.access_token_encrypted) {
    return { success: false, error: `${serviceKey} is not connected.` }
  }

  // 3. Decrypt — happens server-side only, token never leaves the server
  const accessToken = decryptToken(integration.access_token_encrypted)

  // 4. Execute via Composio with the decrypted token
  const composioResponse = await fetch('https://backend.composio.dev/api/v1/actions/execute', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.COMPOSIO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      actionName: action,         // e.g. 'GITHUB_CREATE_ISSUE', 'LINKEDIN_CREATE_POST'
      connectedAccountId: orgId,  // Composio uses this to route to the right connection
      input: parameters,
      authConfig: {
        access_token: accessToken, // passed directly — Composio uses it for the API call
      },
    }),
  })

  const result = await composioResponse.json()

  if (!composioResponse.ok) {
    return { success: false, error: result.message || 'Composio execution failed' }
  }

  return { success: true, result: result.data }
}
