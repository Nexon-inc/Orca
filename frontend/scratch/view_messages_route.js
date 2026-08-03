const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\api\\conversations\\id\\messages\\route.ts'.replace('id', '[id]');

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(content.slice(0, 3000)); // first 3000 chars
  if (content.length > 3000) {
    console.log('\n--- TRUNCATED (Length:', content.length, ') ---');
  }
} else {
  console.log('File not found:', file);
}
