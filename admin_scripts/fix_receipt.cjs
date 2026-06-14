const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<strong className="text-slate-900 font-sans font-black text-base md:text-lg tracking-wide inline-block">\{formatNumber\(Number\(receiptAmount\)\)\}<\/strong>/g, '<strong className="text-slate-900 font-mono font-black text-base md:text-lg tracking-wide inline-block" dir="ltr">{formatNumber(Number(receiptAmount))}</strong>');
code = code.replace(/<span className="text-3xl font-black font-sans font-mono">/g, '<span className="text-3xl font-black font-mono text-left" dir="ltr">');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
