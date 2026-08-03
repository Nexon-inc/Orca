const fs = require('fs');

const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\utils\\supabase\\middleware.ts';

if (fs.existsSync(file)) {
  console.log(fs.readFileSync(file, 'utf8'));
} else {
  console.log('Supabase middleware not found');
}
