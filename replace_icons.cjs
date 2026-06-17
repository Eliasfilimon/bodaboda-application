const fs = require('fs');
const path = require('path');

const iconMap = {
  'FiArrowLeft': 'HiOutlineArrowLeft',
  'FiArrowRight': 'HiOutlineArrowRight',
  'FiClock': 'HiOutlineClock',
  'FiUser': 'HiOutlineUser',
  'FiCheckCircle': 'HiOutlineCheckCircle',
  'FiXCircle': 'HiOutlineXCircle',
  'FiStar': 'HiOutlineStar',
  'FiNavigation': 'HiOutlinePaperAirplane',
  'FiMapPin': 'HiOutlineMapPin',
  'FiPhone': 'HiOutlinePhone',
  'FiMenu': 'HiOutlineBars3',
  'FiX': 'HiOutlineXMark',
  'FiLogOut': 'HiOutlineArrowRightOnRectangle',
  'FiActivity': 'HiOutlineChartBar',
  'FiUsers': 'HiOutlineUsers',
  'FiMap': 'HiOutlineMap',
  'FiCheck': 'HiOutlineCheck',
  'FiCreditCard': 'HiOutlineCreditCard',
  'FiAlertTriangle': 'HiOutlineExclamationTriangle',
  'FiClipboard': 'HiOutlineClipboardDocumentList',
  'FiCalendar': 'HiOutlineCalendarDays',
  'FiLoader': 'HiOutlineArrowPath',
  'FaBox': 'HiOutlineCube',
  'FaMapMarkerAlt': 'HiOutlineMapPin',
  'FaShieldAlt': 'HiOutlineShieldCheck',
  'FaRoute': 'HiOutlineMap',
  'FiSearch': 'HiOutlineMagnifyingGlass'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      const hiIconsNeeded = new Set();
      
      for (const [oldIcon, newIcon] of Object.entries(iconMap)) {
        const regex = new RegExp(`\\b${oldIcon}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, newIcon);
          hiIconsNeeded.add(newIcon);
        }
      }
      
      if (hiIconsNeeded.size > 0) {
        const importStr = `import { ${Array.from(hiIconsNeeded).join(', ')} } from 'react-icons/hi2';\n`;
        
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine + 1) + importStr + content.slice(endOfLine + 1);
        } else {
            content = importStr + content;
        }
        
        content = content.replace(/import\s+{([^}]+)}\s+from\s+'react-icons\/(fi|fa)';/g, (match, imports, pkg) => {
            let remaining = imports.split(',').map(i => i.trim()).filter(i => !Object.values(iconMap).includes(i));
            if (remaining.length > 0) {
                return `import { ${remaining.join(', ')} } from 'react-icons/${pkg}';`;
            }
            return '';
        });
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

if (fs.existsSync('./src/pages')) processDirectory('./src/pages');
if (fs.existsSync('./src/components')) processDirectory('./src/components');
