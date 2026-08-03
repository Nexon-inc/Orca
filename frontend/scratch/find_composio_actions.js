const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function listComposioActions() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const toolkits = ['twitter', 'github', 'hubspot', 'linkedin', 'slack', 'notion', 'google_drive', 'googledocs', 'googlesheets', 'google_calendar'];

  for (const tk of toolkits) {
    try {
      const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=${tk}`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      if (data.items) {
        console.log(`--- Toolkit: ${tk} ---`);
        data.items.slice(0, 15).forEach(item => {
          console.log(`- Name: ${item.name}, Slug: ${item.slug || item.name} (${item.description || ''})`);
        });
      } else {
        console.log(`No items found for toolkit: ${tk}, status: ${res.status}`);
        console.log(JSON.stringify(data));
      }
    } catch (e) {
      console.log(`Error querying ${tk}: ${e.message}`);
    }
  }
}

listComposioActions();
