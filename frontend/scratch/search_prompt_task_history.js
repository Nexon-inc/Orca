const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\ai\\prompt.ts';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach((line, idx) => {
    if (line.toLowerCase().includes('history') || line.toLowerCase().includes('logs') || line.toLowerCase().includes('task')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
}
