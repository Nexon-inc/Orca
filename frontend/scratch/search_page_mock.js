const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\page.tsx';

const content = fs.readFileSync(file, 'utf8');
content.split('\n').forEach((line, idx) => {
  if (line.includes('LinkedIn') || line.includes('outreach') || line.includes('competitor') || line.includes('TASK HISTORY')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
