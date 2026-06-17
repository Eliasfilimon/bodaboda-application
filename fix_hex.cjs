const fs = require('fs');
const path = require('path');

function replaceHex(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceHex(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      content = content.replace(/#00A86B/gi, '#2563EB'); // Replace old green with new blue
      content = content.replace(/text-\[#00A86B\]/gi, 'text-twende-primary'); // Clean up tailwind classes

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated hex in ${fullPath}`);
      }
    }
  }
}

if (fs.existsSync('./src/pages')) replaceHex('./src/pages');
if (fs.existsSync('./src/components')) replaceHex('./src/components');
