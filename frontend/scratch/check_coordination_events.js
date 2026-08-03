const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function queryCoordinationEvents() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('coordination_events')
    .select('*');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Total coordination events: ${data.length}`);
    data.forEach(e => {
      console.log(`- ${e.id}: to=${e.to_agent_id}, status=${e.status}, desc=${e.description}`);
    });
  }
}

queryCoordinationEvents();
