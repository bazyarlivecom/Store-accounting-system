import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(6660, 6680).join('\n'));
