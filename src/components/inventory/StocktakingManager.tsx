import React, { useState, useEffect } from 'react';
import { Package, Plus, ClipboardList, PenTool, CheckCircle, Search, Save, AlertCircle, RefreshCcw, Handshake } from 'lucide-react';
import { getStocktakings, addStocktaking, updateStocktaking, deleteStocktaking, getProducts, getWarehouses, getWarehouseStocks } from '../../services/dataService';
import DatePickerModule, { Calendar as RMCalendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
const DatePicker = (DatePickerModule as any).default || DatePickerModule;
import { Stocktaking, StocktakingItem, Product, Warehouse, WarehouseStock } from '../../types';

interface Props {
  showNotification?: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  currentUser?: string;
  onNavigateToDocs?: () => void;
}

export default function StocktakingManager({ showNotification, currentUser = 'سیستم', onNavigateToDocs }: Props) {
  const [stocktakings, setStocktakings] = useState<Stocktaking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stocks, setStocks] = useState<WarehouseStock[]>([]);
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [currentId, setCurrentId] = useState<string | number>('');
  const [warehouseId, setWarehouseId] = useState<string | number>('');
  const [date, setDate] = useState(new Date().toLocaleDateString('fa-IR'));
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<StocktakingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sts, prods, whs, whStocks] = await Promise.all([
        getStocktakings(),
        getProducts(),
        getWarehouses(),
        getWarehouseStocks()
      ]);
      setStocktakings(sts);
      setProducts(prods);
      setWarehouses(whs);
      setStocks(whStocks);
    } catch (e) {
      if (showNotification) showNotification('خطا در بارگذاری اطلاعات!', 'error');
    }
    setIsLoading(false);
  };

  const handleCreateNew = () => {
    setWarehouseId('');
    setDate(new Date().toLocaleDateString('fa-IR'));
    setDescription('');
    setItems([]);
    setCurrentId('');
    setViewState('create');
  };

  const handleStartCounting = () => {
    if (!warehouseId) {
      if (showNotification) showNotification('لطفا انبار را انتخاب کنید', 'error');
      return;
    }
    // initialize items with expected stock
    const newItems: StocktakingItem[] = products.filter(p => p.type === 'product' || !p.type).map(p => {
      const stockEntry = stocks.find(s => s.productId?.toString() === p.id?.toString() && s.warehouseId?.toString() === warehouseId.toString());
      const expected = stockEntry ? stockEntry.availableStock : 0;
      return {
        productId: p.id,
        productName: p.name,
        expectedStock: expected,
        countedStock: null,
        difference: 0,
        costValue: 0
      };
    });
    setItems(newItems);
  };

  const handleViewOrEdit = (st: Stocktaking) => {
    setCurrentId(st.id);
    setWarehouseId(st.warehouseId);
    setDate(st.date);
    setDescription(st.description || '');
    setItems(st.items);
    setViewState('edit');
  };

  const handleSaveDraft = async () => {
    if (!warehouseId) {
      if (showNotification) showNotification('انبار باید انتخاب شود', 'error');
      return;
    }
    
    let totalDeficit = 0;
    let totalSurplus = 0;
    items.forEach(it => {
        const p = products.find(prod => prod.id === it.productId);
        const cost = p?.purchasePrice || p?.price || 0;
        const cValue = it.difference * cost;
        it.costValue = cValue;
        if (cValue < 0) totalDeficit += Math.abs(cValue);
        if (cValue > 0) totalSurplus += cValue;
    });

    const payload: Omit<Stocktaking, 'id'> = {
      date,
      warehouseId,
      status: 'in_progress',
      items,
      description,
      createdBy: currentUser,
      totalDeficitValue: totalDeficit,
      totalSurplusValue: totalSurplus
    };

    try {
      if (viewState === 'create') {
        const added = await addStocktaking(payload as any);
        setStocktakings([...stocktakings, added]);
        if (showNotification) showNotification('انبارگردانی با موفقیت ذخیره شد', 'success');
        setViewState('list');
      } else {
        const updated = await updateStocktaking(currentId, { ...payload, id: currentId, status: stocktakings.find(s => s.id === currentId)?.status || 'in_progress' });
        setStocktakings(stocktakings.map(s => s.id === currentId ? updated : s));
        if (showNotification) showNotification('انبارگردانی با موفقیت بروزرسانی شد', 'success');
        setViewState('list');
      }
    } catch {
      if (showNotification) showNotification('خطا در ذخیره اطلاعات', 'error');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('آیا از حذف این انبارگردانی مطمئن هستید؟')) return;
    await deleteStocktaking(id);
    setStocktakings(stocktakings.filter(s => s.id !== id));
    if (showNotification) showNotification('با موفقیت حذف شد', 'success');
  };

  const toPersianDigits = (str: string | number) => str?.toString().replace(/\d/g, x => ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][parseInt(x)]);

  const filteredItems = items.filter(it => it.productName.includes(searchTerm) || (products.find(p => p.id === it.productId)?.code?.includes(searchTerm)));

  const whMap = warehouses.reduce((acc, w) => ({ ...acc, [w.id]: w.name }), {} as Record<string, string>);

  if (isLoading) return <div className="flex justify-center p-20"><RefreshCcw className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
         <div>
           <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <ClipboardList className="w-6 h-6 text-indigo-600" /> 
             ماژول انبارگردانی
           </h1>
           <p className="text-sm text-slate-500 mt-1">مدیریت موجودی واقعی انبار، مغایرت‌گیری و صدور حواله/رسید اصلاحی</p>
         </div>
         {viewState === 'list' && (
           <button onClick={handleCreateNew} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-100">
             <Plus className="w-5 h-5" /> شروع انبارگردانی جدید
           </button>
         )}
         {viewState !== 'list' && (
           <button onClick={() => setViewState('list')} className="px-6 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold flex items-center gap-2 transition-all">
             بازگشت به لیست
           </button>
         )}
      </div>

      {viewState === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {stocktakings.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center text-slate-400">
              <ClipboardList className="w-16 h-16 mb-4 text-slate-200" />
              <p className="font-bold text-lg text-slate-500">هیچ سابقه انبارگردانی ثبت نشده است.</p>
              <button onClick={handleCreateNew} className="mt-4 px-6 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors">ثبت اولین انبارگردانی</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-sm">
                  <tr>
                    <th className="p-4">تاریخ</th>
                    <th className="p-4">انبار</th>
                    <th className="p-4">شرح</th>
                    <th className="p-4">تعداد کالاها</th>
                    <th className="p-4">ارزش کسری مغایرت</th>
                    <th className="p-4">وضعیت</th>
                    <th className="p-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stocktakings.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">{st.date}</td>
                      <td className="p-4 font-bold text-indigo-700">{whMap[st.warehouseId] || 'نامشخص'}</td>
                      <td className="p-4 text-sm text-slate-600 truncate max-w-[200px]">{st.description || '-'}</td>
                      <td className="p-4 font-bold text-slate-700">{toPersianDigits(st.items.length)} ردیف</td>
                      <td className="p-4 font-mono text-rose-600 font-bold">{st.totalDeficitValue ? toPersianDigits(st.totalDeficitValue.toLocaleString()) : '۰'} تومان</td>
                      <td className="p-4">
                        {st.status === 'in_progress' ? <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">در حال شمارش</span> : 
                         st.status === 'applied' ? <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">اعمال شده</span> : 
                         <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">{st.status}</span>}
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button onClick={() => handleViewOrEdit(st)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="مشاهده / ویرایش / اعمال">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(st.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50" disabled={st.status === 'applied'}>
                          <AlertCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">انتخاب انبار <span className="text-rose-500">*</span></label>
                   <select 
                     value={warehouseId} 
                     onChange={e => setWarehouseId(e.target.value)}
                     disabled={items.length > 0}
                     className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold"
                   >
                     <option value="">-- یک انبار انتخاب کنید --</option>
                     {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">تاریخ انبارگردانی</label>
                   <DatePicker
                      value={date}
                      onChange={(d: any) => setDate(d?.format() || new Date().toLocaleDateString('fa-IR'))}
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      inputClass="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-left font-mono"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">توضیحات (اختیاری)</label>
                   <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none" placeholder="یادداشت..." />
                </div>
             </div>

             {items.length === 0 ? (
               <div className="mt-8 flex justify-end">
                 <button onClick={handleStartCounting} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md">
                   <Package className="w-5 h-5" /> فراخوانی لیست کالاها جهت شمارش
                 </button>
               </div>
             ) : (
               <div className="mt-8 space-y-4">
                 <div className="flex items-center justify-between border-b pb-4">
                   <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><PenTool className="w-5 h-5 text-amber-500" /> ثبت شمارش موجودی</h3>
                   <div className="relative w-64">
                     <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                     <input type="text" placeholder="جستجوی کالا..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full py-2 pr-9 pl-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 text-sm" />
                   </div>
                 </div>
                 
                 <div className="max-h-[500px] overflow-y-auto border border-slate-100 rounded-xl">
                   <table className="w-full text-right" dir="rtl">
                     <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-bold sticky top-0 z-10">
                       <tr>
                         <th className="p-4 w-12 text-center">#</th>
                         <th className="p-4">جستجو / کد</th>
                         <th className="p-4">نام کالا</th>
                         <th className="p-4 text-center">موجودی فعلی (سیستم)</th>
                         <th className="p-4 w-48 text-center bg-indigo-50/50">تعداد شمارش شده</th>
                         <th className="p-4 text-center">مغایرت</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {filteredItems.map((it, idx) => {
                         const p = products.find(prod => prod.id === it.productId);
                         return (
                           <tr key={it.productId} className="hover:bg-slate-50/30">
                             <td className="p-4 text-center text-slate-400 font-mono text-sm">{idx + 1}</td>
                             <td className="p-4 font-mono text-sm text-slate-500">{p?.code || p?.barcode || '-'}</td>
                             <td className="p-4 font-bold text-slate-800">{it.productName}</td>
                             <td className="p-4 text-center font-mono font-bold text-slate-600 bg-slate-50/50">{it.expectedStock} {p?.unit}</td>
                             <td className="p-3 bg-indigo-50/30">
                               <input 
                                 type="number" 
                                 min="0"
                                 value={it.countedStock !== null ? it.countedStock : ''}
                                 onChange={(e) => {
                                   const val = e.target.value === '' ? null : Number(e.target.value);
                                   const newItems = [...items];
                                   const targetIdx = newItems.findIndex(x => x.productId === it.productId);
                                   if (targetIdx > -1) {
                                     newItems[targetIdx].countedStock = val;
                                     newItems[targetIdx].difference = val !== null ? val - newItems[targetIdx].expectedStock : 0;
                                     setItems(newItems);
                                   }
                                 }}
                                 placeholder="؟"
                                 className="w-full p-2 border border-indigo-200 text-center font-mono font-bold rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none placeholder-slate-300"
                               />
                             </td>
                             <td className="p-4 text-center font-mono font-bold">
                               {it.countedStock === null ? <span className="text-slate-300">-</span> : 
                                it.difference === 0 ? <span className="text-slate-400">بدون مغایرت</span> : 
                                it.difference > 0 ? <span className="text-emerald-600">+{it.difference} (اضافی)</span> : 
                                <span className="text-rose-600">{it.difference} (کسری)</span>}
                             </td>
                           </tr>
                         )
                       })}
                     </tbody>
                   </table>
                 </div>

                 <div className="mt-8 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex gap-6">
                      <div className="text-sm">
                        <span className="text-slate-500 block mb-1">اقلام شمرده شده</span>
                        <span className="font-bold text-slate-800">{toPersianDigits(items.filter(i => i.countedStock !== null).length)} از {toPersianDigits(items.length)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500 block mb-1">تعداد دارای مغایرت</span>
                        <span className="font-bold text-rose-600">{toPersianDigits(items.filter(i => i.countedStock !== null && i.difference !== 0).length)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                       <button onClick={handleSaveDraft} className="px-6 py-2.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all focus:ring-2 focus:ring-indigo-100">
                         <Save className="w-5 h-5" /> ذخیره موقت انبارگردانی
                       </button>

                       {/* For demo, we just instruct the user if they want to apply. In a full system, hitting 'Apply' would generate inventory docs. */}
                       {stocktakings.find(s => s.id === currentId)?.status !== 'applied' && (
                         <button 
                           onClick={() => {
                             if(showNotification) showNotification('برای تسویه موجودی، اسناد رسید/حواله انبار ثبت کنید.', 'info');
                             if(onNavigateToDocs) onNavigateToDocs();
                           }} 
                           className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
                         >
                           <Handshake className="w-5 h-5" /> گزارش مغایرت و تنظیم اسناد
                         </button>
                       )}
                    </div>
                 </div>

               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
