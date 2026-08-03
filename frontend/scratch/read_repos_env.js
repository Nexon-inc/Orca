const fs = require('fs');
const path = require('path');
const file = 'C:\\Users\\John Kyalo\\Desktop\\REPOS\\Orca\\frontend\\.env.local';

if (fs.existsSync(file)) {
  const env = fs.readFileSync(file, 'utf8');
  env.split('\n').forEach(line => {
    if (line.includes('SUPABASE') || line.includes('DATABASE')) {
      console.log(line.trim());
    }
  });
} else {
  console.log('REPOS env file not found');
}
