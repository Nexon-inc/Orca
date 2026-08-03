const fs = require('fs');

const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\[id]\\page.tsx';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('initialMessage') || line.includes('initialMessageSent')) {
      console.log(`L${idx + 1}: ${line.trim()}`);
    }
  });
} else {
  console.log('Chat [id] page not found');
}
