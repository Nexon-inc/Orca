const fs = require('fs');

const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\[id]\\page.tsx';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(content.split('\n').slice(550, 650).join('\n'));
} else {
  console.log('Chat [id] page not found');
}
