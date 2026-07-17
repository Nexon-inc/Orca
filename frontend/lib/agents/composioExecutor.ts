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

  // Map action name to Composio v3.1 slug
  const ACTION_MAP: Record<string, string> = {
    'twitter_post': 'TWITTER_CREATION_OF_A_POST',
    'twitter_create_tweet': 'TWITTER_CREATION_OF_A_POST',
    'github_create_pr': 'GITHUB_CREATE_A_PULL_REQUEST',
    'github_create_pull_request': 'GITHUB_CREATE_A_PULL_REQUEST',
    'hubspot_create_deal': 'HUBSPOT_CREATE_DEAL',
    'linkedin_post': 'LINKEDIN_CREATE_LINKED_IN_POST',
    'linkedin_share': 'LINKEDIN_CREATE_ARTICLE_OR_URL_SHARE',
    'slack_post': 'SLACK_CHAT_POST_MESSAGE',
    'slack_message': 'SLACK_CHAT_POST_MESSAGE',
    'slack_chat_post_message': 'SLACK_CHAT_POST_MESSAGE',
    'notion_create_page': 'NOTION_CREATE_NOTION_PAGE',
    'notion_post': 'NOTION_CREATE_NOTION_PAGE'
  };

  const mappedAction = ACTION_MAP[action] || action.toUpperCase();

  // Enrich parameters
  const finalParams = { ...parameters };

  if (mappedAction === 'GITHUB_CREATE_A_PULL_REQUEST') {
    // Map branch to head
    if (finalParams.branch && !finalParams.head) {
      finalParams.head = finalParams.branch;
    }
    // Default base to main
    if (!finalParams.base) {
      finalParams.base = 'main';
    }
    // Parse owner/repo
    if (typeof finalParams.repo === 'string') {
      if (finalParams.repo.includes('/')) {
        const [owner, repoName] = finalParams.repo.split('/');
        finalParams.owner = owner.trim();
        finalParams.repo = repoName.trim();
      } else {
        // Fetch owner dynamically from GitHub API via Composio
        try {
          // Get connection first to resolve entityId
          const accountRes = await fetch(`https://backend.composio.dev/api/v3.1/connected_accounts/${tokenValue}`, {
            headers: { 'x-api-key': process.env.COMPOSIO_API_KEY! }
          });
          const accountData = await accountRes.json();
          const entityId = accountData.user_id;

          if (entityId) {
            const userRes = await fetch(`https://backend.composio.dev/api/v3.1/tools/execute/GITHUB_GET_THE_AUTHENTICATED_USER`, {
              method: 'POST',
              headers: {
                'x-api-key': process.env.COMPOSIO_API_KEY!,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                connected_account_id: tokenValue,
                entity_id: entityId,
                arguments: {}
              })
            });
            const userData = await userRes.json();
            const login = userData.data?.data?.login || userData.data?.login;
            if (login) {
              finalParams.owner = login;
            }
          }
        } catch (err) {
          console.error('[COMPOSIO_EXEC] Failed to resolve GitHub owner:', err);
        }
      }
    }
  }

  // Construct request body and execute
  let executeUrl = `https://backend.composio.dev/api/v3.1/tools/execute/${mappedAction}`;
  let requestHeaders: Record<string, string> = {
    'x-api-key': process.env.COMPOSIO_API_KEY!,
    'Content-Type': 'application/json',
  };
  let requestBody: any = {};

  if (isComposio) {
    // 1. Fetch connected account to get user_id (entity_id) dynamically
    let entityId = '';
    try {
      const accountRes = await fetch(`https://backend.composio.dev/api/v3.1/connected_accounts/${tokenValue}`, {
        headers: { 'x-api-key': process.env.COMPOSIO_API_KEY! }
      });
      const accountData = await accountRes.json();
      entityId = accountData.user_id;
    } catch (e) {
      console.error('[COMPOSIO_EXEC] Failed to fetch connected account details:', e);
    }

    requestBody = {
      connected_account_id: tokenValue,
      entity_id: entityId,
      arguments: finalParams
    };
  } else {
    // Check integration is connected and token is valid (fallback/legacy flow)
    const { valid, error: tokenError } = await validateIntegrationToken(orgId, serviceKey)

    if (!valid) {
      const newToken = await refreshOAuthToken(orgId, serviceKey)
      if (!newToken) {
        return { success: false, error: tokenError }
      }
    }

    executeUrl = 'https://backend.composio.dev/api/v3.1/tools/execute/proxy';
    requestBody = {
      connected_account_id: orgId,
      authConfig: {
        access_token: tokenValue
      },
      arguments: finalParams
    };
  }

  const composioResponse = await fetch(executeUrl, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(requestBody),
  });

  const result = await composioResponse.json();

  if (!composioResponse.ok || result.successful === false) {
    return { success: false, error: result.error?.message || result.error || result.message || 'Composio execution failed' }
  }

  return { success: true, result: result.data }
}
