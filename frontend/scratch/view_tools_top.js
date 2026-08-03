const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\agents\\tools.ts', 'utf8');
console.log(content.split('\n').slice(0, 40).join('\n'));
