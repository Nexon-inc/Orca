const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\[id]\\page.tsx';

const content = fs.readFileSync(file, 'utf8');
content.split('\n').forEach((line, idx) => {
  if (line.includes('TASK HISTORY') || line.includes('LinkedIn') || line.includes('Gmail') || line.includes('dispatched to founder')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
