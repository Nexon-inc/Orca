const fs = require('fs');
const env = fs.readFileSync('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local', 'utf8');

env.split('\n').forEach(line => {
  if (line.includes('SUPABASE') || line.includes('DATABASE')) {
    console.log(line.trim());
  }
});
