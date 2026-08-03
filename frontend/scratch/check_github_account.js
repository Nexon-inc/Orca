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

async function getGithubAccount() {
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
  const res = await fetch(`https://backend.composio.dev/api/v3.1/connected_accounts/${connectedAccountId}`, {
    headers: { 'x-api-key': apiKey }
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

getGithubAccount();
