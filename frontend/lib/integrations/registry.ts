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
  // ─── MARKETING ──────────────────────────────────────────────
  { name: 'LinkedIn', service_key: 'linkedin', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://www.linkedin.com/oauth/v2/authorization',
    oauth_token_url: 'https://www.linkedin.com/oauth/v2/accessToken',
    oauth_scopes: ['openid', 'profile', 'email', 'w_member_social'],
    oauth_client_id_env: 'LINKEDIN_CLIENT_ID', oauth_client_secret_env: 'LINKEDIN_CLIENT_SECRET',
    agents: ['Aria', 'Mark'], plan_required: 'builder' },
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
  { name: 'Brevo (Sendinblue)', service_key: 'brevo', department_key: 'marketing', auth_method: 'apikey',
    apikey_test_url: 'https://api.brevo.com/v3/account',
    apikey_test_header: 'api-key',
    agents: ['Jackie', 'Mark'], plan_required: 'builder' },
  { name: 'Google Analytics', service_key: 'google_analytics', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    oauth_token_url: 'https://oauth2.googleapis.com/token',
    oauth_scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    oauth_client_id_env: 'GOOGLE_CLIENT_ID', oauth_client_secret_env: 'GOOGLE_CLIENT_SECRET',
    agents: ['Lucy'], plan_required: 'builder' },

  // ─── SALES ──────────────────────────────────────────────────
  { name: 'HubSpot', service_key: 'hubspot', department_key: 'sales', auth_method: 'oauth',
    oauth_authorize_url: 'https://app.hubspot.com/oauth/authorize',
    oauth_token_url: 'https://api.hubapi.com/oauth/v1/token',
    oauth_scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.deals.read', 'crm.objects.deals.write'],
    oauth_client_id_env: 'HUBSPOT_CLIENT_ID', oauth_client_secret_env: 'HUBSPOT_CLIENT_SECRET',
    agents: ['Clara', 'Rex'], plan_required: 'builder' },
  { name: 'Hunter.io', service_key: 'hunter', department_key: 'sales', auth_method: 'apikey',
    apikey_test_url: 'https://api.hunter.io/v2/account',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Rex', 'Mark'], plan_required: 'builder' },
  { name: 'Apollo.io', service_key: 'apollo', department_key: 'sales', auth_method: 'apikey',
    apikey_test_url: 'https://api.apollo.io/v1/auth/health', apikey_test_header: 'X-Api-Key',
    agents: ['Rex'], plan_required: 'builder' },
  { name: 'Flutterwave', service_key: 'flutterwave', department_key: 'sales', auth_method: 'apikey',
    apikey_test_url: 'https://api.flutterwave.com/v3/transactions', 
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Rex'], plan_required: 'pro' },
  { name: 'Lemon Squeezy', service_key: 'lemonsqueezy', department_key: 'sales', auth_method: 'apikey',
    apikey_test_url: 'https://api.lemonsqueezy.com/v1/me',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Rex'], plan_required: 'pro' },

  // ─── CUSTOMER SUCCESS ────────────────────────────────────────
  { name: 'Crisp', service_key: 'crisp', department_key: 'cs', auth_method: 'apikey',
    apikey_test_url: 'https://api.crisp.chat/v1/website', 
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Basic ',
    agents: ['Purity'], plan_required: 'builder' },
  { name: 'Intercom', service_key: 'intercom', department_key: 'cs', auth_method: 'oauth',
    oauth_authorize_url: 'https://app.intercom.com/oauth',
    oauth_token_url: 'https://api.intercom.io/auth/eagle/token',
    oauth_client_id_env: 'INTERCOM_CLIENT_ID', oauth_client_secret_env: 'INTERCOM_CLIENT_SECRET',
    agents: ['Purity'], plan_required: 'builder' },
  { name: 'Zendesk', service_key: 'zendesk', department_key: 'cs', auth_method: 'oauth',
    oauth_authorize_url: 'https://{subdomain}.zendesk.com/oauth/authorizations/new',
    oauth_token_url: 'https://{subdomain}.zendesk.com/oauth/tokens',
    oauth_client_id_env: 'ZENDESK_CLIENT_ID', oauth_client_secret_env: 'ZENDESK_CLIENT_SECRET',
    agents: ['Purity'], plan_required: 'builder' },

  // ─── TECH & SECURITY ────────────────────────────────────────
  { name: 'GitHub', service_key: 'github', department_key: 'tech', auth_method: 'oauth',
    oauth_authorize_url: 'https://github.com/login/oauth/authorize',
    oauth_token_url: 'https://github.com/login/oauth/access_token',
    oauth_scopes: ['repo', 'read:user', 'workflow'],
    oauth_client_id_env: 'GITHUB_CLIENT_ID', oauth_client_secret_env: 'GITHUB_CLIENT_SECRET',
    agents: ['Ghost', 'Cipher', 'Wren', 'Hex', 'Volt'], plan_required: 'builder' },
  { name: 'Vercel', service_key: 'vercel', department_key: 'tech', auth_method: 'apikey',
    apikey_test_url: 'https://api.vercel.com/v2/user',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Wren'], plan_required: 'builder' },
  { name: 'Sentry', service_key: 'sentry', department_key: 'tech', auth_method: 'apikey',
    apikey_test_url: 'https://sentry.io/api/0/',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Volt'], plan_required: 'builder' },

  // ─── INTELLIGENCE & RESEARCH ─────────────────────────────────
  { name: 'Tavily', service_key: 'tavily', department_key: 'intel', auth_method: 'apikey',
    apikey_test_url: 'https://api.tavily.com/search',
    apikey_test_header: 'api_key',
    agents: ['Roman', 'Finn'], plan_required: 'builder' },
  { name: 'SerpApi', service_key: 'serpapi', department_key: 'intel', auth_method: 'apikey',
    apikey_test_url: 'https://serpapi.com/search',
    apikey_test_header: 'api_key',
    agents: ['Roman', 'Finn'], plan_required: 'builder' },
  { name: 'NewsAPI', service_key: 'newsapi', department_key: 'intel', auth_method: 'apikey',
    apikey_test_url: 'https://newsapi.org/v2/top-headlines',
    apikey_test_header: 'X-Api-Key',
    agents: ['Roman'], plan_required: 'builder' },
  { name: 'Perplexity AI', service_key: 'perplexity', department_key: 'intel', auth_method: 'apikey',
    apikey_test_url: 'https://api.perplexity.ai/chat/completions',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Roman'], plan_required: 'pro' },
]

export function getIntegrationConfig(serviceKey: string): IntegrationConfig | undefined {
  return INTEGRATION_REGISTRY.find(i => i.service_key === serviceKey)
}

export function getDeptIntegrations(deptKey: string): IntegrationConfig[] {
  return INTEGRATION_REGISTRY.filter(i => i.department_key === deptKey)
}
