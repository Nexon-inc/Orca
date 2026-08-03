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

async function listAll() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: integrations } = await supabase.from('integrations').select('*');
  const apiKey = process.env.COMPOSIO_API_KEY;

  for (const row of integrations) {
    try {
      const connectedAccountId = decryptToken(row.access_token_encrypted);
      const accountRes = await fetch(`https://backend.composio.dev/api/v3.1/connected_accounts/${connectedAccountId}`, {
        headers: { 'x-api-key': apiKey }
      });
      const accountData = await accountRes.json();
      console.log(`Service: ${row.service_name} -> Connected Account ID: ${connectedAccountId} -> Toolkit Slug: ${accountData.toolkit?.slug}`);
    } catch (e) {
      console.log(`Error querying ${row.service_name}: ${e.message}`);
    }
  }
}

listAll();
