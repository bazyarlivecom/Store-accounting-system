const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We just do simple string replacements for the specific lines
code = code.replace(/text-center font-sans">\s*\{formatNumber\(item.quantity/g, 'text-center font-mono" dir="ltr">\n                                      {formatNumber(item.quantity');
code = code.replace(/text-left font-sans">\{formatCurrency\(item.unitPrice/g, 'text-left font-mono" dir="ltr">{formatCurrency(item.unitPrice');
code = code.replace(/text-center text-red-600 font-sans">\{item.discountPercent/g, 'text-center text-red-600 font-mono" dir="ltr">{item.discountPercent');
code = code.replace(/text-left font-black font-sans">\{formatCurrency\(item.totalPrice/g, 'text-left font-black font-mono" dir="ltr">{formatCurrency(item.totalPrice');

code = code.replace(/text-center text-gray-800 font-sans font-black/g, 'text-center text-gray-800 font-mono font-black border-r border-gray-100/50');
code = code.replace(/text-left text-gray-800 font-sans font-bold">\{formatCurrency\(item\.unitPrice\)}<\/td>/g, 'text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice)}</td>');
code = code.replace(/text-center text-red-500 font-sans font-bold">\{item\.discountPercent\s*\|\|\s*0\}٪<\/td>/g, 'text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>');
code = code.replace(/text-left text-indigo-700 font-black font-sans/g, 'text-left text-indigo-700 font-black font-mono" dir="ltr');
code = code.replace(/text-left text-amber-900 font-black font-sans/g, 'text-left text-amber-900 font-black font-mono" dir="ltr');

// Replace view template 2 body items
code = code.replace(/font-sans">\{formatCurrency\(item\.unitPrice \|\| 0\)}<\/td>/g, 'font-mono" dir="ltr">{formatCurrency(item.unitPrice || 0)}</td>');
code = code.replace(/text-left font-black font-sans">\{formatCurrency\(item\.totalPrice \|\| 0\)}<\/td>/g, 'text-left font-black font-mono" dir="ltr">{formatCurrency(item.totalPrice || 0)}</td>');

code = code.replace(/font-sans">\{formatCurrency\(item\.unitPrice\)}<\/td>/g, 'font-mono" dir="ltr">{formatCurrency(item.unitPrice)}</td>');
code = code.replace(/text-left font-black font-sans">\{formatCurrency\(item\.totalPrice\)}<\/td>/g, 'text-left font-black font-mono" dir="ltr">{formatCurrency(item.totalPrice)}</td>');


fs.writeFileSync('src/App.tsx', code);
console.log("Done");
