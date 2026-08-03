const fs = require('fs');
const path = require('path');

const dirA = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca';
const dirB = 'C:\\Users\\John Kyalo\\Desktop\\REPOS\\Orca';

const diffs = [];
const missingInB = [];

function checkDir(relative) {
  const pathA = path.join(dirA, relative);
  const pathB = path.join(dirB, relative);

  if (!fs.existsSync(pathA)) return;

  const statA = fs.statSync(pathA);
  if (statA.isDirectory()) {
    const files = fs.readdirSync(pathA);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === '.next' || file === '.gemini' || file === 'scratch' || file === 'temp') {
        continue;
      }
      checkDir(path.join(relative, file));
    }
  } else {
    if (!fs.existsSync(pathB)) {
      missingInB.push(relative);
      return;
    }

    const contentA = fs.readFileSync(pathA, 'utf8');
    const contentB = fs.readFileSync(pathB, 'utf8');
    if (contentA !== contentB) {
      diffs.push(relative);
    }
  }
}

console.log('Comparing workspaces...');
checkDir('');
console.log('Missing in REPOS:', missingInB);
console.log('Differences found:', diffs);
