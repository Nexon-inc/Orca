const fs = require('fs');

const middleware = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\middleware.ts';

if (fs.existsSync(middleware)) {
  console.log(fs.readFileSync(middleware, 'utf8'));
} else {
  console.log('Middleware not found');
}
