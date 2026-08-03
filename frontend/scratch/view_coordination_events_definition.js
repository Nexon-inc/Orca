const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\supabase\\migrations\\001_initial_schema.sql';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('create table public.coordination_events')) {
      for (let i = idx; i < idx + 25; i++) {
        console.log(`${i+1}: ${lines[i]}`);
      }
    }
  });
}
