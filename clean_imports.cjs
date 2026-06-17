const fs = require('fs');
const path = require('path');

function cleanImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      cleanImports(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      content = content.replace(/import\s+{([^}]+)}\s+from\s+["']react-icons\/(fi|fa)["'];?/g, (match, imports, pkg) => {
          let remaining = imports.split(',').map(i => i.trim()).filter(i => !i.startsWith('HiOutline'));
          if (remaining.length > 0) {
              return `import { ${remaining.join(', ')} } from 'react-icons/${pkg}';`;
          }
          return '';
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Cleaned imports in ${fullPath}`);
      }
    }
  }
}

if (fs.existsSync('./src/pages')) cleanImports('./src/pages');
if (fs.existsSync('./src/components')) cleanImports('./src/components');
