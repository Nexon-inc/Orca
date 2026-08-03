const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\agents\\skills.ts';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('github') || line.includes('hubspot') || line.includes('twitter')) {
      console.log(`${idx+1}: ${line.trim()}`);
    }
  });
}
