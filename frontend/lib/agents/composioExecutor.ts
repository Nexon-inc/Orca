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

  // Retrieve encrypted token
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token_encrypted, metadata')
    .eq('org_id', orgId)
    .eq('service_name', serviceKey)
    .single()

  if (!integration?.access_token_encrypted) {
    return { success: false, error: `${serviceKey} is not connected.` }
  }

  const tokenValue = decryptToken(integration.access_token_encrypted)
  const isComposio = integration.metadata?.auth_type === 'composio'

  const requestBody: any = {
    actionName: action,
    input: parameters
  }

  if (isComposio) {
    requestBody.connectedAccountId = tokenValue
  } else {
    // 1. Check integration is connected and token is valid (fallback/legacy flow)
    const { valid, error: tokenError } = await validateIntegrationToken(orgId, serviceKey)

    if (!valid) {
      // Try refreshing token first
      const newToken = await refreshOAuthToken(orgId, serviceKey)
      if (!newToken) {
        return { success: false, error: tokenError }
      }
    }

    requestBody.connectedAccountId = orgId
    requestBody.authConfig = {
      access_token: tokenValue
    }
  }

  const composioResponse = await fetch('https://backend.composio.dev/api/v1/actions/execute', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.COMPOSIO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const result = await composioResponse.json()

  if (!composioResponse.ok) {
    return { success: false, error: result.message || 'Composio execution failed' }
  }

  return { success: true, result: result.data }
}
