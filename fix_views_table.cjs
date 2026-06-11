const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const thUnit1 = `<th className="p-4 text-left w-48 font-black text-indigo-800">مبلغ واحد ({showInvoiceCurrency(viewingInvoice.currency)})</th>`;
const thUnitRep1 = `{!viewingInvoice.type.includes('warehouse') && <th className="p-4 text-left w-48 font-black text-indigo-800">مبلغ واحد ({showInvoiceCurrency(viewingInvoice.currency)})</th>}`;

const thDisc1 = `<th className="p-4 text-center w-28 font-black">تخفیف (٪)</th>`;
const thDiscRep1 = `{!viewingInvoice.type.includes('warehouse') && <th className="p-4 text-center w-28 font-black">تخفیف (٪)</th>}`;

const thTot1 = `<th className="p-4 text-left w-48 font-black text-indigo-800">کل خالص ({showInvoiceCurrency(viewingInvoice.currency)})</th>`;
const thTotRep1 = `{!viewingInvoice.type.includes('warehouse') && <th className="p-4 text-left w-48 font-black text-indigo-800">کل خالص ({showInvoiceCurrency(viewingInvoice.currency)})</th>}`;

code = code.replace(thUnit1, thUnitRep1);
// Because thDisc1 can appear twice (once for viewing, once for preview)
code = code.replace(thDisc1, thDiscRep1);
code = code.replace(thTot1, thTotRep1);

const tdUnit1 = `<td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice)}</td>`;
const tdDisc1 = `<td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>`;
const tdTot1 = `<td className="p-4 text-left text-indigo-700 font-black font-mono bg-indigo-50/30" dir="ltr">{formatCurrency(item.totalPrice)}</td>`;

const chunk1 = `<td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice)}</td>
                                  <td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>
                                  <td className="p-4 text-left text-indigo-700 font-black font-mono bg-indigo-50/30" dir="ltr">{formatCurrency(item.totalPrice)}</td>`;

const repChunk1 = `{!viewingInvoice.type.includes('warehouse') && (
                                    <>
                                      <td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice)}</td>
                                      <td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>
                                      <td className="p-4 text-left text-indigo-700 font-black font-mono bg-indigo-50/30" dir="ltr">{formatCurrency(item.totalPrice)}</td>
                                    </>
                                  )}`;

code = code.replace(chunk1, repChunk1);

const summaryBlock1 = `{/* Pricing summaries + Letters */}
                        {(!activeTab.includes('warehouse')) && (
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2 relative" style={{ zIndex: 10 }}>`;
// Wait, I already changed it for activeTab previously!
// Let's replace preview and viewing to use their own type instead of activeTab.
const previewHUnit = `{!activeTab.includes('warehouse') && <th className="p-4 text-left w-48 font-black text-indigo-800">مبلغ واحد ({showInvoiceCurrency(previewInvoiceData.currency)})</th>}`;
const previewHUnitRep = `{!previewInvoiceData.type.includes('warehouse') && <th className="p-4 text-left w-48 font-black text-indigo-800">مبلغ واحد ({showInvoiceCurrency(previewInvoiceData.currency)})</th>}`;
code = code.replace(previewHUnit, previewHUnitRep);

const previewHDisc = `{!activeTab.includes('warehouse') && <th className="p-4 text-center w-28 font-black">تخفیف (٪)</th>}`;
const previewHDiscRep = `{!previewInvoiceData.type.includes('warehouse') && <th className="p-4 text-center w-28 font-black">تخفیف (٪)</th>}`;
code = code.replace(previewHDisc, previewHDiscRep);

const previewHTot = `{!activeTab.includes('warehouse') && <th className="p-4 text-left w-48 font-black text-indigo-800">کل خالص ({showInvoiceCurrency(previewInvoiceData.currency)})</th>}`;
const previewHTotRep = `{!previewInvoiceData.type.includes('warehouse') && <th className="p-4 text-left w-48 font-black text-indigo-800">کل خالص ({showInvoiceCurrency(previewInvoiceData.currency)})</th>}`;
code = code.replace(previewHTot, previewHTotRep);

const previewChunk = `{!activeTab.includes('warehouse') && (
                                    <>
                                  <td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice || 0)}</td>
                                  <td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>
                                  <td className="p-4 text-left text-amber-900 font-black font-mono bg-amber-50/30" dir="ltr">{formatCurrency(item.totalPrice || 0)}</td>
                                    </>
                                  )}`;
const previewChunkRep = `{!previewInvoiceData.type.includes('warehouse') && (
                                    <>
                                  <td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice || 0)}</td>
                                  <td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>
                                  <td className="p-4 text-left text-amber-900 font-black font-mono bg-amber-50/30" dir="ltr">{formatCurrency(item.totalPrice || 0)}</td>
                                    </>
                                  )}`;
code = code.replace(previewChunk, previewChunkRep);

code = code.replace(/\{\(!activeTab\.includes\('warehouse'\)\) && \(\s*<div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2 relative" style=\{\{ zIndex: 10 \}\}>/g, (match, offset, str) => {
    // If it's near previewInvoiceData, replace with previewInvoiceData.type. Else viewingInvoice.type.
    let recent = str.substring(offset - 1000, offset);
    if(recent.includes('previewInvoiceData')) {
        return `{(!previewInvoiceData.type.includes('warehouse')) && (\n                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2 relative" style={{ zIndex: 10 }}>`;
    } else {
        return `{(!viewingInvoice.type.includes('warehouse')) && (\n                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2 relative" style={{ zIndex: 10 }}>`;
    }
});

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing views table headers')
