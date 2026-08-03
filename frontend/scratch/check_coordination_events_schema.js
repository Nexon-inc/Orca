const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\supabase\\migrations';
if (fs.existsSync(dir)) {
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.sql')) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      if (content.includes('coordination_events')) {
        console.log(`--- File: ${file} ---`);
        // Find lines around coordination_events
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('coordination_events') || line.includes('create table') || line.includes('foreign key')) {
            for (let i = Math.max(0, idx - 2); i < Math.min(lines.length, idx + 10); i++) {
              console.log(`${i+1}: ${lines[i].trim()}`);
            }
            console.log('...');
          }
        });
      }
    }
  });
}
