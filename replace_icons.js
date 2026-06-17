/* global require */
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
  'FaRoute': 'HiOutlineMap'
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
      
      // Keep track of which hi2 icons are needed
      const hiIconsNeeded = new Set();
      
      // Replace instances of mapped icons in the body
      for (const [oldIcon, newIcon] of Object.entries(iconMap)) {
        // Regex to replace <FiIcon /> or <FiIcon className="..." /> or {FiIcon}
        const regex = new RegExp(`\\b${oldIcon}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, newIcon);
          hiIconsNeeded.add(newIcon);
        }
      }
      
      if (hiIconsNeeded.size > 0) {
        // If we added new hi2 icons, we need to ensure the import is there
        const importStr = `import { ${Array.from(hiIconsNeeded).join(', ')} } from 'react-icons/hi2';\n`;
        
        // Remove empty react-icons/fi or react-icons/fa imports if they exist
        // Note: fa might still have FaMotorcycle, so we only remove if empty
        
        // We'll just prepend the new import right after React imports or at top
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine + 1) + importStr + content.slice(endOfLine + 1);
        } else {
            content = importStr + content;
        }
        
        // Remove old unused imports
        // To be safe, we'll let the bundler complain if we miss any, but we'll try to clean up Fi imports
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

processDirectory('./src/pages');
processDirectory('./src/components');
