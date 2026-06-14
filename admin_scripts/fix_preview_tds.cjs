const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t2 = `                                  <td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice || 0)}</td>
                                  <td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>
                                  <td className="p-4 text-left text-amber-900 font-black font-mono bg-amber-50/30" dir="ltr">{formatCurrency(item.totalPrice || 0)}</td>`;
const t2Rep = `                                  {(!activeTab.includes('warehouse')) && (
                                    <>
                                  <td className="p-4 text-left text-gray-800 font-mono font-bold" dir="ltr">{formatCurrency(item.unitPrice || 0)}</td>
                                  <td className="p-4 text-center text-red-500 font-mono font-bold" dir="ltr">{item.discountPercent || 0}٪</td>
                                  <td className="p-4 text-left text-amber-900 font-black font-mono bg-amber-50/30" dir="ltr">{formatCurrency(item.totalPrice || 0)}</td>
                                    </>
                                  )}`;

code = code.replace(t2, t2Rep);

const pSum = `{/* Pricing summaries + Letters */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2 relative" style={{ zIndex: 10 }}>`;
const pSumRep = `{/* Pricing summaries + Letters */}
                        {(!activeTab.includes('warehouse')) && (
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2 relative" style={{ zIndex: 10 }}>`;
code = code.replace(pSum, pSumRep);

const pSumEnd = `                          </div>
                        </div>`;
// There are multiple `<div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2 relative" style={{ zIndex: 10 }}>` blocks. Let's just wrap the whole thing manually since there are only two (one in viewingInvoice, one in previewInvoiceData) but we are targeting previewInvoiceData inside activeTab area.

fs.writeFileSync('src/App.tsx', code);
console.log('done headers part 2');
