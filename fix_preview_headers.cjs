const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const thPrice = `<th className="p-4 text-left w-48 font-black text-indigo-800">مبلغ واحد ({showInvoiceCurrency(previewInvoiceData.currency)})</th>`;
const thPriceRep = `{!activeTab.includes('warehouse') && <th className="p-4 text-left w-48 font-black text-indigo-800">مبلغ واحد ({showInvoiceCurrency(previewInvoiceData.currency)})</th>}`;

const thDiscount = `<th className="p-4 text-center w-28 font-black">تخفیف (٪)</th>`;
const thDiscountRep = `{!activeTab.includes('warehouse') && <th className="p-4 text-center w-28 font-black">تخفیف (٪)</th>}`;

const thTotal = `<th className="p-4 text-left w-48 font-black text-indigo-800">کل خالص ({showInvoiceCurrency(previewInvoiceData.currency)})</th>`;
const thTotalRep = `{!activeTab.includes('warehouse') && <th className="p-4 text-left w-48 font-black text-indigo-800">کل خالص ({showInvoiceCurrency(previewInvoiceData.currency)})</th>}`;

code = code.replace(thPrice, thPriceRep);
code = code.replace(thDiscount, thDiscountRep);
code = code.replace(thTotal, thTotalRep);

const tdPrice = `<td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice || 0)}</td>`;
const tdPriceRep = `{!activeTab.includes('warehouse') && <td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice || 0)}</td>}`;

const tdDiscount = `<td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>`;
const tdDiscountRep = `{!activeTab.includes('warehouse') && <td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>}`;

const tdTotal = `<td className="p-4 text-left font-black text-indigo-900 font-mono bg-indigo-50/30 border-r border-indigo-100/50" dir="ltr">`;
// Wait, tdTotal is differently formatted:
// <td className="p-4 text-left font-black text-indigo-900 font-mono bg-indigo-50/30 border-r border-indigo-100/50" dir="ltr">{formatCurrency(item.totalPrice || 0)}</td>
// Let's find exactly how tdTotal looks in previewInvoiceData.items.map loop

fs.writeFileSync('src/App.tsx', code);
console.log('done headers');
