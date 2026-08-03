const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function queryTables() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get table list
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables_list'); // checking if there is a helper, else run raw query or try tables

  // Let's directly select from potential tables
  const potentialTables = [
    'coordinations', 'coordination_links', 'coordination_runs', 'coordination_events',
    'tasks', 'messages', 'agent_runs', 'agent_coordinations'
  ];

  for (const table of potentialTables) {
    const { data, error } = await supabase.from(table).select('*').limit(20);
    if (!error && data) {
      console.log(`\n--- Table: ${table} (count: ${data.length}) ---`);
      if (data.length > 0) {
        console.log(JSON.stringify(data.slice(0, 5), null, 2));
      }
    }
  }
}

queryTables();
