const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Filter source invoices by customerId if selected
code = code.replace(/invoices\.filter\(i => i\.type === 'purchase'\)\.map/g, "invoices.filter(i => i.type === 'purchase' && (!customerId || i.customerId === customerId)).map");

// Hide Currency selection for warehouse tabs
code = code.replace(/<div>\s*<label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><DollarSign className="w-4 h-4"\/> ارز و نرخ<\/label>/, 
`{(!activeTab.includes('warehouse')) && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><DollarSign className="w-4 h-4"/> ارز و نرخ</label>`);
code = code.replace(/<\/select>\s*<input type="number" disabled=\{invoiceCurrency === storeSettings\.currency\}([\s\S]*?)dir="ltr" \/>\s*<\/div>\s*<\/div>/, 
`</select>
                      <input type="number" disabled={invoiceCurrency === storeSettings.currency}$1dir="ltr" />
                    </div>
                  </div>
                )}`);

// Hide Financial columns in warehouse table header
code = code.replace(/<th className="p-4 font-bold w-48 border-r border-gray-100 text-left text-indigo-800">فی \(\{invoiceCurrency\}\)<\/th>/,
`{(!activeTab.includes('warehouse')) && (
                            <th className="p-4 font-bold w-48 border-r border-gray-100 text-left text-indigo-800">فی ({invoiceCurrency})</th>
                          )}`);
code = code.replace(/<th className="p-4 font-bold w-28 text-center border-r border-gray-100">تخفیف %<\/th>/,
`{(!activeTab.includes('warehouse')) && (
                            <th className="p-4 font-bold w-28 text-center border-r border-gray-100">تخفیف %</th>
                          )}`);
code = code.replace(/<th className="p-4 font-bold w-48 border-r border-gray-100 text-left text-indigo-800">مبلغ کل \(\{invoiceCurrency\}\)<\/th>/,
`{(!activeTab.includes('warehouse')) && (
                            <th className="p-4 font-bold w-48 border-r border-gray-100 text-left text-indigo-800">مبلغ کل ({invoiceCurrency})</th>
                          )}`);

// Hide Financial columns in warehouse table body
code = code.replace(/<td className="p-4">\s*<CurrencyInput\s+value=\{item\.unitPrice\}/,
`{(!activeTab.includes('warehouse')) && (
                              <td className="p-4">
                                  <CurrencyInput 
                                    value={item.unitPrice}`);

code = code.replace(/item\.quantity \* item\.unitPrice\)\s+< \s+item\.totalPrice\s+\?\s+'line-through opacity-50'\s+:\s+''\}\s*dir="ltr">\s*\{formatNumber\(item\.quantity \* item\.unitPrice\)\}\s*<\/div>\s*<\/div>\s*<\/td>/,
`item.quantity * item.unitPrice) < item.totalPrice ? 'line-through opacity-50' : ''} dir="ltr">
                                        {formatNumber(item.quantity * item.unitPrice)}
                                      </div>
                                  </div>
                              </td>
                              )}`);

// Hide total summary blocks for warehouse
code = code.replace(/<div className="absolute left-0 bottom-0 top-0 w-64 bg-gray-50 border-r border-gray-100 flex flex-col justify-center px-6">/g, 
`{(!activeTab.includes('warehouse')) && (
                      <div className="absolute left-0 bottom-0 top-0 w-64 bg-gray-50 border-r border-gray-100 flex flex-col justify-center px-6">`);

code = code.replace(/<div className="flex justify-between items-center text-sm font-bold truncate">\s*<span className="text-gray-500 truncate">جمع کل:<\/span>\s*<span className="font-black text-indigo-700 text-base truncate" dir="ltr">\s*\{formatCurrency\(calculateFinalTotal\(\)\)\}\s*<\/span>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g,
`<div className="flex justify-between items-center text-sm font-bold truncate">
                            <span className="text-gray-500 truncate">جمع کل:</span>
                            <span className="font-black text-indigo-700 text-base truncate" dir="ltr">
                               {formatCurrency(calculateFinalTotal())}
                            </span>
                          </div>
                      </div>
                      )}
                    </div>
                  </div>`);

code = code.replace(/<div className="mt-8 pt-6 border-t border-gray-100 flex flex-col lg:flex-row justify-between items-end gap-6 bg-gray-50 rounded-2xl p-6">/g,
`{(!activeTab.includes('warehouse')) && (
                  <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col lg:flex-row justify-between items-end gap-6 bg-gray-50 rounded-2xl p-6">`);

code = code.replace(/درصد تخفیف کل وارد شده نامعتبر است\.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g,
`درصد تخفیف کل وارد شده نامعتبر است.</p>
                      </div>
                    </div>
                  </div>
                </div>
                )}`);


fs.writeFileSync('src/App.tsx', code);
console.log("part 1");
