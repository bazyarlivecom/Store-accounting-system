const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor1 = '<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">\n                   <div className="overflow-x-auto">\n                     <table className="w-full text-right min-w-[1000px]">';

const idxStart = code.lastIndexOf(anchor1);
if (idxStart !== -1) {
    const startOfCase = code.indexOf("case 'create_receive_receipt':", idxStart);
    if(startOfCase !== -1) {
        let newTable = `<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-right min-w-[1000px]">
                       <thead>
                         <tr className="bg-gray-50 text-sm text-gray-500 border-b border-gray-100">
                           <th className="p-4 font-bold">شماره</th>
                           {activeTab.includes('warehouse') && <th className="p-4 font-bold">نوع سند</th>}
                           <th className="p-4 font-bold">
                             {activeTab.includes('warehouse') ? 'تحویل دهنده / گیرنده' : 'مشتری'}
                           </th>
                           <th className="p-4 font-bold">تاریخ</th>
                           {activeTab.includes('warehouse') ? (
                              <th className="p-4 font-bold text-center">انبار مبدا/مقصد</th>
                            ) : (
                              <th className="p-4 font-bold">مبلغ نهایی</th>
                            )}
                           <th className="p-4 font-bold text-center">عملیات</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                         {invoices.filter(i => 
                           activeTab === 'list_sale' ? (i.type === 'sale' || i.type === 'proforma') : 
                           activeTab === 'list_purchase' ? i.type === 'purchase' :
                           activeTab === 'list_warehouse_docs' ? (
                               typeof listFilter !== 'undefined' && listFilter === 'receipt' ? i.type === 'warehouse_receipt' :
                               typeof listFilter !== 'undefined' && listFilter === 'remittance' ? i.type === 'warehouse_remittance' :
                               (i.type === 'warehouse_receipt' || i.type === 'warehouse_remittance')
                           ) : false
                         ).filter(inv => {
                            if (!invoiceSearchQuery) return true;
                            const term = invoiceSearchQuery.toLowerCase();
                            const pName = (persons.find(p => p.id.toString() === inv.customerId.toString())?.name || 'نامشخص').toLowerCase();
                            const invNum = (inv.invoiceNumber || '').toLowerCase();
                            return pName.includes(term) || invNum.includes(term);
                         }).map(inv => (
                           <tr key={inv.id} className="hover:bg-gray-50">
                             <td className="p-4 font-mono text-left font-bold text-gray-700 w-24" dir="ltr">#{inv.invoiceNumber}</td>
                             {activeTab.includes('warehouse') && (
                               <td className="p-4">
                                  {inv.type === 'warehouse_receipt' ? (
                                     <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">رسید ورود</span>
                                  ) : (
                                     <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">حواله خروج</span>
                                  )}
                               </td>
                             )}
                             <td className="p-4">{persons.find(p => p.id.toString() === inv.customerId.toString())?.name || 'نامشخص'}</td>
                             <td className="p-4">
                                <div className="flex items-center gap-1.5 justify-start text-xs font-bold text-slate-650" dir="rtl">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                  <span className="font-mono font-bold tracking-tight">{inv.jalaliDate}</span>
                                </div>
                              </td>
                             {activeTab.includes('warehouse') ? (
                               <td className="p-4 font-bold text-indigo-900 text-center">
                                   {warehouses.find(w => w.id?.toString() === inv.warehouseId?.toString())?.name || 'نامشخص'}
                               </td>
                             ) : (
                               <td className="p-4 text-left">
                                  <span className="font-mono font-black text-sm text-indigo-950 bg-indigo-50/50 hover:bg-indigo-100/50 px-2.5 py-1.5 rounded-xl border border-indigo-100/30 inline-block transition-all shadow-xs" dir="ltr">
                                    {formatCurrency(inv.totalAmount || 0)} <span className="text-[10px] text-indigo-600 font-extrabold mr-1">{inv.currency || storeSettings.currency}</span>
                                  </span>
                                </td>
                             )}
                             <td className="p-4 text-center flex items-center justify-center gap-2">
                                <button onClick={() => { setViewingInvoice(inv); }} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg cursor-pointer bg-transparent border-none" title="مشاهده نهایی">
                                  <Eye className="w-4 h-4"/>
                                </button>
                                <button onClick={() => handleEditInvoiceAction(inv)} className="p-2 text-gray-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg cursor-pointer bg-transparent border-none" title="ویرایش (بازگشت به پیش‌نویس)">
                                   <Edit2 className="w-4 h-4"/>
                                 </button>
                                <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg cursor-pointer bg-transparent border-none" title="حذف دائمی">
                                   <Trash2 className="w-4 h-4"/>
                                </button>
                             </td>
                           </tr>
                         ))}
                         {invoices.filter(i => 
                           activeTab === 'list_sale' ? (i.type === 'sale' || i.type === 'proforma') : 
                           activeTab === 'list_purchase' ? i.type === 'purchase' :
                           activeTab === 'list_warehouse_docs' ? (
                               typeof listFilter !== 'undefined' && listFilter === 'receipt' ? i.type === 'warehouse_receipt' :
                               typeof listFilter !== 'undefined' && listFilter === 'remittance' ? i.type === 'warehouse_remittance' :
                               (i.type === 'warehouse_receipt' || i.type === 'warehouse_remittance')
                           ) : false
                         ).filter(inv => {
                            if (!invoiceSearchQuery) return true;
                            const term = invoiceSearchQuery.toLowerCase();
                            const pName = (persons.find(p => p.id.toString() === inv.customerId.toString())?.name || 'نامشخص').toLowerCase();
                            const invNum = (inv.invoiceNumber || '').toLowerCase();
                            return pName.includes(term) || invNum.includes(term);
                         }).length === 0 && (
                           <tr>
                             <td colSpan={activeTab.includes('warehouse') ? 6 : 5} className="p-8 text-center text-gray-400">هیچ سندی یافت نشد.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                </div>
             </motion.div>
           );
        
        `;
        
        code = code.substring(0, idxStart) + newTable + code.substring(startOfCase);
    }
}

fs.writeFileSync('src/App.tsx', code);
