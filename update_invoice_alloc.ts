import fs from 'fs';

let code = fs.readFileSync('src/components/financial/InvoiceAllocation.tsx', 'utf8');

code = code.replace(
  "(inv.type === 'sale' || inv.type === 'purchase')",
  "(inv.type === 'sale' || inv.type === 'purchase' || inv.type === 'sale_return' || inv.type === 'purchase_return')"
);

code = code.replace(
  "const eligibleInvoices = openInvoices.filter(inv => isReceive ? inv.type === 'sale' : inv.type === 'purchase');",
  "const eligibleInvoices = openInvoices.filter(inv => isReceive ? (inv.type === 'sale' || inv.type === 'purchase_return') : (inv.type === 'purchase' || inv.type === 'sale_return'));"
);

code = code.replace(
  "inv.type === 'sale' ? 'فاکتور فروش کالا' : 'فاکتور خرید کالا'",
  "inv.type === 'sale' ? 'فاکتور فروش' : inv.type === 'purchase' ? 'فاکتور خرید' : inv.type === 'sale_return' ? 'برگشت از فروش' : 'برگشت از خرید'"
);


fs.writeFileSync('src/components/financial/InvoiceAllocation.tsx', code);
console.log('InvoiceAllocation updated');
