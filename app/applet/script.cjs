const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
let lines = content.split('\n');
// We want to delete from line 14451 (0-indexed) to 14473
lines.splice(14451, 23);
fs.writeFileSync('src/App.tsx', lines.join('\n'));
