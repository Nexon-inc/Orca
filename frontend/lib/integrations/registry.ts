export type AuthMethod = 'oauth' | 'apikey'

export interface IntegrationConfig {
  name: string
  service_key: string
  department_key: string
  auth_method: AuthMethod
  oauth_authorize_url?: string
  oauth_token_url?: string
  oauth_scopes?: string[]
  oauth_client_id_env?: string
  oauth_client_secret_env?: string
  apikey_test_url?: string
  apikey_test_header?: string
  apikey_test_prefix?: string
  agents: string[]
  plan_required: 'free' | 'builder' | 'pro'
}

export const INTEGRATION_REGISTRY: IntegrationConfig[] = [
  // --- MARKETING ----------------------------------------------
  { name: 'LinkedIn', service_key: 'linkedin', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://www.linkedin.com/oauth/v2/authorization',
    oauth_token_url: 'https://www.linkedin.com/oauth/v2/accessToken',
    oauth_scopes: ['openid', 'profile', 'email', 'w_member_social'],
    oauth_client_id_env: 'LINKEDIN_CLIENT_ID', oauth_client_secret_env: 'LINKEDIN_CLIENT_SECRET',
    agents: ['Aria'], plan_required: 'builder' },
  { name: 'X / Twitter', service_key: 'twitter', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://twitter.com/i/oauth2/authorize',
    oauth_token_url: 'https://api.twitter.com/2/oauth2/token',
    oauth_scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    oauth_client_id_env: 'TWITTER_CLIENT_ID', oauth_client_secret_env: 'TWITTER_CLIENT_SECRET',
    agents: ['Aria'], plan_required: 'builder' },
  { name: 'Meta (IG/FB)', service_key: 'meta', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://www.facebook.com/v18.0/dialog/oauth',
    oauth_token_url: 'https://graph.facebook.com/v18.0/oauth/access_token',
    oauth_scopes: ['pages_show_list', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish'],
    oauth_client_id_env: 'META_APP_ID', oauth_client_secret_env: 'META_APP_SECRET',
    agents: ['Aria'], plan_required: 'builder' },
  { name: 'Google Workspace', service_key: 'google', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    oauth_token_url: 'https://oauth2.googleapis.com/token',
    oauth_scopes: ['https://www.googleapis.com/auth/analytics.readonly', 'https://mail.google.com/'],
    oauth_client_id_env: 'GOOGLE_CLIENT_ID', oauth_client_secret_env: 'GOOGLE_CLIENT_SECRET',
    agents: ['Aria', 'Rex'], plan_required: 'builder' },
  { name: 'Brevo (Sendinblue)', service_key: 'brevo', department_key: 'marketing', auth_method: 'apikey',
    apikey_test_url: 'https://api.brevo.com/v3/account',
    apikey_test_header: 'api-key',
    agents: ['Aria'], plan_required: 'builder' },

  // --- SALES --------------------------------------------------
  { name: 'HubSpot', service_key: 'hubspot', department_key: 'sales', auth_method: 'oauth',
    oauth_authorize_url: 'https://app.hubspot.com/oauth/authorize',
    oauth_token_url: 'https://api.hubapi.com/oauth/v1/token',
    oauth_scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.deals.read', 'crm.objects.deals.write'],
    oauth_client_id_env: 'HUBSPOT_CLIENT_ID', oauth_client_secret_env: 'HUBSPOT_CLIENT_SECRET',
    agents: ['Rex'], plan_required: 'builder' },
  { name: 'Hunter.io', service_key: 'hunter', department_key: 'sales', auth_method: 'apikey',
    apikey_test_url: 'https://api.hunter.io/v2/account',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Rex'], plan_required: 'builder' },

  // --- CUSTOMER SUCCESS ----------------------------------------
  { name: 'Slack', service_key: 'slack', department_key: 'cs', auth_method: 'oauth',
    oauth_authorize_url: 'https://slack.com/oauth/v2/authorize',
    oauth_token_url: 'https://slack.com/api/oauth.v2.access',
    oauth_scopes: ['channels:read', 'chat:write', 'groups:read', 'im:read', 'mpim:read'],
    oauth_client_id_env: 'SLACK_CLIENT_ID', oauth_client_secret_env: 'SLACK_CLIENT_SECRET',
    agents: ['Purity'], plan_required: 'builder' },
  { name: 'Notion', service_key: 'notion', department_key: 'cs', auth_method: 'oauth',
    oauth_authorize_url: 'https://api.notion.com/v1/oauth/authorize',
    oauth_token_url: 'https://api.notion.com/v1/oauth/token',
    oauth_client_id_env: 'NOTION_CLIENT_ID', oauth_client_secret_env: 'NOTION_CLIENT_SECRET',
    agents: ['Purity', 'Roman'], plan_required: 'builder' },

  // --- TECH & SECURITY ----------------------------------------
  { name: 'GitHub', service_key: 'github', department_key: 'tech', auth_method: 'oauth',
    oauth_authorize_url: 'https://github.com/login/oauth/authorize',
    oauth_token_url: 'https://github.com/login/oauth/access_token',
    oauth_scopes: ['repo', 'read:user', 'workflow'],
    oauth_client_id_env: 'GITHUB_CLIENT_ID', oauth_client_secret_env: 'GITHUB_CLIENT_SECRET',
    agents: ['Ghost'], plan_required: 'builder' },
  { name: 'Vercel', service_key: 'vercel', department_key: 'tech', auth_method: 'apikey',
    apikey_test_url: 'https://api.vercel.com/v2/user',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Ghost'], plan_required: 'builder' },

  // --- INTELLIGENCE & RESEARCH ---------------------------------
]

export function getIntegrationConfig(serviceKey: string): IntegrationConfig | undefined {
  return INTEGRATION_REGISTRY.find(i => i.service_key === serviceKey)
}

export function getDeptIntegrations(deptKey: string): IntegrationConfig[] {
  return INTEGRATION_REGISTRY.filter(i => i.department_key === deptKey)
}


