const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\John Kyalo\\Desktop\\Tests\\Orca';
const targetDir = 'C:\\Users\\John Kyalo\\Desktop\\REPOS\\Orca';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      if (childItemName === 'node_modules' || childItemName === '.next' || childItemName === '.git') {
        return;
      }
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

async function prepareAndPush() {
  console.log('1. Copying files to REPOS/Orca...');
  copyRecursiveSync(srcDir, targetDir);
  console.log('Copy complete!');

  console.log('\n2. Configuring Git user in REPOS/Orca...');
  execSync('git config user.email "nexonicindustries@gmail.com"', { cwd: targetDir });
  execSync('git config user.name "nexon"', { cwd: targetDir });

  console.log('\n3. Checking Git remotes in REPOS/Orca...');
  try {
    const remotes = execSync('git remote -v', { cwd: targetDir, encoding: 'utf8' });
    console.log('Remotes:\n' + remotes);
  } catch (e) {
    console.log('No remotes configured or git not initialized');
  }

  console.log('\n4. Staging changes...');
  execSync('git add .', { cwd: targetDir });

  const status = execSync('git status --short', { cwd: targetDir, encoding: 'utf8' });
  console.log('Status:\n' + (status || '(no changes to commit)'));

  if (status.trim()) {
    console.log('\n5. Creating commit...');
    execSync('git commit -m "feat: Add Lunar AI Agent, $99 single pricing, Hero chat redirect, and chat bug fixes"', { cwd: targetDir });
  }

  console.log('\n6. Attempting git push...');
  try {
    const pushOutput = execSync('git push', { cwd: targetDir, encoding: 'utf8' });
    console.log('Git push output:\n' + pushOutput);
  } catch (err) {
    console.error('Git push output/error:\n' + (err.stdout || err.stderr || err.message));
  }
}

prepareAndPush();
