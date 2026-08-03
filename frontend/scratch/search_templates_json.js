const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\orcahub_templates.json';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('Published LinkedIn') || content.includes('outreach to 15') || content.includes('competitor sweep')) {
    console.log('Found mock data in orcahub_templates.json!');
  } else {
    console.log('Not found in orcahub_templates.json');
  }
} else {
  console.log('File not found:', file);
}
