const fs = require('fs');
const file = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\agents\\tools.ts';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  console.log('Tools file found. Reading tool names:');
  const regex = /name:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.log(`- ${match[1]}`);
  }
} else {
  // Check if tools are in another file under lib/agents
  console.log('tools.ts not found.');
}
