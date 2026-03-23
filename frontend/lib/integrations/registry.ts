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
  plan_required: 'free' | 'starter' | 'pro' | 'enterprise'
}

export const INTEGRATION_REGISTRY: IntegrationConfig[] = [
  // ─── MARKETING ──────────────────────────────────────────────
  { name: 'LinkedIn', service_key: 'linkedin', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://www.linkedin.com/oauth/v2/authorization',
    oauth_token_url: 'https://www.linkedin.com/oauth/v2/accessToken',
    oauth_scopes: ['openid', 'profile', 'email', 'w_member_social'],
    oauth_client_id_env: 'LINKEDIN_CLIENT_ID', oauth_client_secret_env: 'LINKEDIN_CLIENT_SECRET',
    agents: ['Aria', 'Mark'], plan_required: 'starter' },
  { name: 'X / Twitter', service_key: 'twitter', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://twitter.com/i/oauth2/authorize',
    oauth_token_url: 'https://api.twitter.com/2/oauth2/token',
    oauth_scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    oauth_client_id_env: 'TWITTER_CLIENT_ID', oauth_client_secret_env: 'TWITTER_CLIENT_SECRET',
    agents: ['Aria'], plan_required: 'starter' },
  { name: 'Meta (Instagram + Facebook)', service_key: 'meta', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://www.facebook.com/v18.0/dialog/oauth',
    oauth_token_url: 'https://graph.facebook.com/v18.0/oauth/access_token',
    oauth_scopes: ['pages_show_list', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish'],
    oauth_client_id_env: 'META_APP_ID', oauth_client_secret_env: 'META_APP_SECRET',
    agents: ['Aria'], plan_required: 'starter' },
  { name: 'Mailchimp', service_key: 'mailchimp', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://login.mailchimp.com/oauth2/authorize',
    oauth_token_url: 'https://login.mailchimp.com/oauth2/token',
    oauth_client_id_env: 'MAILCHIMP_CLIENT_ID', oauth_client_secret_env: 'MAILCHIMP_CLIENT_SECRET',
    agents: ['Jackie'], plan_required: 'starter' },
  { name: 'Google Analytics', service_key: 'google_analytics', department_key: 'marketing', auth_method: 'oauth',
    oauth_authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    oauth_token_url: 'https://oauth2.googleapis.com/token',
    oauth_scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    oauth_client_id_env: 'GOOGLE_CLIENT_ID', oauth_client_secret_env: 'GOOGLE_CLIENT_SECRET',
    agents: ['Lucy'], plan_required: 'starter' },
  { name: 'Ahrefs', service_key: 'ahrefs', department_key: 'marketing', auth_method: 'apikey',
    apikey_test_url: 'https://apiv2.ahrefs.com/?from=subscription_info&output=json',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Lucy'], plan_required: 'pro' },
  { name: 'Semrush', service_key: 'semrush', department_key: 'marketing', auth_method: 'apikey',
    apikey_test_url: 'https://api.semrush.com/?type=phrase_this&phrase=test',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Lucy', 'Roman'], plan_required: 'pro' },

  // ─── SALES ──────────────────────────────────────────────────
  { name: 'HubSpot', service_key: 'hubspot', department_key: 'sales', auth_method: 'oauth',
    oauth_authorize_url: 'https://app.hubspot.com/oauth/authorize',
    oauth_token_url: 'https://api.hubapi.com/oauth/v1/token',
    oauth_scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.deals.read', 'crm.objects.deals.write'],
    oauth_client_id_env: 'HUBSPOT_CLIENT_ID', oauth_client_secret_env: 'HUBSPOT_CLIENT_SECRET',
    agents: ['Clara', 'Rex'], plan_required: 'starter' },
  { name: 'Apollo.io', service_key: 'apollo', department_key: 'sales', auth_method: 'apikey',
    apikey_test_url: 'https://api.apollo.io/v1/auth/health', apikey_test_header: 'X-Api-Key',
    agents: ['Rex'], plan_required: 'starter' },
  { name: 'Hunter.io', service_key: 'hunter', department_key: 'sales', auth_method: 'apikey',
    apikey_test_url: 'https://api.hunter.io/v2/account',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Rex', 'Mark'], plan_required: 'starter' },
  { name: 'Gmail (Outreach)', service_key: 'gmail_outreach', department_key: 'sales', auth_method: 'oauth',
    oauth_authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    oauth_token_url: 'https://oauth2.googleapis.com/token',
    oauth_scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
    oauth_client_id_env: 'GOOGLE_CLIENT_ID', oauth_client_secret_env: 'GOOGLE_CLIENT_SECRET',
    agents: ['Mark', 'Chase'], plan_required: 'starter' },

  // ─── CUSTOMER SUCCESS ────────────────────────────────────────
  { name: 'Intercom', service_key: 'intercom', department_key: 'cs', auth_method: 'oauth',
    oauth_authorize_url: 'https://app.intercom.com/oauth',
    oauth_token_url: 'https://api.intercom.io/auth/eagle/token',
    oauth_client_id_env: 'INTERCOM_CLIENT_ID', oauth_client_secret_env: 'INTERCOM_CLIENT_SECRET',
    agents: ['Purity'], plan_required: 'starter' },
  { name: 'Zendesk', service_key: 'zendesk', department_key: 'cs', auth_method: 'oauth',
    oauth_authorize_url: 'https://{subdomain}.zendesk.com/oauth/authorizations/new',
    oauth_token_url: 'https://{subdomain}.zendesk.com/oauth/tokens',
    oauth_client_id_env: 'ZENDESK_CLIENT_ID', oauth_client_secret_env: 'ZENDESK_CLIENT_SECRET',
    agents: ['Purity'], plan_required: 'starter' },
  { name: 'Typeform', service_key: 'typeform', department_key: 'cs', auth_method: 'oauth',
    oauth_authorize_url: 'https://api.typeform.com/oauth/authorize',
    oauth_token_url: 'https://api.typeform.com/oauth/token',
    oauth_scopes: ['responses:read', 'forms:read', 'forms:write'],
    oauth_client_id_env: 'TYPEFORM_CLIENT_ID', oauth_client_secret_env: 'TYPEFORM_CLIENT_SECRET',
    agents: ['John'], plan_required: 'starter' },

  // ─── TECH & SECURITY ────────────────────────────────────────
  { name: 'GitHub', service_key: 'github', department_key: 'tech', auth_method: 'oauth',
    oauth_authorize_url: 'https://github.com/login/oauth/authorize',
    oauth_token_url: 'https://github.com/login/oauth/access_token',
    oauth_scopes: ['repo', 'read:user', 'workflow'],
    oauth_client_id_env: 'GITHUB_CLIENT_ID', oauth_client_secret_env: 'GITHUB_CLIENT_SECRET',
    agents: ['Ghost', 'Cipher', 'Wren', 'Hex', 'Volt'], plan_required: 'starter' },
  { name: 'Vercel', service_key: 'vercel', department_key: 'tech', auth_method: 'apikey',
    apikey_test_url: 'https://api.vercel.com/v2/user',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Wren'], plan_required: 'starter' },
  { name: 'Sentry', service_key: 'sentry', department_key: 'tech', auth_method: 'apikey',
    apikey_test_url: 'https://sentry.io/api/0/',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Volt'], plan_required: 'starter' },

  // ─── HIRING ─────────────────────────────────────────────────
  { name: 'LinkedIn (Hiring)', service_key: 'linkedin_hiring', department_key: 'hiring', auth_method: 'oauth',
    oauth_authorize_url: 'https://www.linkedin.com/oauth/v2/authorization',
    oauth_token_url: 'https://www.linkedin.com/oauth/v2/accessToken',
    oauth_scopes: ['openid', 'profile', 'email', 'r_liteprofile'],
    oauth_client_id_env: 'LINKEDIN_CLIENT_ID', oauth_client_secret_env: 'LINKEDIN_CLIENT_SECRET',
    agents: ['Marcus'], plan_required: 'starter' },
  { name: 'Workable', service_key: 'workable', department_key: 'hiring', auth_method: 'apikey',
    apikey_test_url: 'https://{subdomain}.workable.com/spi/v3/accounts',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Marcus', 'Vera'], plan_required: 'pro' },

  // ─── OPERATIONS ──────────────────────────────────────────────
  { name: 'Notion', service_key: 'notion', department_key: 'ops', auth_method: 'oauth',
    oauth_authorize_url: 'https://api.notion.com/v1/oauth/authorize',
    oauth_token_url: 'https://api.notion.com/v1/oauth/token',
    oauth_client_id_env: 'NOTION_CLIENT_ID', oauth_client_secret_env: 'NOTION_CLIENT_SECRET',
    agents: ['Dean', 'Nina', 'Eli'], plan_required: 'starter' },
  { name: 'Google Calendar', service_key: 'google_calendar', department_key: 'ops', auth_method: 'oauth',
    oauth_authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    oauth_token_url: 'https://oauth2.googleapis.com/token',
    oauth_scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    oauth_client_id_env: 'GOOGLE_CLIENT_ID', oauth_client_secret_env: 'GOOGLE_CLIENT_SECRET',
    agents: ['Cal'], plan_required: 'starter' },
  { name: 'Slack', service_key: 'slack', department_key: 'ops', auth_method: 'oauth',
    oauth_authorize_url: 'https://slack.com/oauth/v2/authorize',
    oauth_token_url: 'https://slack.com/api/oauth.v2.access',
    oauth_scopes: ['chat:write', 'channels:read', 'im:write', 'users:read'],
    oauth_client_id_env: 'SLACK_CLIENT_ID', oauth_client_secret_env: 'SLACK_CLIENT_SECRET',
    agents: ['Iris', 'Owen', 'Milo', 'Purity', 'Nina'], plan_required: 'starter' },

  // ─── FINANCE ─────────────────────────────────────────────────
  { name: 'QuickBooks', service_key: 'quickbooks', department_key: 'finance', auth_method: 'oauth',
    oauth_authorize_url: 'https://appcenter.intuit.com/connect/oauth2',
    oauth_token_url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    oauth_scopes: ['com.intuit.quickbooks.accounting'],
    oauth_client_id_env: 'QUICKBOOKS_CLIENT_ID', oauth_client_secret_env: 'QUICKBOOKS_CLIENT_SECRET',
    agents: ['Felix', 'Cora'], plan_required: 'pro' },
  { name: 'DocuSign', service_key: 'docusign', department_key: 'finance', auth_method: 'oauth',
    oauth_authorize_url: 'https://account.docusign.com/oauth/auth',
    oauth_token_url: 'https://account.docusign.com/oauth/token',
    oauth_scopes: ['signature', 'impersonation'],
    oauth_client_id_env: 'DOCUSIGN_CLIENT_ID', oauth_client_secret_env: 'DOCUSIGN_CLIENT_SECRET',
    agents: ['Lena'], plan_required: 'pro' },

  // ─── INTELLIGENCE ────────────────────────────────────────────
  { name: 'Perplexity AI', service_key: 'perplexity', department_key: 'intel', auth_method: 'apikey',
    apikey_test_url: 'https://api.perplexity.ai/chat/completions',
    apikey_test_header: 'Authorization', apikey_test_prefix: 'Bearer ',
    agents: ['Roman'], plan_required: 'pro' },

  // ─── COMMUNITY ──────────────────────────────────────────────
  { name: 'Discord', service_key: 'discord', department_key: 'community', auth_method: 'oauth',
    oauth_authorize_url: 'https://discord.com/api/oauth2/authorize',
    oauth_token_url: 'https://discord.com/api/oauth2/token',
    oauth_scopes: ['bot', 'guilds', 'messages.read'],
    oauth_client_id_env: 'DISCORD_CLIENT_ID', oauth_client_secret_env: 'DISCORD_CLIENT_SECRET',
    agents: ['Milo'], plan_required: 'pro' },
]

export function getIntegrationConfig(serviceKey: string): IntegrationConfig | undefined {
  return INTEGRATION_REGISTRY.find(i => i.service_key === serviceKey)
}

export function getDeptIntegrations(deptKey: string): IntegrationConfig[] {
  return INTEGRATION_REGISTRY.filter(i => i.department_key === deptKey)
}
