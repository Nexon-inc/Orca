const fetch = require('node-fetch');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

async function getAccount() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const id = 'ca_YwzS-PkW6CoV'; // Twitter or GitHub ID
  
  const res = await fetch(`https://backend.composio.dev/api/v3.1/connected_accounts/${id}`, {
    headers: { 'x-api-key': apiKey }
  });
  
  console.log('Status:', res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

getAccount();
