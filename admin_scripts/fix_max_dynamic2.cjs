const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            let qty = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
            if (activeTab === 'create_warehouse_receipt' && typeof updatedItem.maxQuantity !== 'undefined') {
              if (qty > updatedItem.maxQuantity) qty = updatedItem.maxQuantity;
            }`;

const repStr = `            let qty = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
            if (activeTab === 'create_warehouse_receipt' && sourceInvoiceId) {
               const sourceInv = invoices.find(i => i.id.toString() === sourceInvoiceId.toString());
               if (sourceInv) {
                 const pastReceipts = invoices.filter(i => i.type === 'warehouse_receipt' && i.sourceInvoiceId?.toString() === sourceInvoiceId.toString());
                 const receivedAmounts: Record<string, number> = {};
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
                 const key = updatedItem.productId || updatedItem.productName;
                 const srcItem = sourceInv.items.find((si: any) => (si.productId || si.productName) === key);
                 if (srcItem) {
                    const received = receivedAmounts[key] || 0;
                    let maxQty = (Number(srcItem.quantity) || 0) - received;
                    if (typeof updatedItem.maxQuantity !== 'undefined') {
                       if (qty > updatedItem.maxQuantity) qty = updatedItem.maxQuantity;
                    } else {
                       if (qty > maxQty) qty = maxQty;
                       updatedItem.maxQuantity = maxQty;
                    }
                 }
               }
            } else if (activeTab === 'create_warehouse_receipt' && typeof updatedItem.maxQuantity !== 'undefined') {
              if (qty > updatedItem.maxQuantity) qty = updatedItem.maxQuantity;
            }`;

code = code.replace(targetStr, repStr);
fs.writeFileSync('src/App.tsx', code);
console.log('done fixing dynamic maxQuantity part 2');
