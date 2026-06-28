import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
let lines = content.split('\n');
lines.splice(14451, 23);
fs.writeFileSync('src/App.tsx', lines.join('\n'));
