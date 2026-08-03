const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== '.gemini') {
        searchDir(fullPath);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.sql') || file.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('LinkedIn') || content.includes('competitor') || content.includes('outreach')) {
          if (content.includes('Aria') || content.includes('Rex') || content.includes('Roman') || content.includes('Atlas')) {
            console.log(`Potential mock source in file: ${fullPath}`);
          }
        }
      }
    }
  }
}

const baseDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca';
console.log('Searching for patterns...');
searchDir(baseDir);
