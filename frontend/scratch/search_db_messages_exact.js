const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function searchMessagesExact() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('messages')
    .select('id, content, sender_type');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Checking ${data.length} messages:`);
  data.forEach(m => {
    if (m.content.includes('TASK HISTORY & LOGS') || m.content.includes('09:14')) {
      console.log(`- MATCH (id: ${m.id}, sender: ${m.sender_type}): ${m.content}`);
    }
  });
}

searchMessagesExact();
