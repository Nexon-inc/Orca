const fs = require('fs');
const path = require('path');

function searchDir(dir, queries) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== '.gemini') {
        searchDir(fullPath, queries);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.sql') || file.endsWith('.json') || file.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
        for (const q of queries) {
          if (content.includes(q.toLowerCase())) {
            console.log(`Found "${q}" in: ${fullPath}`);
          }
        }
      }
    }
  }
}

const baseDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca';
const queries = [
  'Published LinkedIn',
  'Sent outreach',
  'competitor sweep',
  'dispatched to founder',
  '09:14'
];
console.log('Searching for mock data...');
searchDir(baseDir, queries);
