import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Package, TrendingUp, TrendingDown, History } from 'lucide-react';
import { Product, InvoiceItem } from '../types';
import { getInvoices } from '../lib/dataService';

export default function ProductCardModal({ product, currency = 'تومان', onClose }: { product: Product, currency?: string, onClose: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
       const invs = await getInvoices();
       const prodHistory: any[] = [];
       invs.forEach(inv => {
          if (inv.items) {
             const items = inv.items.filter((i: any) => i.productId?.toString() === product.id?.toString());
             items.forEach((item: any) => {
                prodHistory.push({
                   type: inv.type, // 'sale' | 'purchase'
                   date: inv.jalaliDate || (new Date(inv.createdAt).toLocaleDateString('fa-IR')),
                   invoiceNumber: inv.invoiceNumber,
                   quantity: item.quantity,
                   unitPrice: item.unitPrice,
                   personName: inv.personName
                });
             });
          }
       });
       setHistory(prodHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
       setLoading(false);
    };
    fetchHistory();
  }, [product.id]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
         
         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
               <Package className="w-5 h-5 text-indigo-500" />
               کارت کالا: {product.name}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors">
               <X className="w-5 h-5" />
            </button>
         </div>

         <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                 <span className="text-xs text-indigo-600 font-bold block mb-1">کد کالا</span>
                 <span className="text-lg font-mono font-black text-gray-800">{product.code || '---'}</span>
               </div>
               <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                 <span className="text-xs text-emerald-600 font-bold block mb-1">قیمت فروش فعلی</span>
                 <span className="text-lg font-sans font-black text-gray-800">{Number(product.price).toLocaleString()} <span className="text-xs font-normal">{currency}</span></span>
               </div>
               <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                 <span className="text-xs text-rose-600 font-bold block mb-1">قیمت خرید فعلی</span>
                 <span className="text-lg font-sans font-black text-gray-800">{Number(product.purchasePrice || 0).toLocaleString()} <span className="text-xs font-normal">{currency}</span></span>
               </div>
               <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                 <span className="text-xs text-amber-600 font-bold block mb-1">موجودی مستند</span>
                 <span className="text-lg font-sans font-black text-gray-800">
                    {product.stock || 0} <span className="text-xs font-normal">{product.unit || 'عدد'}</span>
                 </span>
                 {product.secondaryUnit && product.unitRatio && (product.stock || 0) >= product.unitRatio && (
                   <div className="text-[10px] text-amber-700 mt-1 font-bold">
                     معادل {Math.floor((product.stock || 0) / product.unitRatio)} {product.secondaryUnit} و {(product.stock || 0) % product.unitRatio} {product.unit}
                   </div>
                 )}
               </div>
            </div>

            <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
               <History className="w-5 h-5 text-gray-400" /> سوابق قیمتی و گردش کالا (فروش / خرید)
            </h4>
            
            {loading ? (
               <div className="text-center py-10 text-gray-400 font-bold animate-pulse">در حال استخراج سوابق ...</div>
            ) : history.length === 0 ? (
               <div className="text-center py-10 text-gray-400">تا کنون گردشی برای این کالا ثبت نشده است.</div>
            ) : (
               <div className="overflow-x-auto border border-gray-100 rounded-xl">
                 <table className="w-full text-right text-sm">
                   <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                     <tr>
                       <th className="px-4 py-3 font-semibold text-xs">نوع تراکنش</th>
                       <th className="px-4 py-3 font-semibold text-xs">تاریخ</th>
                       <th className="px-4 py-3 font-semibold text-xs">شخص / مشتری</th>
                       <th className="px-4 py-3 font-semibold text-xs">تعداد / مقدار</th>
                       <th className="px-4 py-3 font-semibold text-xs">فی ({currency})</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {history.map((h, i) => (
                       <tr key={i} className="hover:bg-gray-50">
                         <td className="px-4 py-3 font-bold">
                            {h.type === 'sale' ? (
                               <span className="text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> فروش</span>
                            ) : (
                               <span className="text-rose-600 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> خرید</span>
                            )}
                         </td>
                         <td className="px-4 py-3 text-gray-500 text-xs">{h.date}</td>
                         <td className="px-4 py-3 font-bold text-gray-800 text-xs">{h.personName || 'نامشخص'}</td>
                         <td className="px-4 py-3 font-bold font-mono">{h.quantity}</td>
                         <td className="px-4 py-3 font-black text-indigo-700">{Number(h.unitPrice).toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            )}
         </div>
         
         <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors">بستن کارت کالا</button>
         </div>

      </motion.div>
    </div>
  );
}
