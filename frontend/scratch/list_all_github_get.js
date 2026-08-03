const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function listGetActions() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=github&limit=200`, {
    headers: { 'x-api-key': apiKey }
  });
  const data = await res.json();
  if (data.items) {
    data.items.forEach(item => {
      if (item.slug.toLowerCase().includes('get')) {
        console.log(`- Slug: ${item.slug} (${item.name})`);
      }
    });
  }
}

listGetActions();
