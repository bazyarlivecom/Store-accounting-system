import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SwitchCamera, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { getAccounts, getCashboxes, updateAccount, updateCashbox, addTransaction } from '../lib/dataService';
import { Account, Cashbox } from '../types';

export default function FinancialTransfer() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  
  const [fromType, setFromType] = useState<'bank' | 'cashbox'>('bank');
  const [fromId, setFromId] = useState('');
  
  const [toType, setToType] = useState<'bank' | 'cashbox'>('bank');
  const [toId, setToId] = useState('');
  
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setAccounts(await getAccounts());
    setCashboxes(await getCashboxes());
  };

  const amount = Number(amountStr.replace(/,/g, ''));

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || !amount || amount <= 0) return alert('اطلاعات نامعتبر است');
    if (fromType === toType && fromId === toId) return alert('مبدا و مقصد نمی‌تواند یکسان باشد');
    
    if (window.confirm('آیا از انتقال وجه اطمینان دارید؟')) {
       // Decrease from
       if (fromType === 'bank') {
          const acc = accounts.find(a => a.id.toString() === fromId);
          if (acc) await updateAccount(acc.id.toString(), { ...acc, balance: Number(acc.balance) - amount });
       } else {
          const cb = cashboxes.find(a => a.id.toString() === fromId);
          if (cb) await updateCashbox(cb.id.toString(), { ...cb, balance: Number(cb.balance) - amount });
       }
       
       // Increase to
       if (toType === 'bank') {
          const acc = accounts.find(a => a.id.toString() === toId);
          if (acc) await updateAccount(acc.id.toString(), { ...acc, balance: Number(acc.balance) + amount });
       } else {
          const cb = cashboxes.find(a => a.id.toString() === toId);
          if (cb) await updateCashbox(cb.id.toString(), { ...cb, balance: Number(cb.balance) + amount });
       }

       // Register generic tx
       await addTransaction({
         type: 'transfer',
         personId: 0,
         amount: amount,
         date: new Date().toISOString(),
         jalaliDate: new Date().toLocaleDateString('fa-IR'),
         resourceType: fromType,
         resourceId: fromId,
         description: `انتقال وجه به ${toType === 'bank' ? 'حساب' : 'صندوق'} ${toId}. توضیحات: ${description}`
       } as any);

       setSuccessMsg('انتقال وجه با موفقیت انجام شد');
       setAmountStr('');
       setDescription('');
       fetchData();
       setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" dir="rtl">
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
         <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
           <ArrowRightLeft className="w-6 h-6 text-indigo-600" /> انتقال وجه (بین حساب‌ها و صندوق‌ها)
         </h1>
      </div>
      <div className="p-8">
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 font-bold">
            <CheckCircle className="w-5 h-5" /> {successMsg}
          </div>
        )}
        <form onSubmit={handleTransfer} className="space-y-6 max-w-3xl border border-gray-100 p-6 rounded-2xl bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-rose-100 bg-rose-50/30 rounded-xl">
               <h3 className="font-bold text-rose-800 mb-4">مبدا (برداشت از)</h3>
               <div className="space-y-3">
                 <select value={fromType} onChange={e => setFromType(e.target.value as any)} className="w-full p-2 border rounded-lg">
                    <option value="bank">حساب بانکی</option>
                    <option value="cashbox">صندوق</option>
                 </select>
                 <select required value={fromId} onChange={e => setFromId(e.target.value)} className="w-full p-2 border rounded-lg">
                    <option value="">انتخاب کنید ...</option>
                    {fromType === 'bank' ? 
                       accounts.map(a => <option key={a.id} value={a.id}>{a.bankName} - موجودی: {Number(a.balance).toLocaleString()}</option>) :
                       cashboxes.map(c => <option key={c.id} value={c.id}>{c.name} - موجودی: {Number(c.balance).toLocaleString()}</option>)
                    }
                 </select>
               </div>
            </div>

            <div className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-xl">
               <h3 className="font-bold text-emerald-800 mb-4">مقصد (واریز به)</h3>
               <div className="space-y-3">
                 <select value={toType} onChange={e => setToType(e.target.value as any)} className="w-full p-2 border rounded-lg">
                    <option value="bank">حساب بانکی</option>
                    <option value="cashbox">صندوق</option>
                 </select>
                 <select required value={toId} onChange={e => setToId(e.target.value)} className="w-full p-2 border rounded-lg">
                    <option value="">انتخاب کنید ...</option>
                    {toType === 'bank' ? 
                       accounts.map(a => <option key={a.id} value={a.id}>{a.bankName} - موجودی: {Number(a.balance).toLocaleString()}</option>) :
                       cashboxes.map(c => <option key={c.id} value={c.id}>{c.name} - موجودی: {Number(c.balance).toLocaleString()}</option>)
                    }
                 </select>
               </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
             <div>
                <label className="block text-sm font-bold mb-1">مبلغ انتقال (تومان)</label>
                <input required type="text" dir="ltr" value={amountStr} onChange={e => setAmountStr(e.target.value.replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ","))} className="w-full p-3 border rounded-xl font-mono text-left" placeholder="1,000,000" />
             </div>
             <div>
                <label className="block text-sm font-bold mb-1">توضیحات (اختیاری)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="بابت حواله نقدی ..." />
             </div>
          </div>

          <div className="flex justify-end pt-2">
             <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2">
               <SwitchCamera className="w-5 h-5" /> ثبت انتقال وجه
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
