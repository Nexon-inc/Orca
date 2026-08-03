const fs = require('fs');

const chatPage = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\page.tsx';

if (fs.existsSync(chatPage)) {
  console.log(fs.readFileSync(chatPage, 'utf8'));
} else {
  console.log('Chat page not found');
}
