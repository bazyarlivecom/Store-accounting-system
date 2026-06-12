import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Patch table header
const targetHeader = `<th className="p-4 font-bold">مبلغ نهایی</th>`;
const newHeader = `{activeTab.includes('warehouse') ? (
                              <th className="p-4 font-bold text-center">انبار مبدا/مقصد</th>
                            ) : (
                              <th className="p-4 font-bold">مبلغ نهایی</th>
                            )}`;
content = content.replace(targetHeader, newHeader);

// Patch table body cell for amount
const targetBody = `<td className="p-4 text-left">
                                 <span className="font-mono font-black text-sm text-indigo-950 bg-indigo-50/50 hover:bg-indigo-100/50 px-2.5 py-1.5 rounded-xl border border-indigo-100/30 inline-block transition-all shadow-xs" dir="ltr">
                                   {formatCurrency(inv.totalAmount || 0)} <span className="text-[10px] text-indigo-600 font-extrabold mr-1">{inv.currency || storeSettings.currency}</span>
                                 </span>
                               </td>`;
const newBody = `<td className="p-4 text-left">
                                {activeTab.includes('warehouse') ? (
                                   <div className="flex justify-center">
                                      <span className="font-sans font-bold text-xs text-emerald-950 bg-emerald-50/50 hover:bg-emerald-100/50 px-2.5 py-1.5 rounded-xl border border-emerald-100/30 inline-block transition-all shadow-xs">
                                        {storeSettings.storeName || 'انبار مرکزی'}
                                      </span>
                                   </div>
                                ) : (
                                  <span className="font-mono font-black text-sm text-indigo-950 bg-indigo-50/50 hover:bg-indigo-100/50 px-2.5 py-1.5 rounded-xl border border-indigo-100/30 inline-block transition-all shadow-xs" dir="ltr">
                                    {formatCurrency(inv.totalAmount || 0)} <span className="text-[10px] text-indigo-600 font-extrabold mr-1">{inv.currency || storeSettings.currency}</span>
                                  </span>
                                )}
                               </td>`;
content = content.replace(targetBody, newBody);

// Patch print button
const targetButton = `<button onClick={() => { setViewingInvoice(inv); }} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg cursor-pointer bg-transparent border-none" title="مشاهده نهایی">
                                   <Eye className="w-4 h-4"/>
                                 </button>`;
const newButton = `<button onClick={() => { setViewingInvoice(inv); }} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg cursor-pointer bg-transparent border-none" title="مشاهده نهایی">
                                   <Eye className="w-4 h-4"/>
                                 </button>
                                 {activeTab.includes('warehouse') && (
                                   <button onClick={() => { setViewingInvoice(inv); setTimeout(() => window.print(), 100); }} className="p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg cursor-pointer bg-transparent border-none" title="چاپ مستقیم">
                                     <Printer className="w-4 h-4"/>
                                   </button>
                                 )}`;
content = content.replace(targetButton, newButton);

fs.writeFileSync('src/App.tsx', content);
console.log('patched warehouse list details');
