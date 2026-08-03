const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

const tables = [
  'profiles', 'organizations', 'org_members', 'company_identity',
  'departments', 'agents', 'conversations', 'messages',
  'team_messages', 'coordination_events', 'approval_requests', 'dept_reports',
  'integrations', 'invite_tokens', 'waitlist', 'audit_logs',
  'oauth_states', 'llm_configs', 'orcahub_templates', 'orcahub_installs',
  'pending_briefs', 'processed_webhook_events', 'agent_action_limits', 'rate_limit_buckets',
  'audit_log', 'candidate_verifications', 'coordination_links', 'founding_members',
  'founding_config', 'llm_memories', 'project_milestones', 'project_inputs'
];

async function checkCounts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`Table "${table}": Error - ${error.message}`);
    } else {
      console.log(`Table "${table}": ${count} rows`);
    }
  }
}

checkCounts();
