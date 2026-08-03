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
      if (file !== 'node_modules' && file !== '.git' && !dir.includes('.next') && file !== '.gemini') {
        searchDir(fullPath, query);
      }
    } else {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(query)) {
          matchFiles.push(fullPath);
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

const baseDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca';
console.log('Searching all files...');
searchDir(baseDir, 'Published LinkedIn');
console.log('Match files:', matchFiles);
