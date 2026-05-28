import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { createRequire } from 'module';

// Force process-wide IPv4 resolution to prevent IPv6 network routing errors
dns.setDefaultResultOrder('ipv4first');

const require = createRequire(import.meta.url);

// Terminal Color Helper
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function formatStatus(status, text) {
  if (status === 'OK') return `${colors.green}${colors.bright}[PASS]${colors.reset} ${text}`;
  if (status === 'FAIL') return `${colors.red}${colors.bright}[FAIL]${colors.reset} ${text}`;
  if (status === 'WARN') return `${colors.yellow}${colors.bright}[WARN]${colors.reset} ${text}`;
  return `${colors.gray}[SKIP]${colors.reset} ${text}`;
}

// 1. Parse .env.local file manually
function loadEnv() {
  const envPath = path.join(process.cwd(), 'frontend', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(formatStatus('FAIL', `Environment file not found at: ${envPath}`));
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const firstEquals = line.indexOf('=');
    if (firstEquals === -1) return;
    
    const key = line.substring(0, firstEquals).trim();
    let val = line.substring(firstEquals + 1).trim();
    
    // Remove quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    
    env[key] = val;
  });
  
  return env;
}

const env = loadEnv();

// Helper to check if key is set and not empty or a template placeholder
function isKeyValid(key) {
  const val = env[key];
  if (!val) return false;
  if (val.includes('...') || val.startsWith('re_...')) return false; // Placeholder check
  return true;
}

