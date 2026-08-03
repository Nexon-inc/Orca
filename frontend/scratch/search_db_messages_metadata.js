const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function searchMessagesMetadata() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('messages')
    .select('id, metadata');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Checking metadata of ${data.length} messages:`);
  data.forEach(m => {
    const str = JSON.stringify(m.metadata);
    if (str && (str.includes('LinkedIn') || str.includes('outreach') || str.includes('competitor') || str.includes('09:14'))) {
      console.log(`- MATCH (id: ${m.id}): ${str.slice(0, 300)}`);
    }
  });
}

searchMessagesMetadata();
