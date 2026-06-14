const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/font-mono text-left" dir="ltr" text-\[10px\]"/g, 'font-mono text-left text-[10px]" dir="ltr"');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
