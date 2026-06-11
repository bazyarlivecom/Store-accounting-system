const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t = code.match(/case 'create_sale':([\\s\\S]*?)case 'create_purchase':/)?.[1] || "";
let lines = t.split('\\n');
lines.forEach((l, i) => {
  if (l.includes('فاکتور')) {
   console.log((i+1) + ": " + l.trim());
  }
});
