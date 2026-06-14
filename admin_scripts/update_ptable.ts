import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldTable = `<table className="w-full text-right whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="text-sm font-medium text-gray-500 border-b border-gray-100 bg-gray-50/30">
                    <th className="py-4 px-6 text-right">ردیف</th>
                    <th className="py-4 px-6 text-right">نام کالا / خدمات</th>
                    <th className="py-4 px-6 text-right">نوع</th>
                    <th className="py-4 px-6 text-right">گروه‌بندی</th>
                    <th className="py-4 px-6 text-right">قیمت پایه (تومان)</th>
                    <th className="py-4 px-6 w-24">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p, index) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-500 w-16 text-center">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 border-r-2 border-transparent hover:border-indigo-500">
                        {p.name}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        <span className={\`px-2 py-1 rounded inline-flex items-center gap-1.5 \${p.type === 'service' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}\`}>
                          {p.type === 'service' ? 'خدمات' : 'کالا'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {p.category}
                      </td>
                      <td className="py-4 px-6 text-indigo-600 font-medium">
                        {formatCurrency(p.price)} <span className="text-xs font-normal mr-1">{storeSettings.currency}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                            title="ویرایش کالا"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="حذف کالا"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>`;

const newTable = `<table className="w-full text-right min-w-[1000px]">
                <thead>
                  <tr className="text-xs font-bold text-gray-500 border-b border-gray-100 bg-gray-50/50 uppercase tracking-wider">
                    <th className="py-4 px-6 text-center w-16">ردیف</th>
                    <th className="py-4 px-6 text-right">عنوان کالا / خدمات</th>
                    <th className="py-4 px-6 text-right">کد / بارکد</th>
                    <th className="py-4 px-6 text-center">موجودی</th>
                    <th className="py-4 px-6 text-right">قیمت خرید</th>
                    <th className="py-4 px-6 text-right">قیمت فروش</th>
                    <th className="py-4 px-6 text-center w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {products.map((p, index) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 text-gray-400 font-sans text-center">
                        <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto text-[10px] font-bold shadow-sm">
                           {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-extrabold text-gray-800">{p.name}</span>
                          <div className="flex items-center gap-2">
                             <span className={\`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center \${p.type === 'service' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}\`}>
                               {p.type === 'service' ? 'خدمات' : 'کالا'}
                             </span>
                             {p.category && (
                               <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                 {p.category}
                               </span>
                             )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-500">
                        {p.code ? <div className="mb-0.5"><span className="text-gray-400 ml-1">کد:</span>{p.code}</div> : null}
                        {p.barcode ? <div><span className="text-gray-400 ml-1">بارکد:</span>{p.barcode}</div> : null}
                        {!p.code && !p.barcode && '---'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {p.type === 'service' ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-sans font-bold text-gray-700 text-base">{p.stock || 0}</span>
                            {p.unit && <span className="text-[10px] text-gray-500">{p.unit}</span>}
                            {(p.stock || 0) <= (p.minStock || 0) && (p.minStock || 0) > 0 && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-100 mt-1">نیاز به شارژ</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-sans font-bold text-gray-600">
                        {p.purchasePrice ? formatNumber(p.purchasePrice) : '---'}
                      </td>
                      <td className="py-4 px-6 font-sans font-black text-indigo-600 text-base">
                        {formatNumber(p.price)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-100">
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all inline-block"
                            title="ویرایش کالا"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all inline-block"
                            title="حذف کالا"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>`;

content = content.replace(oldTable, newTable);
fs.writeFileSync('src/App.tsx', content);
