import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    /if \(activeTab === 'create_sale'\) \{\n\s*setInvoiceType\('sale'\);\n\s*setInvoiceTitle\('فاکتور فروش کالا'\);\n\s*\} else/g,
    `if (activeTab === 'create_sale') {
      setInvoiceType('sale');
      setInvoiceTitle('فاکتور فروش کالا');
    } else if (activeTab === 'create_sale_return') {
      setInvoiceType('sale_return');
      setInvoiceTitle('فاکتور برگشت از فروش');
    } else if (activeTab === 'create_purchase_return') {
      setInvoiceType('purchase_return');
      setInvoiceTitle('فاکتور برگشت از خرید');
    } else`
);

code = code.replace(
    /if \(activeTab === 'create_sale'\) \{\n\s*setInvoiceType\('sale'\);\n\s*setInvoiceTitle\('فاکتور فروش کالا'\);\n\s*setInvoicePaymentStatus\('unpaid'\);\n\s*setInvoicePaidAmount\(0\);\n\s*\} else/g,
    `if (activeTab === 'create_sale') {
          setInvoiceType('sale');
          setInvoiceTitle('فاکتور فروش کالا');
          setInvoicePaymentStatus('unpaid');
          setInvoicePaidAmount(0);
        } else if (activeTab === 'create_sale_return') {
          setInvoiceType('sale_return');
          setInvoiceTitle('فاکتور برگشت از فروش');
          setInvoicePaymentStatus('unpaid');
          setInvoicePaidAmount(0);
        } else if (activeTab === 'create_purchase_return') {
          setInvoiceType('purchase_return');
          setInvoiceTitle('فاکتور برگشت از خرید');
          setInvoicePaymentStatus('unpaid');
          setInvoicePaidAmount(0);
        } else`
);

code = code.replace(
      /inv\.type === 'sale' \? 'create_sale' :/g,
      "inv.type === 'sale_return' ? 'create_sale_return' : inv.type === 'purchase_return' ? 'create_purchase_return' : inv.type === 'sale' ? 'create_sale' :"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Done additional app fixes');
