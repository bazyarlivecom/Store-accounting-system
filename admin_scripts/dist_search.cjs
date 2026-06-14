const fs = require('fs');
const txt = fs.readFileSync('dist/assets/index-Dyrf6sjA.js', 'utf-8');
const i1 = txt.indexOf('به سیستم حسابداری خوش آمدید');
console.log('Login index:', i1);
console.log(txt.substring(i1 - 200, i1 + 500));
