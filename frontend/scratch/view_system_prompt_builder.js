const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\api\\conversations\\id\\messages\\route.ts'.replace('id', '[id]');

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('buildAgentSystemPrompt')) {
      console.log(`L${idx - 4} - L${idx + 15}:`);
      console.log(lines.slice(idx - 4, idx + 15).join('\n'));
    }
  });
} else {
  console.log('File not found:', file);
}
