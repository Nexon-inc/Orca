const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function listTables() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .rpc('get_tables_list'); // testing if get_tables_list exists

  if (error) {
    // query information_schema
    const { data: tables, error: sqlError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (sqlError) {
      // try fallback select tablename from pg_catalog.pg_tables
      console.error('Error listing tables:', sqlError);
    } else {
      console.log('Tables in public schema:', tables.map(t => t.tablename));
    }
  } else {
    console.log('Tables:', tables);
  }
}

listTables();
