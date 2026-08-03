const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function search() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  
  // Google Calendar
  let res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=googlecalendar&limit=100`, {
    headers: { 'x-api-key': apiKey }
  });
  let data = await res.json();
  console.log('\n--- googlecalendar events ---');
  if (data.items) {
    data.items.forEach(item => {
      if (item.slug.toLowerCase().includes('event')) {
        console.log(`- Slug: ${item.slug} (${item.name})`);
      }
    });
  }

  // Meta
  res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=meta&limit=100`, {
    headers: { 'x-api-key': apiKey }
  });
  data = await res.json();
  console.log('\n--- meta ---');
  if (data.items) {
    data.items.forEach(item => {
      console.log(`- Slug: ${item.slug} (${item.name})`);
    });
  }
}

search();
