const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function getKeys() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=github`, {
    headers: { 'x-api-key': apiKey }
  });
  const data = await res.json();
  console.log('Keys of response:', Object.keys(data));
  if (data.meta) {
    console.log('meta:', data.meta);
  }
}

getKeys();
