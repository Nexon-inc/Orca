const fs = require('fs');
const path = require('path');

function getFolderStructure(dir, depth = 0) {
  if (depth > 3) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        console.log('  '.repeat(depth) + '[DIR] ' + file);
        getFolderStructure(fullPath, depth + 1);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        console.log('  '.repeat(depth) + '[FILE] ' + file);
      }
    }
  }
}

console.log('Listing app directory structure:');
getFolderStructure('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app');
