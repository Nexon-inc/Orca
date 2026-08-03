const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function probe() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  
  const urls = [
    'https://backend.composio.dev/api/v3/actions/execute',
    'https://api.composio.dev/v1/actions/execute',
    'https://backend.composio.dev/api/v1/connected-accounts',
    'https://api.composio.dev/v1/connected-accounts',
    'https://api.composio.dev/v1/connected_accounts',
    'https://backend.composio.dev/v3/connected-accounts'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-api-key': apiKey }
      });
      console.log(`URL: ${url} -> Status: ${res.status}`);
      const text = await res.text();
      console.log(`  Body: ${text.slice(0, 150)}`);
    } catch (e) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}

probe();
