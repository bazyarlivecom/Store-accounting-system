const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. imports
content = content.replace("from 'lucide-react'", "Activity, Clock } from 'lucide-react'");

// 2. Add state
const stateStr = `  const [historyProductId, setHistoryProductId] = useState<string | null>(null);`;
content = content.replace("const [confirmState", stateStr + "\n  const [confirmState");

// 3. Add History modal rendering logic
const modalStr = `
      {/* Product Price History Modal */}
      {historyProductId && (
        <div className="fixed inset-0 bg-slate-900/60 z-[99998] flex items-center justify-center p-4 backdrop-blur-sm shadow-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100"
            dir="rtl"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-indigo-50/80 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">سابقه قیمتی کالا</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                    {products.find(p => p.id.toString() === historyProductId.toString())?.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setHistoryProductId(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              {(() => {
                const hProduct = products.find(p => p.id.toString() === historyProductId.toString());
                if (!hProduct) return null;

                // Extract all valid occurrences from invoices
                const historyInvoices = invoices.filter(inv => inv.items && inv.items.some(i => i.productId?.toString() === historyProductId.toString()));
                
                // Construct a flat list of entries
                const entries = [];
                historyInvoices.forEach(inv => {
                   const item = inv.items.find(i => i.productId?.toString() === historyProductId.toString());
                   if (item) {
                       entries.push({
                           date: typeof inv.date === 'string' ? new Date(inv.date) : inv.date,
                           type: inv.type, // 'sale' | 'purchase'
                           invoiceNumber: inv.invoiceNumber,
                           customerName: persons.find(p => String(p.id) === String(inv.customerId))?.name || 'مشتری نقدی',
                           unitPrice: item.unitPrice,
                           quantity: item.quantity,
                           discountPercent: item.discountPercent
                       });
                   }
                });

                // Sort by date DESC
                entries.sort((a, b) => b.date.getTime() - a.date.getTime());

                return entries.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                          <th className="py-4 px-6 font-bold whitespace-nowrap">تاریخ</th>
                          <th className="py-4 px-6 font-bold whitespace-nowrap">شماره فاکتور</th>
                          <th className="py-4 px-6 font-bold whitespace-nowrap">نوع تراکنش</th>
                          <th className="py-4 px-6 font-bold whitespace-nowrap">طرف حساب</th>
                          <th className="py-4 px-6 font-bold whitespace-nowrap text-center">تعداد</th>
                          <th className="py-4 px-6 font-bold whitespace-nowrap">فی (تومان)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {entries.map((ent, idx) => (
                           <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-6 font-medium text-gray-800">
                                {new Intl.DateTimeFormat('fa-IR', {
                                  year: 'numeric', month: '2-digit', day: '2-digit',
                                  hour: '2-digit', minute: '2-digit'
                                }).format(ent.date)}
                              </td>
                              <td className="py-3 px-6 font-bold text-gray-700">#{ent.invoiceNumber}</td>
                              <td className="py-3 px-6">
                                <span className={\`px-2.5 py-1 rounded-md text-xs font-extrabold inline-flex items-center gap-1.5 \${ent.type === 'sale' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}\`}>
                                   {ent.type === 'sale' ? <ArrowUpFromLine className="w-3 h-3"/> : <ArrowDownToLine className="w-3 h-3"/>}
                                   {ent.type === 'sale' ? 'فروش' : 'خرید'}
                                </span>
                              </td>
                              <td className="py-3 px-6 font-bold text-gray-800">{ent.customerName}</td>
                              <td className="py-3 px-6 font-mono text-center text-gray-600">{formatNumber(ent.quantity)}</td>
                              <td className="py-3 px-6 font-mono font-extrabold text-indigo-600">{formatCurrency(ent.unitPrice)}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Clock className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="font-bold text-gray-500">هیچ سابقه خریدی یا فروشی برای این کالا ثبت نشده است.</p>
                  </div>
                );
              })()}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button onClick={() => setHistoryProductId(null)} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 shadow-sm">بستن</button>
            </div>
          </motion.div>
        </div>
      )}
`;

content = content.replace("{/* Modals */}", "{/* Modals */}\n      " + modalStr);

// 4. Add the button to products list action cell
// Search for <Edit2 className="w-4 h-4" /> which is inside className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all inline-block"
const newBtn = `
                          <button
                            onClick={() => setHistoryProductId(p.id.toString())}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all inline-block"
                            title="سابقه قیمت‌ها"
                          >
                            <Activity className="w-4 h-4" />
                          </button>
`;

content = content.replace(/(<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?setEditingProductId\(p\.id\)[\s\S]*?\}[\s\S]*?<\/button>)/, newBtn + "$1");

fs.writeFileSync('src/App.tsx', content);
console.log('DONE');
