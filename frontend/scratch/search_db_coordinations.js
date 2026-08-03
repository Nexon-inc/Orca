const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function checkCoordinations() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('coordinations')
    .select('*');

  if (error) {
    console.error('Error fetching coordinations:', error);
  } else {
    console.log(`Fetched ${data.length} coordinations:`);
    data.forEach(c => {
      console.log(`- ID: ${c.id}, status: ${c.status}, desc: ${c.description}`);
    });
  }
}

checkCoordinations();
