const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\agents\\skills.ts', 'utf8');

// Print sections of Google, HubSpot, Slack skills
const lines = content.split('\n');
let printed = 0;
lines.forEach((line, idx) => {
  if (line.includes('googleEcosystemSkill') || line.includes('hubspotCreateDealSkill') || line.includes('slack') || line.includes('notion')) {
    if (printed < 10) {
      console.log(`Line ${idx+1}: ${line}`);
      printed++;
    }
  }
});
