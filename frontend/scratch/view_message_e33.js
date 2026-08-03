const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function viewMessage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', 'e3377011-873f-43fc-83d6-b8cffd970741')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`=== Content ===\n${data.content}`);
    console.log(`=== Metadata ===\n${JSON.stringify(data.metadata, null, 2)}`);
  }
}

viewMessage();
