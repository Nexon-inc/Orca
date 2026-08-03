const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function checkIntegrations() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('integrations')
    .select('*');

  if (error) {
    console.error('Error fetching integrations:', error);
  } else {
    console.log(`Connected Integrations (${data.length}):`);
    data.forEach(item => {
      console.log(`- ID: ${item.id}, provider: ${item.provider_key || item.provider}, active: ${item.active}`);
    });
  }
}

checkIntegrations();
