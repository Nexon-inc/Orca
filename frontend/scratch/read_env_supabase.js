const fs = require('fs');

const envFile = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local';

if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  const lines = content.split('\n').filter(l => l.includes('SUPABASE'));
  console.log(lines.join('\n'));
} else {
  console.log('.env.local not found');
}
