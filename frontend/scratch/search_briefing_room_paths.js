const fs = require('fs');
const path = require('path');

function listFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      listFiles(fullPath);
    } else {
      console.log(fullPath);
    }
  }
}

const baseDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app\\dashboard\\briefing-room';
console.log('Files in briefing-room:');
listFiles(baseDir);
