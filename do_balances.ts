import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "if (inv.type === 'sale') balance += amount;\n        else if (inv.type === 'purchase') balance -= amount;",
  "if (inv.type === 'sale') balance += amount;\n        else if (inv.type === 'purchase') balance -= amount;\n        else if (inv.type === 'sale_return') balance -= amount;\n        else if (inv.type === 'purchase_return') balance += amount;"
);

fs.writeFileSync('src/App.tsx', code);
console.log('calculatePersonBalance updated');
