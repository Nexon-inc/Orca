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

async function testWithEntity() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('service_name', 'twitter')
    .limit(1);

  if (!integrations || integrations.length === 0) {
    console.log('Twitter integration not found in DB');
    return;
  }

  const integration = integrations[0];
  const connectedAccountId = decryptToken(integration.access_token_encrypted);
  console.log('Connected Account ID:', connectedAccountId);

  // 1. Fetch connected account to get user_id (entity_id)
  const apiKey = process.env.COMPOSIO_API_KEY;
  const accountRes = await fetch(`https://backend.composio.dev/api/v3.1/connected_accounts/${connectedAccountId}`, {
    headers: { 'x-api-key': apiKey }
  });
  
  const accountData = await accountRes.json();
  const entityId = accountData.user_id;
  console.log('Retrieved Entity ID (user_id):', entityId);

  if (!entityId) {
    console.log('Could not get user_id from account details');
    return;
  }

  // 2. Execute action
  const actionName = 'TWITTER_CREATION_OF_A_POST';
  const url = `https://backend.composio.dev/api/v3.1/tools/execute/${actionName}`;
  const requestBody = {
    connected_account_id: connectedAccountId,
    entity_id: entityId,
    arguments: {
      text: 'Testing ORCA executive launch workflow with Composio v3.1! 🚀🤖'
    }
  };

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

testWithEntity();
