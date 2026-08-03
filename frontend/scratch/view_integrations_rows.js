const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function viewIntegrations() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.from('integrations').select('*');
  if (error) {
    console.error('Error fetching integrations:', error);
  } else {
    data.forEach(row => {
      console.log(`Service: ${row.service_name}`);
      console.log(`  Metadata:`, JSON.stringify(row.metadata, null, 2));
      console.log(`  Access Token Encrypted Length:`, row.access_token_encrypted?.length);
    });
  }
}

viewIntegrations();
