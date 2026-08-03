const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchDir(fullPath, query);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log('Match found in:', fullPath);
      }
    }
  }
}

console.log('Searching for "paystack"...');
searchDir('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend', 'paystack');

console.log('\nSearching for "nvidia"...');
searchDir('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend', 'nvidia');
