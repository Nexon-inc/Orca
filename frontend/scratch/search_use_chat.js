const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && !dir.includes('.next')) {
        search(full);
      }
    } else {
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes('useChat')) {
          console.log('Found useChat reference in:', full);
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('useChat') || line.includes('onToolCall')) {
              console.log(`  Line ${idx+1}: ${line.trim()}`);
            }
          });
        }
      } catch (e) {}
    }
  }
}

search('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend');
