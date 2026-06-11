const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tEdit = `                                  setInvoiceType(inv.type);
                                  setInvoiceCurrency(inv.currency || storeSettings.currency);
                                  setCustomerId(inv.customerId);
                                  setItems(inv.items.map((i: any) => ({ ...i })));
                                  setOverallDiscountPercent(inv.overallDiscountPercent || 0);`;

const repEdit = `                                  setInvoiceType(inv.type);
                                  setInvoiceCurrency(inv.currency || storeSettings.currency);
                                  setCustomerId(inv.customerId);
                                  setSourceInvoiceId(inv.sourceInvoiceId || '');
                                  setItems(inv.items.map((i: any) => ({ ...i })));
                                  setOverallDiscountPercent(inv.overallDiscountPercent || 0);`;

code = code.replace(tEdit, repEdit);

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing setSourceInvoiceId for edits');
