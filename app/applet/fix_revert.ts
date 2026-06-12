import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const receiptPrefix = type === 'receive' \? \(storeSettings\.prefix_receive_receipt \|\| 'RD-'\) : type === 'salary' \? \(storeSettings\.prefix_salary \|\| 'PAY-'\) : \(storeSettings\.prefix_pay_receipt \|\| 'PD-'\);/g;
const replacement = `const receiptPrefix = type === 'receive' ? (storeSettings.prefix_receive_receipt || 'RD-') : (storeSettings.prefix_pay_receipt || 'PD-');`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
