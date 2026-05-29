/**
 * Integrations shown in Dashboard → Integrations.
 * OAuth connections run through Composio (see composio_slug).
 */

export type IntegrationCatalogTool = {
  service_key: string
  name: string
  composio_slug: string
  color: string
  department_key: string
  agents: string[]
}

export type IntegrationCatalogGroup = {
  id: string
  name: string
  tools: IntegrationCatalogTool[]
}

/** ORCA service_key → Composio toolkit slug */
export const COMPOSIO_SLUG_MAP: Record<string, string> = {
  gmail_outreach: 'gmail',
  hubspot: 'hubspot',
  linkedin: 'linkedin',
  google_drive: 'googledrive',
  notion: 'notion',
  twitter: 'twitter',
  slack: 'slack',
  github: 'github',
  google_calendar: 'googlecalendar',
  meta: 'facebook',
  mailchimp: 'mailchimp',
  intercom: 'intercom',
  linear: 'linear',
  instagram: 'instagram',
  googlesheets: 'googlesheets',
  supabase: 'supabase',
  outlook: 'outlook',
  perplexityai: 'perplexityai',
  googledocs: 'googledocs',
  airtable: 'airtable',
  serpapi: 'serpapi',
  jira: 'jira',
  firecrawl: 'firecrawl',
  tavily: 'tavily',
  youtube: 'youtube',
  slackbot: 'slackbot',
}

export const INTEGRATION_CATALOG: IntegrationCatalogGroup[] = [
  {
    id: 'marketing',
    name: 'Marketing & Social',
    tools: [
      { service_key: 'linkedin', name: 'LinkedIn', composio_slug: 'linkedin', color: '#0A66C2', department_key: 'marketing', agents: ['Aria'] },
      { service_key: 'twitter', name: 'X / Twitter', composio_slug: 'twitter', color: '#000000', department_key: 'marketing', agents: ['Aria'] },
      { service_key: 'meta', name: 'Meta (Facebook)', composio_slug: 'facebook', color: '#0082FB', department_key: 'marketing', agents: ['Aria'] },
      { service_key: 'instagram', name: 'Instagram', composio_slug: 'instagram', color: '#E4405F', department_key: 'marketing', agents: ['Aria'] },
      { service_key: 'mailchimp', name: 'Mailchimp', composio_slug: 'mailchimp', color: '#FFE01B', department_key: 'marketing', agents: ['Aria'] },
      { service_key: 'youtube', name: 'YouTube', composio_slug: 'youtube', color: '#FF0000', department_key: 'marketing', agents: ['Aria'] },
    ],
  },
  {
    id: 'sales',
    name: 'Sales & Email',
    tools: [
      { service_key: 'hubspot', name: 'HubSpot', composio_slug: 'hubspot', color: '#FF7A59', department_key: 'sales', agents: ['Rex'] },
      { service_key: 'gmail_outreach', name: 'Gmail Outreach', composio_slug: 'gmail', color: '#EA4335', department_key: 'sales', agents: ['Rex'] },
      { service_key: 'outlook', name: 'Outlook', composio_slug: 'outlook', color: '#0078D4', department_key: 'sales', agents: ['Rex'] },
    ],
  },
  {
    id: 'cs',
    name: 'Success & Support',
    tools: [
      { service_key: 'intercom', name: 'Intercom', composio_slug: 'intercom', color: '#6AFDEF', department_key: 'cs', agents: ['Purity'] },
      { service_key: 'slack', name: 'Slack', composio_slug: 'slack', color: '#4A154B', department_key: 'cs', agents: ['Purity', 'Atlas'] },
      { service_key: 'slackbot', name: 'Slackbot', composio_slug: 'slackbot', color: '#4A154B', department_key: 'cs', agents: ['Purity'] },
    ],
  },
  {
    id: 'ops',
    name: 'Operations & Docs',
    tools: [
      { service_key: 'notion', name: 'Notion', composio_slug: 'notion', color: '#FFFFFF', department_key: 'ops', agents: ['Purity', 'Roman', 'Atlas'] },
      { service_key: 'google_drive', name: 'Google Drive', composio_slug: 'googledrive', color: '#4285F4', department_key: 'ops', agents: ['Atlas', 'Aria', 'Purity'] },
      { service_key: 'googledocs', name: 'Google Docs', composio_slug: 'googledocs', color: '#4285F4', department_key: 'ops', agents: ['Atlas', 'Aria'] },
      { service_key: 'googlesheets', name: 'Google Sheets', composio_slug: 'googlesheets', color: '#34A853', department_key: 'ops', agents: ['Atlas', 'Rex'] },
      { service_key: 'google_calendar', name: 'Google Calendar', composio_slug: 'googlecalendar', color: '#4285F4', department_key: 'ops', agents: ['Atlas'] },
      { service_key: 'airtable', name: 'Airtable', composio_slug: 'airtable', color: '#FCB400', department_key: 'ops', agents: ['Atlas', 'Rex'] },
      { service_key: 'linear', name: 'Linear', composio_slug: 'linear', color: '#5E6AD2', department_key: 'ops', agents: ['Ghost', 'Atlas'] },
      { service_key: 'jira', name: 'Jira', composio_slug: 'jira', color: '#0052CC', department_key: 'ops', agents: ['Ghost', 'Atlas'] },
    ],
  },
  {
    id: 'tech',
    name: 'Engineering & Data',
    tools: [
      { service_key: 'github', name: 'GitHub', composio_slug: 'github', color: '#24292e', department_key: 'tech', agents: ['Ghost'] },
      { service_key: 'supabase', name: 'Supabase', composio_slug: 'supabase', color: '#3FCF8E', department_key: 'tech', agents: ['Ghost', 'Atlas'] },
    ],
  },
  {
    id: 'intel',
    name: 'Intelligence & Research',
    tools: [
      { service_key: 'perplexityai', name: 'Perplexity AI', composio_slug: 'perplexityai', color: '#20B8CD', department_key: 'intel', agents: ['Roman', 'Atlas'] },
      { service_key: 'serpapi', name: 'SerpAPI', composio_slug: 'serpapi', color: '#4285F4', department_key: 'intel', agents: ['Roman', 'Aria'] },
      { service_key: 'tavily', name: 'Tavily', composio_slug: 'tavily', color: '#6366F1', department_key: 'intel', agents: ['Roman'] },
      { service_key: 'firecrawl', name: 'Firecrawl', composio_slug: 'firecrawl', color: '#FF6B35', department_key: 'intel', agents: ['Roman', 'Ghost'] },
    ],
  },
]

export function getAllCatalogTools(): IntegrationCatalogTool[] {
  return INTEGRATION_CATALOG.flatMap((g) => g.tools)
}

export function getCatalogTool(serviceKey: string): IntegrationCatalogTool | undefined {
  return getAllCatalogTools().find((t) => t.service_key === serviceKey)
}

export function getComposioSlug(serviceKey: string): string {
  return COMPOSIO_SLUG_MAP[serviceKey] || serviceKey
}
