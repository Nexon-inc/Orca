const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function listAllActions() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const toolkits = ['github', 'hubspot'];

  for (const tk of toolkits) {
    try {
      const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=${tk}&limit=200`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      if (data.items) {
        console.log(`\n--- Toolkit: ${tk} (found ${data.items.length} items) ---`);
        data.items.forEach(item => {
          const slug = item.slug || item.name;
          if (slug.toLowerCase().includes('create') || slug.toLowerCase().includes('post') || slug.toLowerCase().includes('pull')) {
            console.log(`- Slug: ${slug} (${item.name})`);
          }
        });
      }
    } catch (e) {
      console.log(`Error querying ${tk}: ${e.message}`);
    }
  }
}

listAllActions();
