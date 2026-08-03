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
        if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.sql') || file.endsWith('.json') || file.endsWith('.txt') || file.endsWith('.md')) {
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

const searchPaths = [
  'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca',
  'C:\\Users\\John Kyalo\\Desktop\\REPOS\\Orca'
];

searchPaths.forEach(p => {
  console.log(`Searching path: ${p}...`);
  searchDir(p, 'Published LinkedIn');
});

console.log('Match files:', matchFiles);
