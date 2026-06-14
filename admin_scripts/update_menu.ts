import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove aside completely
const asideRegex = /<aside[\s\S]*?<\/aside>/;
content = content.replace(asideRegex, '');

// 2. Remove mobile overlay
const mobileOverlayRegex = /\{\/\* Mobile Menu Overlay \*\/\}\s*\{\s*isSidebarOpen && \(\s*<div\s*className="fixed inset-0 bg-gray-900\/50 z-40 md:hidden"\s*onClick=\{\(\) => setIsSidebarOpen\(false\)\}\s*\/>\s*\)\s*\}/;
content = content.replace(mobileOverlayRegex, '');

// 3. Remove Mobile Header
const mobileHeaderRegex = /\{\/\* Mobile Header \*\/\}\s*<div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">[\s\S]*?<\/div>\s*<div className="flex-1/;
content = content.replace(mobileHeaderRegex, '<div className="flex-1');

// 4. Update Desktop Header to be always visible
const desktopHeaderClass = /className="hidden md:flex flex-col bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm"/;
content = content.replace(desktopHeaderClass, 'className="flex flex-col bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm"');

// 5. Update justify-start in Horizontal Navigation
// "از ابتدای صفحه شروع شود نه از وسط" might indicate that because of "justify-start" it might be behaving weirdly? 
// No, justify-start in a flex container is the default. Let's make sure it's flex items-center gap-2 overflow-x-auto.
const horizontalNavClass = /className="flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar justify-start border-t border-gray-50 pt-2"/;
content = content.replace(horizontalNavClass, 'className="flex items-center gap-1.5 px-4 pb-2 overflow-x-auto no-scrollbar border-t border-gray-50 pt-2"');

fs.writeFileSync('src/App.tsx', content);
