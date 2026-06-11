const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/                           \)\}\n                           \)\}/g, '                           )}');
code = code.replace(/                          \)\}\r?\n                          \)\}/g, '                          )}');

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing bracket dup');
