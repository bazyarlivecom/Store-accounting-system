const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                    <div className="flex-1 w-full relative z-10 max-w-2xl">
                      <SearchableSelect 
                        options={products.map(p => ({
                          value: p.id,
                          label: p.name,
                          subLabel: \`موجودی: \${p.stock || 0} \${p.unit || ''}\${p.barcode || p.code ? ' | ' : ''}\${p.barcode ? \`بارکد: \${p.barcode}\` : (p.code ? \`کد: \${p.code}\` : '')}\`,
                          badge: p.type === 'service' ? 'خدمات' : 'کالا'
                        }))}
                        value=""
                        onChange={(val) => handleFastAddProduct(String(val))}
                        placeholder="🔎 جستجو و افزودن سریع کالا به لیست (نام، کد، بارکد)..."
                        searchPlaceholder="جستجوی کالا..."
                      />
                    </div>
                    <button onClick={handleAddItem} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 shadow-sm rounded-xl font-bold hover:bg-gray-100 flex items-center gap-2 transition-colors whitespace-nowrap">
                      <Plus className="w-4 h-4" /> سطر دلخواه
                    </button>
                </div>`;

const replacementStr = `                    {(!activeTab.includes('warehouse')) && (
                      <div className="flex-1 w-full flex gap-2">
                        <div className="flex-1 w-full relative z-10 max-w-2xl">
                          <SearchableSelect 
                            options={products.map(p => ({
                              value: p.id,
                              label: p.name,
                              subLabel: \`موجودی: \${p.stock || 0} \${p.unit || ''}\${p.barcode || p.code ? ' | ' : ''}\${p.barcode ? \`بارکد: \${p.barcode}\` : (p.code ? \`کد: \${p.code}\` : '')}\`,
                              badge: p.type === 'service' ? 'خدمات' : 'کالا'
                            }))}
                            value=""
                            onChange={(val) => handleFastAddProduct(String(val))}
                            placeholder="🔎 جستجو و افزودن سریع کالا به لیست (نام، کد، بارکد)..."
                            searchPlaceholder="جستجوی کالا..."
                          />
                        </div>
                        <button onClick={handleAddItem} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 shadow-sm rounded-xl font-bold hover:bg-gray-100 flex items-center gap-2 transition-colors whitespace-nowrap">
                          <Plus className="w-4 h-4" /> سطر دلخواه
                        </button>
                      </div>
                    )}
                </div>`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/App.tsx', code);
console.log('done product search hidden for warehouse');
