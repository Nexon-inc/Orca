const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && !dir.includes('.next')) {
        search(full);
      }
    } else if (file === 'route.ts' || file === 'route.js') {
      if (full.includes('chat') || full.includes('messages')) {
        console.log('Found:', full);
      }
    }
  }
}

search('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca');
