import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');
console.log('1083: ', lines[1082]);
console.log('1084: ', lines[1083]);
console.log('1085: ', lines[1084]);
console.log('1086: ', lines[1085]);
