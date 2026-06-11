const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
console.log(code.substring(code.indexOf('const handleItemChange ='), code.indexOf('const handleRemoveItem =')));
