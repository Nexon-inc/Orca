const fs = require('fs');
const path = require('path');

function searchForRepos(dir, depth = 0) {
  if (depth > 4) return;
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === '.next' || item === '.git') continue;
      const fullPath = path.join(dir, item);
      if (item.toLowerCase() === 'repos' || item.toLowerCase() === 'orca') {
        console.log('Found candidate:', fullPath);
      }
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          searchForRepos(fullPath, depth + 1);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log('Searching for REPOS/Orca...');
searchForRepos('C:\\Users\\John Kyalo\\Desktop');
searchForRepos('C:\\Users\\John Kyalo');
