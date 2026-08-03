const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function listCreateActions() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const toolkits = ['github', 'hubspot'];

  for (const tk of toolkits) {
    try {
      const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=${tk}`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      if (data.items) {
        console.log(`--- Toolkit: ${tk} ---`);
        data.items.forEach(item => {
          if (item.name.toLowerCase().includes('create') || item.slug?.toLowerCase().includes('create')) {
            console.log(`- Name: ${item.name}, Slug: ${item.slug || item.name}`);
          }
        });
      }
    } catch (e) {
      console.log(`Error querying ${tk}: ${e.message}`);
    }
  }
}

listCreateActions();
