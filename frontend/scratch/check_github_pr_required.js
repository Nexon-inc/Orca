const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function checkGithubPr() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=github&limit=200`, {
    headers: { 'x-api-key': apiKey }
  });
  const data = await res.json();
  const item = data.items?.find(i => i.slug === 'GITHUB_CREATE_A_PULL_REQUEST');
  if (item) {
    console.log('Required fields:', item.input_parameters.required);
    console.log('Properties:', Object.keys(item.input_parameters.properties));
    // Let's print descriptions for some common properties
    const props = item.input_parameters.properties;
    ['owner', 'repo', 'title', 'body', 'head', 'base'].forEach(p => {
      if (props[p]) {
        console.log(`- ${p}: ${props[p].description}`);
      }
    });
  }
}

checkGithubPr();
