const fs = require('fs');
const path = require('path');

function findLayouts(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findLayouts(fullPath);
      }
    } else if (file === 'layout.tsx') {
      console.log('Found layout:', fullPath);
    }
  }
}

findLayouts('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app');
