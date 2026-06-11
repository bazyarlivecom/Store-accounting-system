const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
console.log(code.match(/invoices\.filter\\(i => i\\.type === 'purchase'[^\\)]*\\)\\.map/g));
