const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\agents\\skills.ts';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('twitterPostSkill') || line.includes('linkedinPostSkill') || line.includes('githubCreatePRSkill') || line.includes('hubspotCreateDealSkill')) {
      // Print around the declaration
      for (let i = Math.max(0, idx - 5); i < Math.min(lines.length, idx + 15); i++) {
        console.log(`${i + 1}: ${lines[i]}`);
      }
      console.log('---');
    }
  });
}
