import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(6665, 6689).join('\n'));
