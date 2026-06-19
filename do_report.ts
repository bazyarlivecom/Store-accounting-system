import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to replace the salesVal and purchasesVal with ones that account for returns.
code = code.replace(
  "const salesVal = invoices.filter(inv => inv.type === 'sale'",
  "const salesValRaw = invoices.filter(inv => inv.type === 'sale' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);\n              const salesReturnVal = invoices.filter(inv => inv.type === 'sale_return' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);\n              const salesVal = salesValRaw - salesReturnVal;\n              /*"
);

// We need to close the comment before purchasesVal
code = code.replace(
  "const purchasesVal = invoices.filter(inv => inv.type === 'purchase'",
  "*/\n              const purchasesValRaw = invoices.filter(inv => inv.type === 'purchase' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);\n              const purchasesReturnVal = invoices.filter(inv => inv.type === 'purchase_return' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0);\n              const purchasesVal = purchasesValRaw - purchasesReturnVal;\n              /*"
);

// And close the comment before netVal
code = code.replace(
  "const netVal = salesVal - purchasesVal;",
  "*/\n              const netVal = salesVal - purchasesVal;"
);

// Fix the dashboard card value
code = code.replace(
  "invoices.filter(inv => inv.type === 'sale' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)",
  "invoices.filter(inv => (inv.type === 'sale' || inv.type === 'sale_return') && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.type === 'sale' ? (inv.totalAmount || 0) : -(inv.totalAmount || 0)) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)"
);

code = code.replace(
  "invoices.filter(inv => inv.type === 'purchase' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)",
  "invoices.filter(inv => (inv.type === 'purchase' || inv.type === 'purchase_return') && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.type === 'purchase' ? (inv.totalAmount || 0) : -(inv.totalAmount || 0)) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)"
);

// We need to check Recent Activities list in financial dashboard:
code = code.replace(
  "const baseDesc = inv.title || (inv.type === 'proforma' ? 'ثبت پیش‌فاکتور' : (inv.type === 'purchase' ? 'خرید طی فاکتور' : 'فروش طی فاکتور'));",
  "const baseDesc = inv.title || (inv.type === 'proforma' ? 'ثبت پیش‌فاکتور' : (inv.type === 'purchase' ? 'خرید طی فاکتور' : inv.type === 'purchase_return' ? 'برگشت از خرید' : inv.type === 'sale_return' ? 'برگشت از فروش' : 'فروش طی فاکتور'));"
);

code = code.replace(
  "type: inv.type === 'proforma' ? 'پیش‌فاکتور' : (inv.type === 'purchase' ? 'فاکتور خرید کالا' : 'فاکتور فروش کالا')",
  "type: inv.type === 'proforma' ? 'پیش‌فاکتور' : inv.type === 'purchase_return' ? 'برگشت از خرید' : inv.type === 'sale_return' ? 'برگشت از فروش' : (inv.type === 'purchase' ? 'فاکتور خرید کالا' : 'فاکتور فروش کالا')"
);


fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx report logic updated');
