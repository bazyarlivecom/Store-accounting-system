import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const personInvoices = invoices.filter(inv => inv.customerId?.toString() === receiptPersonId.toString() && inv.paymentStatus !== 'paid' && ((isReceive && inv.type === 'sale') || (!isReceive && inv.type === 'purchase')));",
  "const personInvoices = invoices.filter(inv => inv.customerId?.toString() === receiptPersonId.toString() && inv.paymentStatus !== 'paid' && ((isReceive && (inv.type === 'sale' || inv.type === 'purchase_return')) || (!isReceive && (inv.type === 'purchase' || inv.type === 'sale_return'))));"
);

// We should also replace the label inside the map for personInvoices
code = code.replace(
  "inv.type === 'sale' ? 'فاکتور فروش' : 'فاکتور خرید'",
  "inv.type === 'sale' ? 'فاکتور فروش' : inv.type === 'purchase' ? 'فاکتور خرید' : inv.type === 'sale_return' ? 'برگشت از فروش' : 'برگشت از خرید'"
);


fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx personInvoices updated');
