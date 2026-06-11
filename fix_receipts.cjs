const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const sourceFn = `  const handleSourceInvoiceChange = (invoiceId: string | number) => {
    setSourceInvoiceId(invoiceId);
    if (!invoiceId) return;

    const sourceInv = invoices.find(i => i.id.toString() === invoiceId.toString());
    if (sourceInv) {
      if (sourceInv.customerId) setCustomerId(sourceInv.customerId);
      if (sourceInv.currency) {
        setInvoiceCurrency(sourceInv.currency);
        setExchangeRate(sourceInv.exchangeRate || 1);
        setExchangeRateInput(String(sourceInv.exchangeRate || 1));
      }
      if (sourceInv.items && Array.isArray(sourceInv.items)) {
        setItems(sourceInv.items.map((it: any) => ({
          ...it,
          id: Math.random().toString(36).substring(2, 9),
          warehouseId: '', // User will select destination warehouse
        })));
      }
    }
  };`;

const targetFn = `  const handleSourceInvoiceChange = (invoiceId: string | number) => {
    setSourceInvoiceId(invoiceId);
    if (!invoiceId) return;

    const sourceInv = invoices.find(i => i.id.toString() === invoiceId.toString());
    if (sourceInv) {
      if (sourceInv.customerId) setCustomerId(sourceInv.customerId);
      if (sourceInv.currency) {
        setInvoiceCurrency(sourceInv.currency);
        setExchangeRate(sourceInv.exchangeRate || 1);
        setExchangeRateInput(String(sourceInv.exchangeRate || 1));
      }
      if (sourceInv.items && Array.isArray(sourceInv.items)) {
        // Calculate previously received amounts
        const pastReceipts = invoices.filter(i => i.type === 'warehouse_receipt' && i.sourceInvoiceId?.toString() === invoiceId.toString());
        const receivedAmounts: Record<string, number> = {};
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
        }).filter((it: any) => it.quantity > 0);

        setItems(remainingItems);
      }
    }
  };`;

code = code.replace(sourceFn, targetFn);
fs.writeFileSync('src/App.tsx', code);
console.log('done source invoice logic');
