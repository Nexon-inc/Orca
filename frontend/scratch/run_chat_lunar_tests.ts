import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { loadBCP, applyBCPUpdates, calculateOnboardingScore, renderBCPasMarkdown } from '../lib/lunar/bcpManager';
import { buildLunarSystemPrompt } from '../lib/lunar/prompt';
import { parseAndExecuteActions } from '../lib/agents/parseActions';
import { buildAgentSystemPrompt } from '../lib/ai/prompt';

async function testAll() {
  console.log('=== TEST 1: Lunar BCP Operations & Prompt ===');
  const dummyBcp: any = {
    org_id: 'test-org-123',
    version: 1,
    company_snapshot: { name: 'Nexonic AI', industry: 'B2B SaaS' },
    business_goals: { q1_target: '$50k ARR' },
    products: [{ name: 'ORCA OS', price: 99 }],
    connected_systems: { github: true, hubspot: true },
    active_agents: ['Atlas', 'Aria', 'Rex'],
    customer_insights: { icp: 'AI Founders' },
    team_context: {},
    historical_memory: {},
    orca_context: {},
    lunar_operating_rules: { tone: 'decisive' },
    bcp_events: [],
    conflicts: [],
    onboarding_score: 0,
    last_updated_by: 'lunar'
  };

  const score = calculateOnboardingScore(dummyBcp);
  console.log('Calculated Onboarding Score:', score, '(Expected > 50)');

  const markdown = renderBCPasMarkdown(dummyBcp);
  console.log('Rendered Markdown length:', markdown.length);
  if (!markdown.includes('Nexonic AI')) throw new Error('Markdown missing company name');

  const lunarPrompt = buildLunarSystemPrompt(dummyBcp, 'Nexonic AI');
  console.log('Lunar System Prompt length:', lunarPrompt.length);
  if (!lunarPrompt.includes('Nexonic AI')) throw new Error('Lunar system prompt missing org name');

  console.log('\n=== TEST 2: Executive Prompt BCP Context Injection ===');
  const mockAgent: any = { name: 'Aria', id: 'aria-1', acronym: 'CMO' };
  const mockCompany: any = { company_name: 'Nexonic AI', industry: 'SaaS', mission: 'Automate C-Suite' };
  const mockMember: any = { role: 'owner' };

  const execPrompt = buildAgentSystemPrompt(
    mockAgent,
    mockCompany,
    mockMember,
    'Previous brief memory',
    ['twitter', 'hubspot'],
    'automate',
    null,
    null,
    markdown
  );

  if (!execPrompt.includes('LUNAR BUSINESS CONTEXT PROTOCOL (BCP)')) {
    throw new Error('Executive prompt missing BCP context block!');
  }
  console.log('Executive prompt successfully injected BCP context!');

  console.log('\n=== TEST 3: Action Tag JSON Parsing (Tolerant Parser) ===');
  const rawTextWithErrors = `
I am initiating the launch sprint now.
[ACTION: tool="twitter_post" params={"text": "ORCA is live!\nLine 2 text with 'quotes' and unescaped \n characters"}]
[ACTION: tool="github_create_pr" params={'repo': 'orca-demo', 'title': 'Feature PR', 'body': 'Multi-line body\nSecond line'}]
  `;

  const { cleanResponse, actionsExecuted } = await parseAndExecuteActions(
    rawTextWithErrors,
    'test-org',
    'agent-1',
    'user-1'
  );

  console.log('Clean response output:');
  console.log(cleanResponse);

  if (cleanResponse.includes('Bad escaped character')) {
    throw new Error('JSON parsing failed on action tags!');
  }
  console.log('Action tag parsing test passed successfully!');

  console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!');
}

testAll().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
