const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function testPostMessage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch a conversation
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('*')
    .limit(1);

  if (error || !convs || convs.length === 0) {
    console.error('No conversation found in DB:', error);
    return;
  }

  const conversationId = convs[0].id;
  const orgId = convs[0].org_id;
  console.log('Testing with Conversation ID:', conversationId);

  // Mock authentication token or call route handler directly by creating the request
  // Let's call the Next.js server if it is running (default port 3000)
  const url = `http://localhost:3000/api/conversations/${conversationId}/messages`;
  
  // Since we need auth, we will mock the POST handler logic directly using the route code to see if it throws!
  // To do this, let's write a script that runs the POST handler logic in a node context.
  // Wait, let's try to fetch it first from the running server if it's up.
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Next.js dev server might need session cookie, let's see
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Launch a new launch sprint.' }],
        mode: 'planning'
      })
    });
    console.log('Server HTTP Status:', res.status);
    const body = await res.text();
    console.log('Server Response:', body.slice(0, 1000));
  } catch (err) {
    console.log('Local server connection failed (is it running?):', err.message);
  }
}

testPostMessage();
