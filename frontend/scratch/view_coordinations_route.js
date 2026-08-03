const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\api\\org\\[id]\\coordinations\\route.ts';

if (fs.existsSync(file)) {
  console.log(fs.readFileSync(file, 'utf8'));
} else {
  console.log('File not found:', file);
}
