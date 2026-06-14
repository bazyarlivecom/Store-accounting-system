const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const helper = `  const saveInvoiceData = async (customPayload?: any) => {`;
const insertHelper = `  const hasRemainingWarehouseItems = (invoiceId: string | number) => {
    const sourceInv = invoices.find(i => i.id.toString() === invoiceId.toString());
    if (!sourceInv || !sourceInv.items) return false;

    const pastReceipts = invoices.filter(i => i.type === 'warehouse_receipt' && i.sourceInvoiceId?.toString() === invoiceId.toString());
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

    const hasAny = sourceInv.items.some((it: any) => {
      const key = it.productId || it.productName;
      const received = key ? (receivedAmounts[key] || 0) : 0;
      const remaining = (Number(it.quantity) || 0) - received;
      return remaining > 0;
    });
    return hasAny;
  };

  const saveInvoiceData = async (customPayload?: any) => {`;

code = code.replace(helper, insertHelper);

const targetSelect = `options={invoices.filter(i => i.type === 'purchase' && (!customerId || i.customerId === customerId)).map`;
const repSelect = `options={invoices.filter(i => i.type === 'purchase' && (!customerId || i.customerId === customerId) && hasRemainingWarehouseItems(i.id)).map`;

code = code.replace(targetSelect, repSelect);

fs.writeFileSync('src/App.tsx', code);
console.log('done modifying logic 2');
