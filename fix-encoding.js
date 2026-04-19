const fs = require('fs');
const path = require('path');

const replacements = {
  'Ã°Å¸â€ºÂ¡Ã¯Â¸Â': '🛡️',
  'Ã°Å¸Å½Â¥': '🎥',
  'Ã°Å¸Â¤Âµ': '🤵',
  'ðŸ”¥': '🔥',
  'â†’': '→',
  'â­': '⭐',
  'âœ“': '✓',
  'Ã': '' // cleanup any remaining
};

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      walk(file);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;
      for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
      }
    }
  });
}

walk('c:/Users/John Kyalo/Desktop/REPOS/Orca/frontend');
