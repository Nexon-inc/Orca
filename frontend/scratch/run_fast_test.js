function calculateOnboardingScore(bcp) {
  let score = 10;
  if (bcp.company_snapshot && Object.keys(bcp.company_snapshot).length > 0) score += 20;
  if (bcp.business_goals && Object.keys(bcp.business_goals).length > 0) score += 20;
  if (bcp.products && bcp.products.length > 0) score += 15;
  if (bcp.customer_insights && Object.keys(bcp.customer_insights).length > 0) score += 15;
  if (bcp.connected_systems && Object.keys(bcp.connected_systems).length > 0) score += 10;
  if (bcp.lunar_operating_rules && Object.keys(bcp.lunar_operating_rules).length > 0) score += 10;
  return Math.min(100, score);
}

function parseJsonTolerant(paramsStr) {
  try {
    return JSON.parse(paramsStr);
  } catch {
    const sanitized = paramsStr.replace(/\r?\n/g, '\\n');
    try {
      return JSON.parse(sanitized);
    } catch {
      return Function(`"use strict"; return (${sanitized})`)();
    }
  }
}

console.log('=== TEST 1: BCP Completeness Calculation ===');
const sampleBcp = {
  company_snapshot: { name: 'ORCA' },
  business_goals: { target: '1000 users' },
  products: ['SaaS OS'],
  customer_insights: { icp: 'Founders' },
  connected_systems: { github: true },
  lunar_operating_rules: { tone: 'fast' }
};

const score = calculateOnboardingScore(sampleBcp);
console.log('BCP Score:', score, '(Expected 100)');
if (score !== 100) throw new Error('Score calculation mismatch!');

console.log('\n=== TEST 2: Tolerant Action Tag JSON Parser ===');
const testCases = [
  `{"text": "Line 1\\nLine 2 with 'quotes'"}`,
  `{'repo': 'orca-demo', 'title': 'Feature PR', 'body': 'Line 1\nLine 2'}`,
  `{"dealname": "Founding Deal", "amount": 228, "contact_email": "john@kyalo.com"}`
];

testCases.forEach((tc, idx) => {
  const parsed = parseJsonTolerant(tc);
  console.log(`Test Case ${idx + 1} parsed successfully:`, parsed);
});

console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
