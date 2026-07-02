import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/security/encrypt'
import { refreshOAuthToken } from '@/lib/integrations/tokenRefresh'
import { validateIntegrationToken } from '@/lib/agents/validateToken'

export async function executeViaComposio(
  orgId: string,
  serviceKey: string,
  action: string,
  parameters: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const supabase = createServiceSupabaseClient()

  // Retrieve integrations for this org
  const { data: allIntegrations } = await supabase
    .from('integrations')
    .select('access_token_encrypted, metadata, service_name')
    .eq('org_id', orgId)

  // Find the best match:
  // 1. Exact match with serviceKey (e.g. 'twitter')
  // 2. Exact match with the full action/tool name (e.g. 'gmail_outreach')
  // 3. Starts with serviceKey (e.g. 'google' -> 'google_drive')
  // 4. Starts with full action name
  const integration = allIntegrations?.find(i => i.service_name === serviceKey) ||
                      allIntegrations?.find(i => i.service_name === action) ||
                      allIntegrations?.find(i => i.service_name.startsWith(serviceKey)) ||
                      allIntegrations?.find(i => i.service_name.includes(serviceKey)) ||
                      allIntegrations?.find(i => action.startsWith(i.service_name));

  if (!integration?.access_token_encrypted) {
    return { success: false, error: `Integration for '${serviceKey}' is not connected in your command center.` }
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
