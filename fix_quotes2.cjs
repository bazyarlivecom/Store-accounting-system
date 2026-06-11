const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/font-mono text-left" dir="ltr" text-sm text-emerald-800"/g, 'font-mono text-left text-sm text-emerald-800" dir="ltr"');
code = code.replace(/font-mono text-left" dir="ltr" text-sm text-rose-800"/g, 'font-mono text-left text-sm text-rose-800" dir="ltr"');
code = code.replace(/font-mono text-left" dir="ltr" text-xs text-gray-500 self-center"/g, 'font-mono text-left text-xs text-gray-500 self-center" dir="ltr"');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
