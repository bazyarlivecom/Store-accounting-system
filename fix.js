const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStrPrefix = '                                      <div className="flex items-center gap-1.5 justify-s';
const targetStrSuffix = "case 'create_pay_receipt': {erId?.toString())?.name)}</td>";

const start = code.indexOf(targetStrPrefix);
const end = code.indexOf(targetStrSuffix);

if (start !== -1 && end !== -1) {
    const replacement = `                                      <div className="flex items-center gap-1.5 justify-start text-xs font-bold text-slate-650" dir="rtl">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="font-sans font-black text-xs text-slate-700">{toPersianDigits(inv.jalaliDate)}</span>
                                      </div>
                                    </td>
                                   {activeTab.includes('warehouse') ? (
                                     <td className="p-4 font-bold text-indigo-900 text-center">
                                         {warehouses.find(w => w.id?.toString() === inv.warehouseId?.toString())?.name || 'نامشخص'}
                                     </td>
                                   ) : (
                                     <td className="p-4 text-left">
                                        <span className="font-sans font-black text-sm text-indigo-950 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100/30 inline-block transition-all shadow-2xs">
                                          {toPersianDigits(formatCurrency(inv.totalAmount || 0))} <span className="text-[10px] text-indigo-605 font-extrabold mr-1">{inv.currency || storeSettings.currency}</span>
                                        </span>
                                      </td>
                                   )}
                                   {(activeTab === 'list_purchase' || activeTab === 'list_sale') && (
                                     <>
                                       <td className="p-4 text-left">
                                        <span className="font-sans font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 flex items-center gap-1 w-max ml-0 mr-auto rounded-lg">
                                          {toPersianDigits(formatCurrency(inv.paidAmount || 0))} <span className="text-[9px] text-emerald-700">{inv.currency || storeSettings.currency}</span>
                                        </span>
                                       </td>
                                       <td className="p-4 text-left">
                                        <span className="font-sans font-extrabold text-xs text-rose-700 bg-rose-50 px-2.5 py-1.5 flex items-center gap-1 w-max ml-0 mr-auto rounded-lg">
                                          {toPersianDigits(formatCurrency(Math.max((inv.totalAmount || 0) - (inv.paidAmount || 0), 0)))} <span className="text-[9px] text-rose-705">{inv.currency || storeSettings.currency}</span>
                                        </span>
                                       </td>
                                       <td className="p-4 text-center">
                                           {inv.paymentStatus === 'paid' ? <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 font-bold rounded">تسویه کامل</span> :
                                            inv.paymentStatus === 'partial' ? <span className="bg-amber-100 text-amber-800 text-[10px] px-2 font-bold py-1 rounded">علی‌الحساب</span> :
                                            <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-1 font-bold rounded">پرداخت نشده</span>}
                                       </td>
                                       <td className="p-4 text-xs font-bold text-center">
                                           {activeTab === 'list_purchase' ? (
                                              invoices.some(i => i.type === 'warehouse_receipt' && i.sourceInvoiceId?.toString() === inv.id.toString()) ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">رسید شده</span> : <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100">در انتظار رسید</span>
                                           ) : (
                                              invoices.some(i => i.type === 'warehouse_remittance' && i.sourceInvoiceId?.toString() === inv.id.toString()) ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">حواله شده</span> : <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100">در انتظار حواله</span>
                                           )}
                                       </td>
                                     </>
                                   )}
                                   <td className="p-4 text-center flex items-center justify-center gap-2">
                                      {activeTab === 'list_purchase' && (
                                         <button onClick={() => {
                                            const newWizardItems = inv.items.filter((it) => {
                                               const prod = products.find(p => p.id === it.productId);
                                               return prod && prod.type !== 'service';
                                            }).map((it) => {
                                               const prod = products.find(p => p.id === it.productId);
                                               return {
                                                 productId: it.productId,
                                                 productName: it.productName,
                                                 purchasePrice: Number(it.unitPrice) || 0,
                                                 marginPercent: 0,
                                                 salePrice: prod ? Number(prod.price) : 0,
                                               };
                                            });
                                            if (newWizardItems.length > 0) {
                                               setPricingWizardItems(newWizardItems);
                                               setPricingWizardInvoice(inv);
                                            } else {
                                               setSuccessMsg('هیچ کالای قابل قیمت‌گذاری در این فاکتور وجود ندارد (یا همه خدمات هستند).');
                                            }
                                         }} className="p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg cursor-pointer bg-transparent border-none" title="ثبت و چاپ قیمت فروش">
                                           <Tag className="w-4 h-4" />
                                         </button>
                                      )}
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
                             </React.Fragment>
                           ))}
                          {filteredInvoicesList.length === 0 && (
                           <tr>
                             <td colSpan={10} className="p-8 text-center text-gray-400">هیچ سندی یافت نشد.</td>
                           </tr>
                         )}
                        </tbody>
                      </table>
                    </div>
                </div>
             </motion.div>
           );
         }
         
         case 'create_receive_receipt':
         case 'create_pay_receipt': {`;

    const fixedCode = code.slice(0, start) + replacement + code.slice(end + targetStrSuffix.length);
    fs.writeFileSync('src/App.tsx', fixedCode);
    console.log('Fixed file successfully using string replacement.');
} else {
    console.log('Markers not found');
    console.log('Start marker found: ', start !== -1);
    console.log('End marker found: ', end !== -1);
}
