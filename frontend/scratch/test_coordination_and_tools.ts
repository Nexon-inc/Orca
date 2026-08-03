import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { parseAndExecuteActions } from '../lib/agents/parseActions';

async function testCoordinationAndTools() {
  console.log('=== TEST: Task Coordination & Tool Action Pipeline ===\n');

  // Sample prompt containing both [ACTION:] and [HANDOFF:]
  const mockExecutiveOutput = `
I am initiating the launch sprint now for our ORCA platform.

1. CMO Announcement:
I will post a tweet announcing our launch.
[ACTION: tool="twitter_post" params={"text": "ORCA is live! Deployed 6 executive agents on autopilot. 🚀"}]

2. CTO GitHub Pull Request:
Creating PR for Supabase RLS policies.
[ACTION: tool="github_create_pr" params={"repo": "orca-demo", "title": "Feature: Supabase RLS integration", "branch": "feature/rls-auth", "body": "Integrates RLS policies."}]

3. Sales Deal Registration:
Creating deal in HubSpot for John Kyalo.
[ACTION: tool="hubspot_create_deal" params={"dealname": "Founding Member deal - John Kyalo", "amount": 228, "contact_email": "john@kyalo.com"}]

4. Coordinating with Atlas (CEO):
[HANDOFF: to="CEO" reason="Sprint actions initiated, passing summary for wiki update" context="Twitter tweet queued, GitHub PR opened, HubSpot deal created."]
`;

  console.log('--- Input Executive Stream Output ---');
  console.log(mockExecutiveOutput);

  console.log('\n--- Processing via parseAndExecuteActions ---');
  const result = await parseAndExecuteActions(
    mockExecutiveOutput,
    'd0d20120-17e8-4120-be5f-0070d83bb5c7', // test org ID
    'agent-aria-id',
    'user-john-id'
  );

  console.log('\n--- Transformed Clean Response (for UI rendering) ---');
  console.log(result.cleanResponse);

  console.log('\n--- Actions Attempted/Executed ---');
  console.log(result.actionsExecuted);

  // Assertions
  if (!result.cleanResponse.includes('Coordinating with CEO')) {
    throw new Error('Handoff tag was not parsed properly!');
  }

  console.log('\n✅ Task coordination and tool execution pipeline test passed!');
}

testCoordinationAndTools().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
