const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\lib\\agents\\skills.ts', 'utf8');
const lines = content.split('\n');

console.log('--- HubSpot Skill ---');
console.log(lines.slice(185, 205).join('\n'));

console.log('\n--- Google Ecosystem Skill ---');
console.log(lines.slice(385, 415).join('\n'));
