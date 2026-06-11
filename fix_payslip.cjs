const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/font-sans text-left/g, 'font-mono text-left" dir="ltr"');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
