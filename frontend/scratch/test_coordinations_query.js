const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function testQuery() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const orgId = 'd0d20120-17e8-4120-be5f-0070d83bb5c7';
  
  const { data, error } = await supabase
    .from('coordination_events')
    .select(`
      *,
      to_agent:agents!to_agent_id(id, name, acronym),
      from_agent:agents!from_agent_id(id, name, acronym)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error('Supabase Query Error:', error);
  } else {
    console.log('Query succeeded! Row count:', data.length);
  }
}

testQuery();
