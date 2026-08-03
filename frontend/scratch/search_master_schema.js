const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\supabase\\master_schema.sql';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('Published LinkedIn') || content.includes('outreach to 15') || content.includes('competitor sweep')) {
    console.log('Found match in master_schema.sql!');
  } else {
    console.log('Not found in master_schema.sql');
  }
}
