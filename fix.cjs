const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const relative = path.relative('d:\\APPS\\ZelenyZvon\\Zeleny_Zvon_nextGen', dir);
      const depth = relative.split(path.sep).length;
      let prefix = '';
      for(let i=0; i<depth; i++) prefix += '../';
      
      content = content.replace(/from\s+['"](\.\.\/)+lib\/db\.js['"]/g, `from '${prefix}lib/db.js'`);
      content = content.replace(/from\s+['"](\.\.\/)+lib\/auth\.js['"]/g, `from '${prefix}lib/auth.js'`);
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

fixImports('d:\\APPS\\ZelenyZvon\\Zeleny_Zvon_nextGen\\app');
console.log('Fixed imports!');
