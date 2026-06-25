import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/imageUrl: p\.imageUrl,\n                        imageUrl: p\.imageUrl,/g, 'imageUrl: p.imageUrl,');
fs.writeFileSync('src/App.tsx', content);
