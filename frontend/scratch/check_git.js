const { execSync } = require('child_process');
const fs = require('fs');

function checkGit(dir) {
  console.log(`\n=== CHECKING GIT AT: ${dir} ===`);
  if (!fs.existsSync(dir)) {
    console.log('Directory does not exist');
    return;
  }
  try {
    const remotes = execSync('git remote -v', { cwd: dir, encoding: 'utf8' });
    console.log('Remotes:\n' + remotes);

    const status = execSync('git status --short', { cwd: dir, encoding: 'utf8' });
    console.log('Status:\n' + (status || '(clean)'));

    const branch = execSync('git branch --show-current', { cwd: dir, encoding: 'utf8' });
    console.log('Current branch: ' + branch.trim());

    const userEmail = execSync('git config user.email', { cwd: dir, encoding: 'utf8' }).catch(() => '');
    console.log('Config email: ' + userEmail.trim());

  } catch (err) {
    console.error('Git check error:', err.message);
  }
}

checkGit('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca');
checkGit('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\frontend');
checkGit('C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca\\REPOS\\Orca');
