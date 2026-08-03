const fs = require('fs');
const path = require('path');

const migrationsDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\supabase\\migrations';
if (fs.existsSync(migrationsDir)) {
  const files = fs.readdirSync(migrationsDir);
  for (const file of files) {
    if (file.endsWith('.sql')) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      if (content.includes('Published LinkedIn') || content.includes('outreach to 15') || content.includes('competitor sweep')) {
        console.log(`Found MATCH in migration file: ${file}`);
      }
    }
  }
}
