const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function testComposio() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  console.log('Using Composio API Key:', apiKey);

  // Let's test a simple request to list connected accounts to verify the key and see the connection IDs
  const res = await fetch('https://backend.composio.dev/api/v1/connected-accounts', {
    headers: {
      'x-api-key': apiKey,
    }
  });

  const data = await res.json();
  console.log('Connected Accounts Status:', res.status);
  console.log(JSON.stringify(data, null, 2));
}

testComposio();
