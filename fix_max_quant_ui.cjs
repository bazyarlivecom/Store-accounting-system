const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tSearch = `<CurrencyInput value={item.quantity} onChange={(e: any) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-center font-bold" />
                                  </div>
                              </td>`;

const tRep = `<CurrencyInput value={item.quantity} onChange={(e: any) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-center font-bold" />
                                    {activeTab === 'create_warehouse_receipt' && typeof item.maxQuantity !== 'undefined' && (
                                       <span className="text-[10px] text-gray-500 text-center font-bold mt-1">
                                          قابل رسید: {item.maxQuantity}
                                       </span>
                                    )}
                                  </div>
                              </td>`;
code = code.replace(tSearch, tRep);

fs.writeFileSync('src/App.tsx', code);
console.log('done max quant ui');
