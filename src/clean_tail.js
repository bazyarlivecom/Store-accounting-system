import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

// Keep only up to line 12806
const newLines = lines.slice(0, 12806);
fs.writeFileSync('src/App.tsx', newLines.join('\n'));
