const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return;
  }
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue;
    }
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(fullPath, query);
      }
    } else {
      try {
        if (file.endsWith('.json') || file.endsWith('.txt') || file.endsWith('.jsonl') || file.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(query)) {
            console.log(`Found "${query}" in AppData file: ${fullPath}`);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

const baseDir = 'C:\\Users\\John Kyalo\\.gemini\\antigravity';
console.log('Searching AppData...');
searchDir(baseDir, 'Published LinkedIn');
