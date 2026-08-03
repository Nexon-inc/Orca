const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\agents\\skills.ts', 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('slack') || line.includes('Slack')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});
