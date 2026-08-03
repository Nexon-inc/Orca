const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\components\\HeroSection.tsx';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(content.split('\n').slice(250, 350).join('\n'));
} else {
  console.log('File not found:', file);
}
