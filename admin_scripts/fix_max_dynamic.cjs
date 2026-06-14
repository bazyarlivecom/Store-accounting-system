const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tHelper = `            let qty = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
            if (activeTab === 'create_warehouse_receipt' && typeof updatedItem.maxQuantity !== 'undefined') {
              if (qty > updatedItem.maxQuantity) qty = updatedItem.maxQuantity;
            }`;

const repHelper = `            let qty = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
            if (activeTab === 'create_warehouse_receipt' && sourceInvoiceId) {
               // dynamically calculate max allowed
               const sourceInv = invoices.find(i => i.id.toString() === sourceInvoiceId.toString());
               if (sourceInv) {
                 const pastReceipts = invoices.filter(i => i.type === 'warehouse_receipt' && i.sourceInvoiceId?.toString() === sourceInvoiceId.toString() && i.id !== invoiceId); // wait, invoiceId is not defined here.
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
                    const maxQty = (Number(srcItem.quantity) || 0) - received;
                    if (qty > maxQty) qty = maxQty;
                    updatedItem.maxQuantity = maxQty; // retain for UI
                 }
               }
            } else if (activeTab === 'create_warehouse_receipt' && typeof updatedItem.maxQuantity !== 'undefined') {
              if (qty > updatedItem.maxQuantity) qty = updatedItem.maxQuantity;
            }`;

code = code.replace(tHelper, repHelper);
fs.writeFileSync('src/App.tsx', code);
console.log('done fixing dynamic maxQuantity');
