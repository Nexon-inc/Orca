const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function queryBriefings() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('briefings')
    .select('*');

  if (error) {
    console.error('Error fetching briefings:', error);
  } else {
    console.log(`Total briefings: ${data.length}`);
    data.forEach(e => {
      console.log(`- ${e.id}: title=${e.title}, content=${e.content.slice(0, 200)}`);
    });
  }
}

queryBriefings();
