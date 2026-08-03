const { createClient } = require('@supabase/supabase-js');

async function checkLocal() {
  const localUrl = 'http://127.0.0.1:54321';
  // Try dummy key
  const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6a3Z6dXJmbG5ydXJ2cGx0eW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg1ODAzMiwiZXhwIjoyMDg5NDM0MDMyfQ._GARDUx0iG3Blwk3TMWoYJQv6EDLNshNbWZBm4IPiCQ'; // service role key from .env.local
  
  const supabase = createClient(localUrl, dummyKey);
  try {
    const { data, error } = await supabase
      .from('coordination_events')
      .select('*');
    if (error) {
      console.log('Local Supabase check failed:', error.message);
    } else {
      console.log(`Local Supabase has ${data.length} coordination events!`);
    }
  } catch (e) {
    console.log('Local Supabase not reachable:', e.message);
  }
}

checkLocal();
