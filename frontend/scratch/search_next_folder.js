const fs = require('fs');
const path = require('path');

const matchFiles = [];

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
      if (file !== 'node_modules' && file !== '.git' && file !== '.gemini') {
        searchDir(fullPath, query);
      }
    } else {
      try {
        if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.txt')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(query)) {
            matchFiles.push(fullPath);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

const baseDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.next';
console.log('Searching .next folder...');
searchDir(baseDir, 'Published LinkedIn');
console.log('Match files:', matchFiles);
