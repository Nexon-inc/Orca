const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\page.tsx';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(content.slice(0, 1500)); // first 1500 chars
  if (content.length > 1500) {
    console.log('\n--- TRUNCATED (Length:', content.length, ') ---');
  }
} else {
  console.log('File not found:', file);
}
