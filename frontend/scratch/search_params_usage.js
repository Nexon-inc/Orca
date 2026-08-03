const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('params:') || content.includes('params }') || content.includes('params }')) {
        // Check if there is "params.id" or "params.slug" or destructuring without "await params"
        const hasParamsProperty = /params\.[a-zA-Z_]+/g.test(content);
        const hasDestructuring = /const\s+\{[a-zA-Z0-9_,\s]+\}\s*=\s*params/g.test(content);
        const hasAwait = /await\s+params/g.test(content);
        
        if ((hasParamsProperty || hasDestructuring) && !hasAwait) {
          console.log(`Potential Sync Params Usage: ${fullPath}`);
          // Print match lines
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('params') && (line.includes('GET') || line.includes('POST') || line.includes('Page') || line.includes('params.'))) {
              console.log(`  Line ${idx+1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

searchDir('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\app');
