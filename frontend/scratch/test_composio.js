const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function run() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  console.log('API KEY:', apiKey);
  try {
    const res = await fetch('https://backend.composio.dev/api/v3.1/auth_configs', {
      headers: { 'x-api-key': apiKey }
    });
    const data = await res.json();
    console.log('Configs:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
