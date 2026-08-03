const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function debugItems() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=github`, {
    headers: { 'x-api-key': apiKey }
  });
  const data = await res.json();
  if (data.items && data.items.length > 0) {
    console.log('Total items:', data.items.length);
    console.log('Sample item:', JSON.stringify(data.items[0], null, 2));
  } else {
    console.log('No items returned for github', data);
  }
}

debugItems();
