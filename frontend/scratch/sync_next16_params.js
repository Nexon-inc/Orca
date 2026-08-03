const fs = require('fs');
const path = require('path');

const files = [
  'frontend/app/api/org/[id]/coordinations/route.ts',
  'frontend/app/api/org%5Bid%5D/coordinations/route.ts',
  'frontend/app/api/agents/[id]/latest-conversation/route.ts',
  'frontend/app/api/briefs/[id]/route.ts',
  'frontend/app/api/briefs/[id]/send/route.ts',
  'frontend/app/api/orcahub/[slug]/install/route.ts',
  'frontend/app/api/orcahub/[slug]/route.ts',
  'frontend/app/api/org/members/[id]/route.ts'
];

const srcDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca';
const destDir = 'C:\\Users\\John Kyalo\\Desktop\\REPOS\\Orca';

files.forEach(f => {
  const srcPath = path.join(srcDir, f);
  const destPath = path.join(destDir, f);
  
  if (fs.existsSync(srcPath)) {
    // Ensure destination directory exists
    const destFolder = path.dirname(destPath);
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
    console.log(`Synced: ${f}`);
  } else {
    console.log(`Warning: File not found in src: ${f}`);
  }
});
