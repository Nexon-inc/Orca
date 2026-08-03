const fs = require('fs');

const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\chat\\[id]\\page.tsx';

if (fs.existsSync(file)) {
  console.log(fs.readFileSync(file, 'utf8').split('\n').slice(250, 450).join('\n'));
} else {
  console.log('Chat [id] page not found');
}
