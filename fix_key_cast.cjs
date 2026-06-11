const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const key = rt\.productId \|\| rt\.productName;/g, "const key = String(rt.productId || rt.productName || '');");
code = code.replace(/const key = it\.productId \|\| it\.productName;/g, "const key = String(it.productId || it.productName || '');");
code = code.replace(/const key = updatedItem\.productId \|\| updatedItem\.productName;/g, "const key = String(updatedItem.productId || updatedItem.productName || '');");

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing key cast');
