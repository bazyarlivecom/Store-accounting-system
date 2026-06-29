import React, { useState, useMemo } from 'react';
import { Users, CreditCard, ChevronDown, Filter, Calendar } from 'lucide-react';

export default function FinancialDashboardWidgets({
  persons,
  calculatePersonBalance,
  issuedChecks,
  receivedChecks,
  storeSettings,
  getPersonDisplayName,
  formatNumber
}: any) {
  const [filterLimit, setFilterLimit] = useState(5);
  const [minAmount, setMinAmount] = useState('');
  
  // Date filters (simple string search for now or date logic)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const normalizeDateStr = (dStr: string) => {
    if (!dStr) return 0;
    const englishDStr = dStr.replace(/[۰-۹]/g, d => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)]);
    const parts = englishDStr.split(/[/-]/).map(p => p.padStart(2, '0'));
    if (parts.length === 3) return parseInt(parts[0] + parts[1] + parts[2], 10);
    return 0;
  };

  const parsedMinAmount = minAmount ? parseInt(minAmount.replace(/,/g, ''), 10) : 0;
  const fromDateNorm = normalizeDateStr(fromDate);
  const toDateNorm = normalizeDateStr(toDate);

  // 1. Calculate Debtors & Creditors
  const { debtors, creditors } = useMemo(() => {
    let allDebtors: any[] = [];
    let allCreditors: any[] = [];

    persons.forEach((p: any) => {
      const bal = calculatePersonBalance(p.id);
      if (bal.status === 'بدهکار') {
        if (!parsedMinAmount || bal.amount >= parsedMinAmount) {
          allDebtors.push({ ...p, balanceAmount: bal.amount });
        }
      } else if (bal.status === 'بستانکار') {
        if (!parsedMinAmount || bal.amount >= parsedMinAmount) {
          allCreditors.push({ ...p, balanceAmount: bal.amount });
        }
      }
    });

    return {
      debtors: allDebtors.sort((a, b) => b.balanceAmount - a.balanceAmount).slice(0, filterLimit),
      creditors: allCreditors.sort((a, b) => b.balanceAmount - a.balanceAmount).slice(0, filterLimit)
    };
  }, [persons, calculatePersonBalance, filterLimit, parsedMinAmount]);

  // 2. Payable Checks
  const payableChecks = useMemo(() => {
    let filtered = issuedChecks.filter((c: any) => c.status === 'pending');
    
    if (parsedMinAmount) {
      filtered = filtered.filter((c: any) => (c.amount || 0) >= parsedMinAmount);
    }
    
    if (fromDateNorm) {
      filtered = filtered.filter((c: any) => normalizeDateStr(c.dueDate) >= fromDateNorm);
    }
    
    if (toDateNorm) {
      filtered = filtered.filter((c: any) => normalizeDateStr(c.dueDate) <= toDateNorm);
    }

    return filtered.sort((a: any, b: any) => normalizeDateStr(a.dueDate) - normalizeDateStr(b.dueDate)).slice(0, filterLimit);
  }, [issuedChecks, filterLimit, parsedMinAmount, fromDateNorm, toDateNorm]);

  const getPersonName = (id: any) => {
    const p = persons.find((x: any) => String(x.id) === String(id));
    return p ? getPersonDisplayName(p) : 'نامشخص';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-1">
           <label className="text-xs font-bold text-gray-500">تعداد نمایش</label>
           <select 
             value={filterLimit} 
             onChange={e => setFilterLimit(Number(e.target.value))}
             className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/50"
           >
             <option value={5}>۵ مورد</option>
             <option value={10}>۱۰ مورد</option>
             <option value={20}>۲۰ مورد</option>
             <option value={50}>۵۰ مورد</option>
           </select>
        </div>
        <div className="flex-1 space-y-1">
           <label className="text-xs font-bold text-gray-500">حداقل مبلغ ({storeSettings.currency})</label>
           <input 
             type="text" 
             value={minAmount}
             onChange={e => setMinAmount(formatNumber(e.target.value.replace(/,/g, '')))}
             placeholder="بدون محدودیت"
             className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/50 text-left"
             dir="ltr"
           />
        </div>
        <div className="flex-1 space-y-1">
           <label className="text-xs font-bold text-gray-500">از تاریخ (برای چک)</label>
           <input 
             type="text" 
             value={fromDate}
             onChange={e => setFromDate(e.target.value)}
             placeholder="1403/01/01"
             className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/50 text-center"
             dir="ltr"
           />
        </div>
        <div className="flex-1 space-y-1">
           <label className="text-xs font-bold text-gray-500">تا تاریخ (برای چک)</label>
           <input 
             type="text" 
             value={toDate}
             onChange={e => setToDate(e.target.value)}
             placeholder="1403/12/29"
             className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/50 text-center"
             dir="ltr"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payable Checks */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
            <h3 className="font-extrabold text-rose-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-600" />
              چک‌های پرداختی (سررسید نشده)
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-auto max-h-96">
            {payableChecks.length === 0 ? (
               <div className="text-center text-gray-400 py-8 text-sm font-bold">رکوردی یافت نشد.</div>
            ) : (
               <ul className="space-y-3">
                 {payableChecks.map((c: any) => (
                   <li key={c.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col gap-2">
                     <div className="flex justify-between items-start">
                       <span className="text-sm font-black text-gray-800">{getPersonName(c.receiverId)}</span>
                       <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">{c.dueDate}</span>
                     </div>
                     <div className="flex justify-between items-center mt-1">
                       <span className="text-xs text-gray-500">شماره: <span dir="ltr">{c.checkNumber}</span></span>
                       <div className="text-left">
                         <span className="text-sm font-extrabold text-rose-600">{formatNumber(c.amount)}</span>
                         <span className="text-[10px] text-gray-400 font-semibold mr-1">{storeSettings.currency}</span>
                       </div>
                     </div>
                   </li>
                 ))}
               </ul>
            )}
          </div>
        </div>

        {/* Debtors */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center justify-between">
            <h3 className="font-extrabold text-emerald-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              بدهکاران (بزرگترین)
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-auto max-h-96">
            {debtors.length === 0 ? (
               <div className="text-center text-gray-400 py-8 text-sm font-bold">بدهکاری یافت نشد.</div>
            ) : (
               <ul className="space-y-3">
                 {debtors.map((p: any) => (
                   <li key={p.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-between items-center">
                     <span className="text-sm font-bold text-gray-800 line-clamp-1">{getPersonName(p.id)}</span>
                     <div className="text-left whitespace-nowrap">
                       <span className="text-sm font-extrabold text-emerald-600">{formatNumber(p.balanceAmount)}</span>
                       <span className="text-[10px] text-gray-400 font-semibold mr-1">{storeSettings.currency}</span>
                     </div>
                   </li>
                 ))}
               </ul>
            )}
          </div>
        </div>

        {/* Creditors */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center justify-between">
            <h3 className="font-extrabold text-indigo-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              بستانکاران (بزرگترین)
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-auto max-h-96">
            {creditors.length === 0 ? (
               <div className="text-center text-gray-400 py-8 text-sm font-bold">بستانکاری یافت نشد.</div>
            ) : (
               <ul className="space-y-3">
                 {creditors.map((p: any) => (
                   <li key={p.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-between items-center">
                     <span className="text-sm font-bold text-gray-800 line-clamp-1">{getPersonName(p.id)}</span>
                     <div className="text-left whitespace-nowrap">
                       <span className="text-sm font-extrabold text-indigo-600">{formatNumber(p.balanceAmount)}</span>
                       <span className="text-[10px] text-gray-400 font-semibold mr-1">{storeSettings.currency}</span>
                     </div>
                   </li>
                 ))}
               </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
