import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Plus, Edit2, Trash2, CheckCircle, Clock, X, Save } from 'lucide-react';
import { getCheckbooks, addCheckbook, updateCheckbook, deleteCheckbook, getIssuedChecks, updateIssuedCheck, getAccounts } from '../lib/dataService';
import { Checkbook, IssuedCheck, Account } from '../types';

export default function CheckManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'checkbooks' | 'issued_checks'>('checkbooks');
  const [checkbooks, setCheckbooks] = useState<Checkbook[]>([]);
  const [issuedChecks, setIssuedChecks] = useState<IssuedCheck[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isCheckbookModalOpen, setIsCheckbookModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingCheckbookId, setEditingCheckbookId] = useState<string|number|null>(null);
  
  // Checkbook form
  const [cbAccountId, setCbAccountId] = useState('');
  const [cbStart, setCbStart] = useState('');
  const [cbEnd, setCbEnd] = useState('');
  const [cbIssued, setCbIssued] = useState('');

  // Status form
  const [updatingCheckId, setUpdatingCheckId] = useState<string|number|null>(null);
  const [statusVal, setStatusVal] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setCheckbooks(await getCheckbooks());
    setIssuedChecks(await getIssuedChecks());
    setAccounts(await getAccounts());
  };

  const handleSaveCheckbook = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(cbEnd) - Number(cbStart) + 1;
    if (count <= 0) return alert('شماره شروع باید کمتر از شماره پایان باشد');

    const payload = {
      accountId: cbAccountId,
      startNumber: cbStart,
      endNumber: cbEnd,
      totalLeaves: count,
      issuedDate: cbIssued
    };

    if (editingCheckbookId) {
       await updateCheckbook(editingCheckbookId.toString(), payload as any);
    } else {
       await addCheckbook(payload as any);
    }
    setIsCheckbookModalOpen(false);
    fetchData();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if(updatingCheckId) {
      const existing = issuedChecks.find(c => c.id === updatingCheckId);
      if(existing) {
        await updateIssuedCheck(updatingCheckId.toString(), { ...existing, status: statusVal as any });
        setIsStatusModalOpen(false);
        fetchData();
      }
    }
  };

  const deleteCb = async (id: string|number) => {
    if(window.confirm('آیا مطمئن هستید؟')) {
      await deleteCheckbook(id.toString());
      fetchData();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" dir="rtl">
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
         <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
           <CreditCard className="w-6 h-6 text-indigo-600" /> مدیریت دسته چک و پرداختی‌ها
         </h1>
      </div>
      <div className="flex border-b border-gray-100 px-8 gap-4 pt-4 bg-white">
        <button onClick={() => setActiveSubTab('checkbooks')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors ${activeSubTab === 'checkbooks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
           لیست دسته چک‌ها
        </button>
        <button onClick={() => setActiveSubTab('issued_checks')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors ${activeSubTab === 'issued_checks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
           چک‌های صادره (پرداختی)
        </button>
      </div>

      <div className="p-8">
        {activeSubTab === 'checkbooks' ? (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setEditingCheckbookId(null); setCbAccountId(''); setCbStart(''); setCbEnd(''); setCbIssued(''); setIsCheckbookModalOpen(true); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4" /> ثبت دسته چک جدید
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {checkbooks.map(cb => {
                 const bankName = accounts.find(a => a.id == cb.accountId)?.bankName || 'نامشخص';
                 return (
                   <div key={cb.id} className="border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                      <div className="text-sm font-bold text-indigo-800 mb-2">{bankName}</div>
                      <div className="text-xs text-gray-500 mb-1">از شماره <span className="font-mono text-gray-800 font-bold">{cb.startNumber}</span> تا <span className="font-mono text-gray-800 font-bold">{cb.endNumber}</span></div>
                      <div className="text-xs text-gray-500 mb-3">تعداد برگ: {cb.totalLeaves}</div>
                      <div className="flex justify-end gap-2 absolute top-4 left-4">
                        <button onClick={() => deleteCb(cb.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                 );
              })}
              {checkbooks.length === 0 && <div className="col-span-full py-10 text-center text-gray-400">هیچ دسته چکی ثبت نشده است</div>}
            </div>
          </div>
        ) : (
          <div>
             <div className="overflow-x-auto">
               <table className="w-full text-right text-sm">
                 <thead className="bg-gray-50 text-gray-600">
                   <tr>
                     <th className="px-4 py-3 font-semibold rounded-br-lg">شماره چک</th>
                     <th className="px-4 py-3 font-semibold">مبلغ</th>
                     <th className="px-4 py-3 font-semibold">تاریخ سررسید</th>
                     <th className="px-4 py-3 font-semibold">وضعیت</th>
                     <th className="px-4 py-3 font-semibold rounded-bl-lg">عملیات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {issuedChecks.map(c => (
                     <tr key={c.id}>
                       <td className="px-4 py-3 font-mono font-bold">{c.checkNumber}</td>
                       <td className="px-4 py-3 font-bold text-indigo-700">{Number(c.amount).toLocaleString()}</td>
                       <td className="px-4 py-3 text-gray-600">{c.dueDate}</td>
                       <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded bg-gray-100 text-xs font-bold ${c.status === 'cashed' ? 'bg-emerald-100 text-emerald-700' : c.status === 'bounced' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                             {c.status === 'cashed' ? 'پاس شده' : c.status === 'bounced' ? 'برگشتی' : 'در جریان/صادره'}
                          </span>
                       </td>
                       <td className="px-4 py-3">
                         <button onClick={() => { setUpdatingCheckId(c.id); setStatusVal(c.status); setIsStatusModalOpen(true); }} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold">تغییر وضعیت</button>
                       </td>
                     </tr>
                   ))}
                   {issuedChecks.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-400">چکی یافت نشد</td></tr>}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCheckbookModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-lg p-6">
              <h3 className="text-lg font-bold mb-4">ثبت دسته چک</h3>
              <form onSubmit={(e) => { e.preventDefault(); if (window.confirm('آیا از عملیات ثبت اطمینان دارید؟')) handleSaveCheckbook(e); }} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">حساب بانکی متصل</label>
                   <select required value={cbAccountId} onChange={e => setCbAccountId(e.target.value)} className="w-full border rounded-xl px-4 py-2">
                     <option value="">انتخاب حساب ...</option>
                     {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName} - {a.accountNumber || a.cardNumber}</option>)}
                   </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1">شماره شروع</label>
                     <input required type="text" value={cbStart} onChange={e => setCbStart(e.target.value)} className="w-full border rounded-xl px-4 py-2 font-mono" dir="ltr" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">شماره پایان</label>
                     <input required type="text" value={cbEnd} onChange={e => setCbEnd(e.target.value)} className="w-full border rounded-xl px-4 py-2 font-mono" dir="ltr" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">تاریخ دریافت (صدور دسته چک)</label>
                   <input type="text" value={cbIssued} onChange={e => setCbIssued(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-left" dir="ltr" placeholder="1402/10/01" />
                 </div>
                 <div className="flex justify-end gap-3 pt-4 border-t">
                   <button type="button" onClick={() => setIsCheckbookModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl">انصراف</button>
                   <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl">ذخیره</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}

        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold mb-4">تغییر وضعیت چک</h3>
              <form onSubmit={(e) => { e.preventDefault(); if (window.confirm('آیا از عملیات ویرایش وضعیت اطمینان دارید؟')) handleUpdateStatus(e); }} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">وضعیت جدید</label>
                   <select required value={statusVal} onChange={e => setStatusVal(e.target.value)} className="w-full border rounded-xl px-4 py-2">
                     <option value="issued">صادره (در جریان)</option>
                     <option value="cashed">پاس شده</option>
                     <option value="bounced">برگشت خورده</option>
                     <option value="cancelled">باطل شده</option>
                   </select>
                 </div>
                 <div className="flex justify-end gap-3 pt-4 border-t">
                   <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl">انصراف</button>
                   <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl">بروزرسانی</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
