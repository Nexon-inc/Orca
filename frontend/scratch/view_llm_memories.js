const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function viewMemories() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('llm_memories')
    .select('*');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Memories count: ${data.length}`);
    data.forEach(m => {
      console.log(`- ${m.id}: agent=${m.agent_id}, memory_text=${m.memory_text || m.content}`);
    });
  }
}

viewMemories();
