import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace showSuccess with setSuccessMsg locally with script string
content = content.replace(/showSuccess\(/g, 'setSuccessMsg(');

fs.writeFileSync('src/App.tsx', content);
