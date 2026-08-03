const fs = require('fs');
const path = require('path');

const migrationsDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\supabase\\migrations';
if (fs.existsSync(migrationsDir)) {
  const files = fs.readdirSync(migrationsDir);
  console.log('Tables created in migrations:');
  for (const file of files) {
    if (file.endsWith('.sql')) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const matches = content.match(/create table\s+(?:if not exists\s+)?([\w.]+)/gi);
      if (matches) {
        matches.forEach(m => console.log(`- ${file}: ${m.trim()}`));
      }
    }
  }
}
