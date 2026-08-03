const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\agents';
if (fs.existsSync(dir)) {
  fs.readdirSync(dir).forEach(file => {
    console.log(file);
  });
}
