const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function checkParams() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const tools = ['GITHUB_CREATE_A_PULL_REQUEST', 'HUBSPOT_CREATE_DEAL'];

  for (const tool of tools) {
    try {
      const res = await fetch(`https://backend.composio.dev/api/v3.1/tools?toolkit_slug=${tool.split('_')[0].toLowerCase()}&limit=200`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      const item = data.items?.find(i => i.slug === tool);
      if (item) {
        console.log(`\n=== Parameters for ${tool} ===`);
        console.log(JSON.stringify(item.input_parameters, null, 2));
      }
    } catch (e) {
      console.log(`Error querying ${tool}: ${e.message}`);
    }
  }
}

checkParams();
