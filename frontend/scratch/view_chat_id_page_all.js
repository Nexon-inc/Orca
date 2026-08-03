const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\[id]\\page.tsx';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  console.log('File length:', content.length);
  // print chunks
  console.log('=== CHUNK 1 ===');
  console.log(content.slice(0, 4000));
  if (content.length > 4000) {
    console.log('=== CHUNK 2 ===');
    console.log(content.slice(4000, 8000));
  }
  if (content.length > 8000) {
    console.log('=== CHUNK 3 ===');
    console.log(content.slice(8000, 12000));
  }
} else {
  console.log('File not found:', file);
}
