const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('organizations').select('id, name').limit(1);
  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Successfully queried organizations table:', data);
  }

  // Check bcp table
  const { error: bcpError } = await supabase.from('bcp').select('id').limit(1);
  console.log('BCP table status:', bcpError ? bcpError.message : 'Table exists and accessible!');

  // Check lunar_conversations table
  const { error: lunarError } = await supabase.from('lunar_conversations').select('id').limit(1);
  console.log('Lunar conversations table status:', lunarError ? lunarError.message : 'Table exists and accessible!');
}

testConnection();
