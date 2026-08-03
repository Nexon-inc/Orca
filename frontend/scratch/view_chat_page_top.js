const fs = require('fs');

const chatPage = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\page.tsx';

if (fs.existsSync(chatPage)) {
  const content = fs.readFileSync(chatPage, 'utf8');
  console.log(content.split('\n').slice(0, 100).join('\n'));
} else {
  console.log('Chat page not found');
}
