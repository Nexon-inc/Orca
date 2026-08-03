const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function getAllGithubActions() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  let cursor = '';
  let allItems = [];
  
  do {
    const url = `https://backend.composio.dev/api/v3.1/tools?toolkit_slug=github` + (cursor ? `&cursor=${cursor}` : '');
    const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
    const data = await res.json();
    if (data.items) {
      allItems.push(...data.items);
    }
    cursor = data.next_cursor;
  } while (cursor);

  console.log('Total actions loaded:', allItems.length);
  allItems.forEach(item => {
    const slug = item.slug || item.name;
    if (slug.toLowerCase().includes('get') && slug.toLowerCase().includes('user')) {
      console.log(`- Slug: ${slug} (${item.name})`);
    }
  });
}

getAllGithubActions();
