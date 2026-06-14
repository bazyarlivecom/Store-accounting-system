const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr1 = `const receivedAmounts: Record<string, number> = {};
        pastReceipts.forEach(receipt => {
          if (receipt.items) {
            receipt.items.forEach((rt: any) => {
               if (!receivedAmounts[rt.productId]) receivedAmounts[rt.productId] = 0;
               receivedAmounts[rt.productId] += Number(rt.quantity) || 0;
            });
          }
        });
        
        const remainingItems = sourceInv.items.map((it: any) => {
          const received = receivedAmounts[it.productId] || 0;
          const remaining = (Number(it.quantity) || 0) - received;
          return {
            ...it,
            id: Math.random().toString(36).substring(2, 9),
            quantity: remaining > 0 ? remaining : 0,
            warehouseId: '', // User will select destination warehouse
          };
        }).filter((it: any) => it.quantity > 0);`;

const repStr1 = `const receivedAmounts: Record<string, number> = {};
        pastReceipts.forEach(receipt => {
          if (receipt.items) {
            receipt.items.forEach((rt: any) => {
               const key = rt.productId || rt.productName;
               if (!key) return;
               if (!receivedAmounts[key]) receivedAmounts[key] = 0;
               receivedAmounts[key] += Number(rt.quantity) || 0;
            });
          }
        });
        
        const remainingItems = sourceInv.items.map((it: any) => {
          const key = it.productId || it.productName;
          const received = key ? (receivedAmounts[key] || 0) : 0;
          const remaining = (Number(it.quantity) || 0) - received;
          return {
            ...it,
            id: Math.random().toString(36).substring(2, 9),
            maxQuantity: remaining > 0 ? remaining : 0, // Save max
            quantity: remaining > 0 ? remaining : 0,
            warehouseId: '', // User will select destination warehouse
          };
        }).filter((it: any) => it.quantity > 0);`;

code = code.replace(targetStr1, repStr1);
fs.writeFileSync('src/App.tsx', code);
console.log('done modifying logic 1');
