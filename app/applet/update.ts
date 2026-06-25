import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/badge: getRoleName\(p\.role\),/g, 'badge: getRoleName(p.role),\n                        imageUrl: p.imageUrl,');
fs.writeFileSync('src/App.tsx', content);