// Verification routines
const tests = [
  {
    name: 'Gemini AI API',
    key: 'GEMINI_API_KEY',
    run: async () => {
      const key = env.GEMINI_API_KEY;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
      return `Connection successful. Found ${data.models?.length || 0} models available on this key.`;
    }
  },
  {
    name: 'Groq AI API',
    key: 'GROQ_API_KEY',
    run: async () => {
      const key = env.GROQ_API_KEY;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 2
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
      return `Connection successful: ${data.choices[0].message.content.trim()}`;
    }
  },
  {
    name: 'Supabase Database',
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    run: async () => {
      const url = env.NEXT_PUBLIC_SUPABASE_URL;
      const key = env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
      
      const res = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      return `Authorized schema connection verified. Found ${Object.keys(data.paths || {}).length} API paths.`;
    }
  },
  {
    name: 'Composio Integrations Platform',
    key: 'COMPOSIO_API_KEY',
    run: async () => {
      const key = env.COMPOSIO_API_KEY;
      const res = await fetch('https://backend.composio.dev/api/v3.1/auth_configs?toolkit_slug=github', {
        headers: { 'x-api-key': key }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      return `Successfully fetched auth configurations (Status: ${res.status})`;
    }
  },
  {
    name: 'Firecrawl Scraper API',
    key: 'FIRECRAWL_API_KEY',
    run: async () => {
      const key = env.FIRECRAWL_API_KEY;
      const res = await fetch('https://api.firecrawl.dev/v1/map', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: 'https://example.com' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return `Scraper validation successful: Scoped ${data.links?.length || 0} links for validation.`;
    }
  },
  {
    name: 'Brevo Email API',
    key: 'BREVO_API_KEY',
    run: async () => {
      const key = env.BREVO_API_KEY;
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': key }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      return `Account email authenticated: ${data.email}`;
    }
  },
  {
    name: 'Tavily Search API',
    key: 'TAVILY_API_KEY',
    run: async () => {
      const key = env.TAVILY_API_KEY;
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key, query: 'ping', max_results: 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return `Search index connected. Retrieved ${data.results?.length || 0} testing records.`;
    }
  },
  {
    name: 'Hunter.io Domain Search',
    key: 'HUNTER_API_KEY',
    run: async () => {
      const key = env.HUNTER_API_KEY;
      const res = await fetch(`https://api.hunter.io/v2/account?api_key=${key}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.details || `HTTP ${res.status}`);
      return `Hunter user verified: ${data.data?.email || 'N/A'} (Plan: ${data.data?.plan_name || 'Free'})`;
    }
  },
  {
    name: 'NewsAPI Platform',
    key: 'NEWSAPI_KEY',
    run: async () => {
      const key = env.NEWSAPI_KEY;
      const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${key}&pageSize=1`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error(data.message || `HTTP ${res.status}`);
      return `Top headlines search active. Total results reported: ${data.totalResults}`;
    }
  },
  {
    name: 'SerpAPI Search Engine',
    key: 'SERPAPI_KEY',
    run: async () => {
      const key = env.SERPAPI_KEY;
      const res = await fetch(`https://serpapi.com/search.json?q=ping&api_key=${key}&num=1`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return `Google Search engine connection active. Search metadata logged.`;
    }
  },
  {
    name: 'Paystack Secret API',
    key: 'PAYSTACK_SECRET_KEY',
    run: async () => {
      const key = env.PAYSTACK_SECRET_KEY;
      const res = await fetch('https://api.paystack.co/transaction', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      return `Merchant verified. Gateway status: ${data.status ? 'OK' : 'Error'}`;
    }
  },
  {
    name: 'Gmail SMTP Server (Nodemailer)',
    key: 'GMAIL_APP_PASSWORD',
    run: async () => {
      const gmailUser = env.GMAIL_USER;
      const gmailPass = env.GMAIL_APP_PASSWORD;
      if (!gmailUser) throw new Error('GMAIL_USER is missing in environment file');
      
      const nodemailer = require('../frontend/node_modules/nodemailer');
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        family: 4 // Force IPv4
      });
      
      await transporter.verify();
      return `SMTP server authenticated successfully under ${gmailUser}`;
    }
  },
  {
    name: 'Inngest Background Job Event Key',
    key: 'INNGEST_EVENT_KEY',
    run: async () => {
      const key = env.INNGEST_EVENT_KEY;
      const res = await fetch(`https://inn.gs/e/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ name: 'orca/test.noop', data: {} }])
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}: ${data.message || 'Validation failed'}`);
      return `Event pipeline active. Dispatched test event (ID: ${data.ids?.[0] || 'N/A'})`;
    }
  }
];

async function runSuite() {
  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}             ORCA INTEGRATION TEST SUITE            ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  const results = [];
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const test of tests) {
    const keyExists = isKeyValid(test.key);
    
    if (!keyExists) {
      console.log(formatStatus('SKIP', `${test.name} (${colors.gray}${test.key} is not set or placeholder${colors.reset})`));
      results.push({ name: test.name, status: 'SKIP', details: 'Not configured or contains placeholder value.' });
      skippedCount++;
      continue;
    }

    try {
      const startTime = Date.now();
      const message = await test.run();
      const duration = Date.now() - startTime;
      
      console.log(formatStatus('OK', `${test.name} - ${colors.cyan}${message}${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`));
      results.push({ name: test.name, status: 'OK', details: message, duration });
      passedCount++;
    } catch (err) {
      const causeStr = err.cause ? ` (Cause: ${err.cause.message || err.cause})` : '';
      console.log(formatStatus('FAIL', `${test.name} - ${colors.red}${err.message}${causeStr}${colors.reset}`));
      results.push({ name: test.name, status: 'FAIL', details: err.message + causeStr });
      failedCount++;
    }
  }

  // Generate beautiful dashboard summary
  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}                    SUMMARY                         ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  
  console.log(`\n  Total Tests Run: ${tests.length}`);
  console.log(`  ${colors.green}Passed:${colors.reset}          ${passedCount}`);
  console.log(`  ${colors.red}Failed:${colors.reset}          ${failedCount}`);
  console.log(`  ${colors.gray}Skipped:${colors.reset}         ${skippedCount}\n`);

  if (failedCount > 0) {
    console.log(`${colors.red}${colors.bright}❌ Action Required: Some integration credentials failed validation.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bright}🚀 All configured integrations are verified and fully operational!${colors.reset}`);
    process.exit(0);
  }
}

runSuite();
