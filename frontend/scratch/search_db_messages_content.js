const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function searchMessages() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('messages')
    .select('id, content, sender_type, metadata');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Checking ${data.length} messages:`);
  data.forEach(m => {
    if (m.content.includes('sweep') || m.content.includes('LinkedIn') || m.content.includes('outreach') || m.content.includes('dispatched')) {
      console.log(`- MATCH (id: ${m.id}, sender: ${m.sender_type}): ${m.content.slice(0, 100)}`);
    }
  });
}

searchMessages();
