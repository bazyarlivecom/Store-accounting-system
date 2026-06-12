import fs from 'fs';
const appPath = './src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Replace all z-50 in fixed inset-0 with z-[100]
content = content.replace(/className="fixed inset-0 z-50/g, 'className="fixed inset-0 z-[100]');

// Also replace z-[60] in fixed inset-0 with z-[100]
content = content.replace(/className="fixed inset-0 z-\[60\]/g, 'className="fixed inset-0 z-[100]');

fs.writeFileSync(appPath, content);
console.log('Z-indexes updated successfully.');
