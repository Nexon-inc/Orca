const fs = require('fs');

const chatIdPage = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\[id]\\page.tsx';

if (fs.existsSync(chatIdPage)) {
  console.log(fs.readFileSync(chatIdPage, 'utf8').slice(0, 3000));
} else {
  console.log('Chat [id] page not found');
}
