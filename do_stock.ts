import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const remittedSaleQtys: Record<string, number> = {};",
  "const remittedSaleQtys: Record<string, number> = {};\n    const saleReturnQtys: Record<string, number> = {};"
);

code = code.replace(
  "} else if (inv.type === 'sale') {\n               saleQtys[whId] = (saleQtys[whId] || 0) + q;\n           }",
  "} else if (inv.type === 'sale') {\n               saleQtys[whId] = (saleQtys[whId] || 0) + q;\n           } else if (inv.type === 'sale_return') {\n               saleReturnQtys[whId] = (saleReturnQtys[whId] || 0) + q;\n           }"
);

code = code.replace(
  "const totalSale = Object.values(saleQtys).reduce((a, b) => a + b, 0);",
  "const totalSaleRaw = Object.values(saleQtys).reduce((a, b) => a + b, 0);\n    const totalSaleReturn = Object.values(saleReturnQtys).reduce((a, b) => a + b, 0);\n    const totalSale = Math.max(0, totalSaleRaw - totalSaleReturn);"
);

fs.writeFileSync('src/App.tsx', code);
console.log('getProductStockInfo updated');
