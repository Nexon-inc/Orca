const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\.env.local';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach(line => {
    if (line.includes('PAYSTACK')) {
      console.log(line.trim());
    }
  });
}
