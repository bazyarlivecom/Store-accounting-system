import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const mobileSidebarRegex = /\{\/\* Mobile Side Drawer \(Visible only on mobile when menu is toggled\) \*\/\}/g;
content = content.replace(mobileSidebarRegex, '{/* Sidebar */}');

content = content.replace(
  /w-64 bg-white border-l border-gray-100 flex flex-col fixed inset-y-0 right-0 h-full z-50 transition-transform duration-300 transform md:hidden \$\{isSidebarOpen \? 'translate-x-0' : 'translate-x-full'\}/g,
  "w-64 bg-white border-l border-gray-100 flex flex-col fixed inset-y-0 right-0 h-full z-40 transition-transform duration-300 transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}"
);
content = content.replace(
  /<div className=\{\`w-64 bg-white border-l/g,
  '<aside className={`w-64 bg-white border-l'
);

const navStart = content.indexOf('{/* Desktop Horizontal Navigation Header & Menu (Visible ONLY on desktop screens) */}');
const navEnd = content.indexOf('{/* Main Content Area */}');
if (navStart > -1 && navEnd > -1) {
    const beforeNav = content.substring(0, navStart);
    // find the closing div of the sidebar
    const closingDivIdx = beforeNav.lastIndexOf('</div>');
    const newBeforeNav = beforeNav.substring(0, closingDivIdx) + '</aside>\n' + beforeNav.substring(closingDivIdx + 6);
    content = newBeforeNav + content.substring(navEnd);
}

content = content.replace('<div className="flex-1 flex flex-col w-full min-w-0">',
'<div className="flex-1 flex flex-col w-full min-w-0 md:mr-64 transition-all duration-300">');

fs.writeFileSync('src/App.tsx', content);
