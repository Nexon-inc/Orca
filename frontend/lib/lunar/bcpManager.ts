import { createServiceSupabaseClient } from '@/lib/supabase/server';

export interface BCP {
  id?: string;
  org_id: string;
  version: number;
  company_snapshot: Record<string, any>;
  business_goals: Record<string, any>;
  products: any[];
  connected_systems: Record<string, any>;
  active_agents: any[];
  customer_insights: Record<string, any>;
  team_context: Record<string, any>;
  historical_memory: Record<string, any>;
  orca_context: Record<string, any>;
  lunar_operating_rules: Record<string, any>;
  bcp_events: any[];
  conflicts: any[];
  onboarding_score: number;
  last_updated_by: string;
  updated_at?: string;
}

export async function loadBCP(orgId: string): Promise<BCP | null> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from('bcp')
    .select('*')
    .eq('org_id', orgId)
    .single();

  if (error || !data) {
    return await createBCP(orgId);
  }
  return data as BCP;
}

export async function createBCP(orgId: string): Promise<BCP> {
  const supabase = createServiceSupabaseClient();
  const newBcp: Partial<BCP> = {
    org_id: orgId,
    version: 1,
    company_snapshot: {},
    business_goals: {},
    products: [],
    connected_systems: {},
    active_agents: [],
    customer_insights: {},
    team_context: {},
    historical_memory: {},
    orca_context: {},
    lunar_operating_rules: {},
    bcp_events: [],
    conflicts: [],
    onboarding_score: 10,
    last_updated_by: 'lunar',
  };

  const { data, error } = await supabase
    .from('bcp')
    .insert(newBcp)
    .select()
    .single();

  if (error) {
    console.error('[BCP_CREATE_ERROR]', error);
    return newBcp as BCP;
  }
  return data as BCP;
}

export function setNestedField(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

export function calculateOnboardingScore(bcp: BCP): number {
  let score = 10;
  if (bcp.company_snapshot && Object.keys(bcp.company_snapshot).length > 0) score += 20;
  if (bcp.business_goals && Object.keys(bcp.business_goals).length > 0) score += 20;
  if (bcp.products && bcp.products.length > 0) score += 15;
  if (bcp.customer_insights && Object.keys(bcp.customer_insights).length > 0) score += 15;
  if (bcp.connected_systems && Object.keys(bcp.connected_systems).length > 0) score += 10;
  if (bcp.lunar_operating_rules && Object.keys(bcp.lunar_operating_rules).length > 0) score += 10;
  return Math.min(100, score);
}

export async function applyBCPUpdates(
  orgId: string,
  updates: Array<{ section: string; field?: string; value: any }>
): Promise<BCP> {
  const bcp = (await loadBCP(orgId)) || (await createBCP(orgId));
  const supabase = createServiceSupabaseClient();

  for (const update of updates) {
    const { section, field, value } = update;
    if (section in bcp) {
      if (field) {
        setNestedField((bcp as any)[section], field, value);
      } else {
        (bcp as any)[section] = value;
      }
    }
  }

  bcp.version += 1;
  bcp.onboarding_score = calculateOnboardingScore(bcp);
  bcp.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('bcp')
    .update({
      version: bcp.version,
      company_snapshot: bcp.company_snapshot,
      business_goals: bcp.business_goals,
      products: bcp.products,
      connected_systems: bcp.connected_systems,
      active_agents: bcp.active_agents,
      customer_insights: bcp.customer_insights,
      team_context: bcp.team_context,
      historical_memory: bcp.historical_memory,
      orca_context: bcp.orca_context,
      lunar_operating_rules: bcp.lunar_operating_rules,
      onboarding_score: bcp.onboarding_score,
      updated_at: bcp.updated_at,
    })
    .eq('org_id', orgId)
    .select()
    .single();

  if (error) {
    console.error('[BCP_UPDATE_ERROR]', error);
  }

  return (data || bcp) as BCP;
}

export function renderBCPasMarkdown(bcp: BCP): string {
  if (!bcp) return '# Business Context Protocol (BCP)\nNo BCP data configured.';

  return `# Business Context Protocol (BCP) v${bcp.version}
**Completeness:** ${bcp.onboarding_score}% | **Last Updated:** ${bcp.updated_at || 'Recently'}

## Company Snapshot
\`\`\`json
${JSON.stringify(bcp.company_snapshot || {}, null, 2)}
\`\`\`

## Business Goals
\`\`\`json
${JSON.stringify(bcp.business_goals || {}, null, 2)}
\`\`\`

## Products & Offers
\`\`\`json
${JSON.stringify(bcp.products || [], null, 2)}
\`\`\`

## Customer Insights
\`\`\`json
${JSON.stringify(bcp.customer_insights || {}, null, 2)}
\`\`\`

## Connected Systems
\`\`\`json
${JSON.stringify(bcp.connected_systems || {}, null, 2)}
\`\`\`

## Operating Rules
\`\`\`json
${JSON.stringify(bcp.lunar_operating_rules || {}, null, 2)}
\`\`\`
`;
}
