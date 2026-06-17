const fs = require('fs');
const path = require('path');

const authPages = [
  'LoginPage.jsx',
  'RegisterPage.jsx',
  'RiderLoginPage.jsx',
  'RiderRegisterPage.jsx'
];

authPages.forEach(file => {
  const fullPath = path.join(__dirname, 'src', 'pages', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/twende-primary/g, 'twende-brand');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
