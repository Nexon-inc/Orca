import {
  getAllCatalogTools,
  getCatalogTool,
  type IntegrationCatalogTool,
} from './catalog'

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

function catalogToConfig(tool: IntegrationCatalogTool): IntegrationConfig {
  return {
    name: tool.name,
    service_key: tool.service_key,
    department_key: tool.department_key,
    auth_method: 'oauth',
    agents: tool.agents,
    plan_required: 'builder',
  }
}

/** All connectable integrations (Composio OAuth) */
export const INTEGRATION_REGISTRY: IntegrationConfig[] = getAllCatalogTools().map(catalogToConfig)

export function getIntegrationConfig(serviceKey: string): IntegrationConfig | undefined {
  const tool = getCatalogTool(serviceKey)
  if (tool) return catalogToConfig(tool)
  return INTEGRATION_REGISTRY.find((i) => i.service_key === serviceKey)
}

export function getDeptIntegrations(deptKey: string): IntegrationConfig[] {
  return INTEGRATION_REGISTRY.filter((i) => i.department_key === deptKey)
}
