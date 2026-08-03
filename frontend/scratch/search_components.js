const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, query);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(query)) {
          console.log(`Found "${query}" in: ${fullPath}`);
        }
      }
    }
  }
}

const baseDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\components';
console.log('Searching for "09:14"...');
searchDir(baseDir, '09:14');
console.log('Searching for "Published"...');
searchDir(baseDir, 'Published');
console.log('Searching for "outreach"...');
searchDir(baseDir, 'outreach');
