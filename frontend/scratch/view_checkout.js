const fs = require('fs');

const checkoutRoute = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\api\\billing\\checkout\\route.ts';

if (fs.existsSync(checkoutRoute)) {
  console.log(fs.readFileSync(checkoutRoute, 'utf8'));
} else {
  console.log('Checkout route not found');
}
