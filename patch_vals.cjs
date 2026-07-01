const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const regex = /const vals = Object\.values\((.*?)\);/g;
content = content.replace(regex, "const vals = Object.values($1).map(v => (v !== null && typeof v === 'object') ? JSON.stringify(v) : v);");

fs.writeFileSync('server.ts', content);
