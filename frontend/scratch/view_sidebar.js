const fs = require('fs');

const sidebarFile = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend\\components\\DashboardSidebar.tsx';

if (fs.existsSync(sidebarFile)) {
  console.log(fs.readFileSync(sidebarFile, 'utf8').slice(0, 3000));
} else {
  console.log('Sidebar file not found');
}
