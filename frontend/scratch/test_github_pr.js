const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local' });

function decryptToken(ciphertext) {
  const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}

async function testGithubPr() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('service_name', 'github')
    .limit(1);

  if (!integrations || integrations.length === 0) {
    console.log('GitHub integration not found in DB');
    return;
  }

  const integration = integrations[0];
  const connectedAccountId = decryptToken(integration.access_token_encrypted);
  console.log('GitHub Connected Account ID:', connectedAccountId);

  const apiKey = process.env.COMPOSIO_API_KEY;

  // 1. Fetch connected account to get user_id (entity_id)
  const accountRes = await fetch(`https://backend.composio.dev/api/v3.1/connected_accounts/${connectedAccountId}`, {
    headers: { 'x-api-key': apiKey }
  });
  const accountData = await accountRes.json();
  const entityId = accountData.user_id;
  console.log('Retrieved Entity ID:', entityId);

  // 2. Fetch authenticated user details to find owner username dynamically
  let owner = '';
  try {
    const userRes = await fetch(`https://backend.composio.dev/api/v3.1/tools/execute/GITHUB_GET_THE_AUTHENTICATED_USER`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connected_account_id: connectedAccountId,
        entity_id: entityId,
        arguments: {}
      })
    });
    const userData = await userRes.json();
    console.log('User API Response Status:', userRes.status);
    owner = userData.data?.data?.login || userData.data?.login;
    console.log('Dynamic GitHub Owner Username:', owner);
  } catch (err) {
    console.error('Failed to get GitHub owner:', err);
  }

  if (!owner) {
    console.log('Could not resolve owner, aborting');
    return;
  }

  // 3. Execute GITHUB_CREATE_A_PULL_REQUEST
  const actionName = 'GITHUB_CREATE_A_PULL_REQUEST';
  const url = `https://backend.composio.dev/api/v3.1/tools/execute/${actionName}`;
  const requestBody = {
    connected_account_id: connectedAccountId,
    entity_id: entityId,
    arguments: {
      owner: owner,
      repo: 'orca-demo',
      title: 'Feature: Supabase RLS integration',
      body: 'Integrates Supabase row-level security policy checks for team and workspace resource accesses.',
      head: 'feature/rls-auth',
      base: 'main'
    }
  };

  console.log('Sending request to:', url);
  console.log('Arguments:', JSON.stringify(requestBody.arguments, null, 2));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  console.log('Response Status:', res.status);
  const data = await res.json();
  console.log('Response Body:', JSON.stringify(data, null, 2));
}

testGithubPr();
