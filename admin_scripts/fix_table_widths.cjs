const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace creation form tables to have min widths
code = code.replace(/<table className="w-full text-right">/g, '<table className="w-full text-right min-w-[1000px]">');

fs.writeFileSync('src/App.tsx', code);
console.log("Done adding min-widths");
