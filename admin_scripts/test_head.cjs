const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\\n');
let count = 0;
lines.forEach((l, i) => {
  if (l.includes('فاکتور')) {
   count++;
   if(count <= 30) console.log((i+1) + ": " + l.trim());
  }
});
