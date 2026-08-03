const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend';
const targetDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\REPOS\\Orca\\frontend';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      if (childItemName === 'node_modules' || childItemName === '.next' || childItemName === '.git') {
        return;
      }
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\REPOS\\Orca')) {
  console.log('Syncing frontend files to REPOS/Orca...');
  copyRecursiveSync(srcDir, targetDir);
  console.log('Successfully synced files to REPOS!');
} else {
  console.log('REPOS directory does not exist, skipping sync.');
}
