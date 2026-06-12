import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. In getInvoicePrefix
code = code.replace(
  /if \(activeTab === 'create_sale' \|\| invoiceType === 'sale'\) return storeSettings\.prefix_sale \|\| 'INV-';/g,
  "if (invoiceType === 'proforma') return storeSettings.prefix_proforma || 'PF-';\n    if (activeTab === 'create_sale' || invoiceType === 'sale') return storeSettings.prefix_sale || 'INV-';"
);

// 2. Add InvoiceType proforma to state signature
code = code.replace(
  /const \[invoiceType, setInvoiceType\] = useState<'sale' \| 'purchase' \| 'warehouse_receipt' \| 'warehouse_remittance'>\('sale'\);/g,
  "const [invoiceType, setInvoiceType] = useState<'sale' | 'purchase' | 'warehouse_receipt' | 'warehouse_remittance' | 'proforma'>('sale');"
);

// 3. Dropdown for selecting 'proforma' in the header
const headerText = `<h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="bg-indigo-100/50 p-2.5 rounded-xl text-indigo-600">
                     <ShoppingCart className="w-6 h-6" />
                  </span>
                  {invoiceTitle}
                </h2>`;

const selectDropdown = `<div className="flex justify-between items-center mb-8 gap-4 border-b border-indigo-100 pb-5">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <span className="bg-indigo-100/50 p-2.5 rounded-xl text-indigo-600">
                       <ShoppingCart className="w-6 h-6" />
                    </span>
                    {invoiceTitle}
                  </h2>
                  
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-gray-500">نوع فاکتور:</span>
                     <select 
                       value={invoiceType}
                       onChange={(e) => {
                          setInvoiceType(e.target.value as any);
                          if (e.target.value === 'proforma') {
                             setInvoiceTitle('پیش‌فاکتور (بدون کسر موجودی)');
                          } else {
                             setInvoiceTitle('فاکتور فروش کالا');
                          }
                       }}
                       className="p-2 border border-gray-200 rounded-lg text-sm font-bold bg-white text-indigo-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                     >
                       <option value="sale">فاکتور فروش (استاندارد)</option>
                       <option value="proforma">صدور پیش‌فاکتور</option>
                     </select>
                  </div>
                </div>`;
                
code = code.replace(headerText, selectDropdown);

// 4. list_sale includes proforma and has visual indicator
code = code.replace(
  /activeTab === 'list_sale' \? i\.type === 'sale' :/g,
  "activeTab === 'list_sale' ? (i.type === 'sale' || i.type === 'proforma') :"
);

code = code.replace(
  /invoices\.filter\(i => activeTab === 'list_sale' \? i\.type === 'sale' : i\.type === 'purchase'\)\.length/g,
  "invoices.filter(i => activeTab === 'list_sale' ? (i.type === 'sale' || i.type === 'proforma') : i.type === 'purchase').length"
);

// 5. Viewing invoice: show "پیش‌فاکتور" if it's proforma. Wait, we already have formatting function!
// Let's find getInvoiceTypeName if it exists or define one inline.
// We can just find 'فاکتور فروش کالا' strings or format currency label
// Find "نوع: "
code = code.replace(
  /<strong>نوع:<\/strong> \{previewInvoiceData\.type === 'sale' \? 'فاکتور فروش کالا'/g,
  "<strong>نوع:</strong> {previewInvoiceData.type === 'proforma' ? 'پیش‌فاکتور' : previewInvoiceData.type === 'sale' ? 'فاکتور فروش کالا'"
);

code = code.replace(
  /<strong>نوع:<\/strong> \{viewingInvoice\.type === 'sale' \? 'فاکتور فروش'/g,
  "<strong>نوع:</strong> {viewingInvoice.type === 'proforma' ? 'پیش‌فاکتور' : viewingInvoice.type === 'sale' ? 'فاکتور فروش'"
);

// Add proforma to condition in financial ledger if any
code = code.replace(
  /inv\.type === 'purchase' \? 'خرید طی فاکتور' : 'فروش طی فاکتور'/g,
  "inv.type === 'proforma' ? 'ثبت پیش‌فاکتور' : (inv.type === 'purchase' ? 'خرید طی فاکتور' : 'فروش طی فاکتور')"
);

code = code.replace(
  /inv\.type === 'purchase' \? 'فاکتور خرید کالا' : 'فاکتور فروش کالا'/g,
  "inv.type === 'proforma' ? 'پیش‌فاکتور' : (inv.type === 'purchase' ? 'فاکتور خرید کالا' : 'فاکتور فروش کالا')"
);

// Update isSale inside ledger to ignore 'proforma' for debit/credit
// Wait! isSale is computed in Ledger map:
code = code.replace(
  /const isSale = inv\.type !== 'purchase';\s+const amount/g,
  "const isSale = inv.type === 'sale';\n                  const isProforma = inv.type === 'proforma';\n                  const amount"
);

code = code.replace(
  /debit: isSale \? amount : 0,/g,
  "debit: (isSale && !isProforma) ? amount : 0,"
);
code = code.replace(
  /credit: isSale \? 0 : amount,/g,
  "credit: (!isSale && !isProforma) ? amount : 0,"
);

// Display badge in list_sale
const trRegex = /<td className="py-4 px-6 text-center">\s*<div className="flex items-center justify-center gap-3">/g;
const statusBadge = `<td className="py-4 px-6 text-center">
                              {inv.type === 'proforma' ? (
                                <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold border border-violet-200">پیش‌فاکتور</span>
                              ) : (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">نهایی و قطعی</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-3">`;

code = code.replace(trRegex, statusBadge);

// We need to add table header for it
// <th className="p-4 font-bold border-r border-gray-100 text-center w-36">نوع/وضعیت</th>
code = code.replace(
  /<th className="p-4 font-bold border-r border-gray-100 text-center w-32">عملیات<\/th>/g,
  `<th className="p-4 font-bold border-r border-gray-100 text-center w-36">وضعیت سند</th>\n                              <th className="p-4 font-bold border-r border-gray-100 text-center w-32">عملیات</th>`
);

// Convert invoice inside list_sale
// We can add a button in operations: "تبدیل به فروش قطعی" if it's proforma
const opsStart = `<div className="flex items-center justify-center gap-3">`;
const opsWithProformaConvert = `<div className="flex items-center justify-center gap-3">
                                {inv.type === 'proforma' && (
                                   <button 
                                      onClick={() => confirmAction('آیا از صدور قطعی این پیش‌فاکتور اطمینان دارید؟', async () => {
                                         const clone = {...inv, type: 'sale'};
                                         await updateInvoice(inv.id, clone);
                                         await fetchInvoices();
                                      })}
                                      className="p-2 text-violet-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                                      title="تبدیل پیش‌فاکتور به فاکتور فروش قطعی"
                                   >
                                      <CheckCircle className="w-4 h-4" />
                                   </button>
                                )}
`;
code = code.replace(opsStart, opsWithProformaConvert);


fs.writeFileSync('src/App.tsx', code);
