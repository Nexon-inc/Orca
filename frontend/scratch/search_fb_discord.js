const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function search() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const toolkits = ['facebook', 'discord'];

  for (const tk of toolkits) {
    try {
      const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=${tk}&limit=100`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      console.log(`\n--- Toolkit: ${tk} ---`);
      if (data.items) {
        data.items.forEach(item => {
          console.log(`- Slug: ${item.slug} (${item.name})`);
        });
      }
    } catch (e) {
      console.log(`Error querying ${tk}: ${e.message}`);
    }
  }
}

search();
