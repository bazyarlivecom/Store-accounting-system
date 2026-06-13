import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Package, TrendingUp, TrendingDown, History, BarChart2 } from 'lucide-react';
import { Product, InvoiceItem, Warehouse } from '../types';
import { getInvoices } from '../lib/dataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ProductCardModal({ product, warehouses = [], currency = 'تومان', onClose, isModal = true }: { product: Product, warehouses?: Warehouse[], currency?: string, onClose: () => void, isModal?: boolean }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatedStock, setCalculatedStock] = useState<number>(0);
  const [stockPerWarehouse, setStockPerWarehouse] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<'info' | 'financial' | 'warehouse' | 'price_chart'>('info');

  useEffect(() => {
    const fetchHistory = async () => {
       const invs = await getInvoices();
       const prodHistory: any[] = [];
       let totalStock = product.stock ? Number(product.stock) : 0;
       const defaultWhId = product.warehouseId?.toString() || 'unknown';
       const whStock: { [key: string]: number } = {};
       
       if (totalStock > 0 || totalStock < 0) {
           whStock[defaultWhId] = totalStock;
       }

       invs.forEach(inv => {
          if (inv.items) {
             const items = inv.items.filter((i: any) => i.productId?.toString() === product.id?.toString());
             items.forEach((item: any) => {
                prodHistory.push({
                   type: inv.type, // 'sale' | 'purchase' | 'warehouse_receipt' | 'warehouse_remittance'
                   date: inv.jalaliDate || (new Date(inv.createdAt).toLocaleDateString('fa-IR')),
                   invoiceNumber: inv.invoiceNumber,
                   quantity: item.quantity,
                   isSecondaryUnit: item.isSecondaryUnit,
                   unitPrice: (item.isSecondaryUnit && product.unitRatio && product.unitRatio > 0) ? Number((Number(item.unitPrice) / product.unitRatio).toFixed(4)) : item.unitPrice,
                   personName: inv.personName,
                   warehouseId: item.warehouseId || inv.warehouseId
                });

                let qty = Number(item.quantity) || 0;
                if (item.isSecondaryUnit && product.unitRatio) {
                   qty = qty * product.unitRatio;
                }
                
                const whId = (item.warehouseId || inv.warehouseId || product.warehouseId)?.toString() || 'unknown';

                if (!whStock[whId]) whStock[whId] = 0;

                if (inv.type === 'warehouse_receipt') {
                   totalStock += qty;
                   whStock[whId] += qty;
                } else if (inv.type === 'warehouse_remittance') {
                   totalStock -= qty;
                   whStock[whId] -= qty;
                }
             });
          }
       });
       setCalculatedStock(totalStock);
       setStockPerWarehouse(whStock);
       setHistory(prodHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
       setLoading(false);
    };
    fetchHistory();
  }, [product.id, product.warehouseId]);

  const recentPriceChanges = useMemo(() => {
    const changes: any[] = [];
    const financialHistory = history.filter(h => h.type === 'sale' || h.type === 'purchase');
    for (const h of financialHistory) {
       const price = Number(h.unitPrice);
       if (changes.length === 0 || Number(changes[changes.length - 1].unitPrice) !== price) {
          changes.push(h);
       }
       if (changes.length >= 3) break;
    }
    return changes;
  }, [history]);

  const content = (
      <motion.div initial={isModal ? { opacity: 0, scale: 0.95 } : { opacity: 0 }} animate={isModal ? { opacity: 1, scale: 1 } : { opacity: 1 }} exit={isModal ? { opacity: 0, scale: 0.95 } : undefined} className={`bg-white rounded-2xl w-full ${isModal ? 'max-w-4xl max-h-[90vh]' : 'h-full min-h-[500px] border border-gray-100'} overflow-hidden shadow-2xl flex flex-col`}>
         
         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
               <Package className="w-5 h-5 text-indigo-500" />
               کارت کالا: {product.name}
            </h3>
            {isModal ? (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={onClose} className="text-gray-600 font-bold hover:bg-gray-200 bg-gray-100 px-4 py-2 text-sm rounded-xl transition-colors">
                 تغییر کالا
              </button>
            )}
         </div>

         <div className="border-b border-gray-100 px-6 pt-4 flex gap-6 bg-white overflow-x-auto">
            <button
               onClick={() => setActiveTab('info')}
               className={`pb-3 font-bold text-sm whitespace-nowrap transition-colors relative ${activeTab === 'info' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               مشخصات و موجودی
               {activeTab === 'info' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setActiveTab('financial')}
               className={`pb-3 font-bold text-sm whitespace-nowrap transition-colors relative ${activeTab === 'financial' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               فاکتورهای خرید و فروش
               {activeTab === 'financial' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setActiveTab('warehouse')}
               className={`pb-3 font-bold text-sm whitespace-nowrap transition-colors relative ${activeTab === 'warehouse' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               گردش انبار (رسید و حواله)
               {activeTab === 'warehouse' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setActiveTab('price_chart')}
               className={`pb-3 font-bold text-sm whitespace-nowrap transition-colors relative ${activeTab === 'price_chart' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            >
               نمودار قیمت
               {activeTab === 'price_chart' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
         </div>

         <div className="p-6 overflow-y-auto flex-1 bg-white">
            {activeTab === 'info' && (
              <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex flex-col justify-center">
                     <span className="text-xs text-indigo-600 font-bold block mb-1">کد کالا</span>
                     <span className="text-lg font-mono font-black text-gray-800">{product.code || '---'}</span>
                   </div>
                   <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex flex-col justify-center">
                     <span className="text-xs text-emerald-600 font-bold block mb-1">قیمت فروش فعلی</span>
                     <span className="text-lg font-sans font-black text-gray-800">{Number(product.price).toLocaleString()} <span className="text-xs font-normal">{currency}</span></span>
                   </div>
                   <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl flex flex-col justify-center">
                     <span className="text-xs text-rose-600 font-bold block mb-1">قیمت خرید فعلی</span>
                     <span className="text-lg font-sans font-black text-gray-800">{Number(product.purchasePrice || 0).toLocaleString()} <span className="text-xs font-normal">{currency}</span></span>
                   </div>
                   <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex flex-col justify-center relative overflow-hidden">
                     <span className="text-xs text-amber-600 font-bold block mb-1 z-10 relative">موجودی مستند (محاسباتی)</span>
                     <span className="text-xl font-sans font-black text-gray-800 z-10 relative" dir="ltr">
                        <span className="text-xs font-normal ml-1">{product.unit || 'عدد'}</span> {loading ? '...' : calculatedStock}
                     </span>
                     {product.secondaryUnit && product.unitRatio && !loading && calculatedStock >= product.unitRatio && (
                       <div className="text-[10px] text-amber-700 mt-1 font-bold z-10 relative">
                         معادل {Math.floor(calculatedStock / product.unitRatio)} {product.secondaryUnit} و {calculatedStock % product.unitRatio} {product.unit}
                       </div>
                     )}
                     <Package className="w-16 h-16 text-amber-500/10 absolute -left-4 -bottom-4 z-0 rotate-12" />
                   </div>
                </div>

                {!loading && Object.keys(stockPerWarehouse).length > 0 && (
                   <div className="mb-8 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                     <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-slate-400" /> موجودی به تفکیک انبارها:</span>
                     <div className="flex flex-wrap gap-2">
                       {Object.entries(stockPerWarehouse).map(([wId, qty]) => {
                          const wName = warehouses?.find(w => String(w.id) === wId)?.name || (wId === 'unknown' ? 'انبار پیش‌فرض / نامشخص' : 'انبار حذف شده');
                          return (
                             <div key={wId} className="bg-white border text-center border-slate-200 px-4 py-2 rounded-lg flex-1 min-w-[120px] shadow-sm">
                                <div className="text-[10px] text-slate-500 font-bold mb-1">{wName}</div>
                                <div className="font-mono font-black text-indigo-700" dir="ltr">{qty} <span className="text-[10px] font-normal font-sans text-gray-500">{product.unit || 'عدد'}</span></div>
                             </div>
                          )
                       })}
                     </div>
                   </div>
                )}

                 {!loading && recentPriceChanges.length > 0 && (
                   <div className="mb-0 bg-white border border-slate-200 p-4 rounded-xl shadow-sm mt-6">
                     <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                       <BarChart2 className="w-5 h-5 text-indigo-500" />
                       آخرین تغییرات قیمت (۳ تغییر اخیر)
                     </h4>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {recentPriceChanges.map((change, index) => (
                         <div key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                           <div className="flex items-center gap-3 relative z-10">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${change.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                 {change.type === 'sale' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              </div>
                              <div className="flex flex-col text-right">
                                 <span className="text-[10px] font-bold text-slate-500">{change.type === 'sale' ? 'فروش' : 'خرید'}</span>
                                 <span className="text-xs font-bold text-slate-700">{change.date}</span>
                              </div>
                           </div>
                           <div className="font-sans font-black text-indigo-700 text-left relative z-10" dir="ltr">
                              {Number(change.unitPrice).toLocaleString()} <span className="text-[9px] font-normal font-sans text-slate-500 block text-right mt-0.5">{currency}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </motion.div>
            )}

            {activeTab === 'financial' && (
              <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}>
                {loading ? (
                   <div className="text-center py-10 text-gray-400 font-bold animate-pulse">در حال استخراج سوابق ...</div>
                ) : history.filter(h => h.type === 'sale' || h.type === 'purchase').length === 0 ? (
                   <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">فاکتوری برای این کالا ثبت نشده است.</div>
                ) : (
                   <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                     <table className="w-full text-right text-sm">
                       <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                         <tr>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">نوع تراکنش</th>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">تاریخ</th>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">شماره سند</th>
                           <th className="px-4 py-3 font-semibold text-xs">شخص / مشتری</th>
                           <th className="px-4 py-3 font-semibold text-xs">واحد</th>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">مقدار</th>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">فی ({currency})</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50 bg-white">
                         {history.filter(h => h.type === 'sale' || h.type === 'purchase').map((h, i) => (
                           <tr key={i} className="hover:bg-gray-50 transition-colors">
                             <td className="px-4 py-3 font-bold whitespace-nowrap">
                                {h.type === 'sale' ? (
                                   <span className="text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> فروش</span>
                                ) : (
                                   <span className="text-rose-600 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> خرید</span>
                                )}
                             </td>
                             <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{h.date}</td>
                             <td className="px-4 py-3 text-gray-500 text-xs font-mono">{h.invoiceNumber || '---'}</td>
                             <td className="px-4 py-3 font-bold text-gray-800 text-xs truncate max-w-[150px]">{h.personName || '---'}</td>
                             <td className="px-4 py-3 text-xs font-medium text-gray-500">
                                {h.isSecondaryUnit ? product.secondaryUnit : product.unit}
                             </td>
                             <td className="px-4 py-3 font-bold font-mono">
                                <span className={h.type === 'sale' ? 'text-rose-600' : 'text-emerald-600'} dir="ltr">
                                   {h.type === 'sale' ? '-' : '+'}{h.quantity}
                                </span>
                             </td>
                             <td className="px-4 py-3 font-black text-indigo-700">{Number(h.unitPrice).toLocaleString()}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                )}
              </motion.div>
            )}

            {activeTab === 'warehouse' && (
              <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}>
                {loading ? (
                   <div className="text-center py-10 text-gray-400 font-bold animate-pulse">در حال استخراج سوابق ...</div>
                ) : history.filter(h => h.type === 'warehouse_receipt' || h.type === 'warehouse_remittance').length === 0 ? (
                   <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">تراکنش انباری برای این کالا ثبت نشده است.</div>
                ) : (
                   <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                     <table className="w-full text-right text-sm">
                       <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                         <tr>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">نوع تراکنش</th>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">تاریخ</th>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">شماره سند</th>
                           <th className="px-4 py-3 font-semibold text-xs">شخص / تامین‌کننده</th>
                           <th className="px-4 py-3 font-semibold text-xs">انبار</th>
                           <th className="px-4 py-3 font-semibold text-xs">واحد</th>
                           <th className="px-4 py-3 font-semibold text-xs whitespace-nowrap">مقدار</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50 bg-white">
                         {history.filter(h => h.type === 'warehouse_receipt' || h.type === 'warehouse_remittance').map((h, i) => (
                           <tr key={i} className="hover:bg-gray-50 transition-colors">
                             <td className="px-4 py-3 font-bold whitespace-nowrap">
                                {h.type === 'warehouse_receipt' ? (
                                   <span className="text-blue-600 flex items-center gap-1"><Package className="w-3 h-3" /> رسید انبار (ورود)</span>
                                ) : (
                                   <span className="text-orange-600 flex items-center gap-1"><Package className="w-3 h-3" /> حواله انبار (خروج)</span>
                                )}
                             </td>
                             <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{h.date}</td>
                             <td className="px-4 py-3 text-gray-500 text-xs font-mono">{h.invoiceNumber || '---'}</td>
                             <td className="px-4 py-3 font-bold text-gray-800 text-xs truncate max-w-[150px]">{h.personName || '---'}</td>
                             <td className="px-4 py-3 text-xs text-gray-600">
                                {warehouses?.find(w => String(w.id) === String(h.warehouseId))?.name || '---'}
                             </td>
                             <td className="px-4 py-3 text-xs font-medium text-gray-500">
                                {h.isSecondaryUnit ? product.secondaryUnit : product.unit}
                             </td>
                             <td className="px-4 py-3 font-bold font-mono">
                                <span className={h.type === 'warehouse_remittance' ? 'text-orange-600' : 'text-blue-600'} dir="ltr">
                                   {h.type === 'warehouse_remittance' ? '-' : '+'}{h.quantity}
                                </span>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                )}
              </motion.div>
            )}

            {activeTab === 'price_chart' && (
              <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="w-full h-[400px]">
                {loading ? (
                   <div className="text-center py-10 text-gray-400 font-bold animate-pulse">در حال استخراج سوابق ...</div>
                ) : history.filter(h => h.type === 'sale' || h.type === 'purchase').length === 0 ? (
                   <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">در حال حاضر سابقه‌ای برای تشکیل نمودار وجود ندارد.</div>
                ) : (
                   <div className="w-full h-full border border-gray-100 rounded-xl shadow-sm p-4 pt-8 bg-white" dir="ltr">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart
                         data={history.filter(h => h.type === 'sale' || h.type === 'purchase').reverse()}
                         margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                       >
                         <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                         <XAxis 
                           dataKey="date" 
                           stroke="#8884d8" 
                           fontSize={12}
                           tick={{fill: '#9CA3AF'}}
                           tickMargin={10}
                         />
                         <YAxis 
                           stroke="#8884d8" 
                           fontSize={12}
                           tickFormatter={(value) => new Intl.NumberFormat('fa-IR').format(value)}
                           tick={{fill: '#9CA3AF'}}
                           width={80}
                         />
                         <Tooltip 
                           formatter={(value: any, name: string) => [new Intl.NumberFormat('fa-IR').format(value) + ` ${currency}`, name === 'unitPrice' ? 'مبلغ واحد' : 'مبلغ']}
                           labelFormatter={(label) => `تاریخ: ${label}`}
                           contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'vazirmatn, system-ui, sans-serif' }}
                           itemStyle={{ textAlign: 'right' }}
                         />
                         <Legend wrapperStyle={{ paddingTop: '20px' }} />
                         <Line type="monotone" dataKey="unitPrice" name="مبلغ واحد" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                )}
              </motion.div>
            )}
         </div>
         
         {isModal && (
           <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors">بستن کارت کالا</button>
           </div>
         )}
      </motion.div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" dir="rtl">
        {content}
      </div>
    );
  }

  return <div dir="rtl">{content}</div>;
}
