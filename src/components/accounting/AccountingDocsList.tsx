import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Eye } from 'lucide-react';
import { getAccountingDocuments, getLedgerAccounts } from '../../services/dataService';
import { AccountingDocument, LedgerAccount } from '../../types';

export default function AccountingDocsList({ onNavigateToCreate, onNavigateToView }: any) {
  const [docs, setDocs] = useState<AccountingDocument[]>([]);
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedDocs, fetchedAccs] = await Promise.all([
      getAccountingDocuments(),
      getLedgerAccounts()
    ]);
    setDocs(fetchedDocs.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));
    setAccounts(fetchedAccs);
    setIsLoading(false);
  };

  const filteredDocs = docs.filter(d => 
    d.documentNumber.toString().includes(searchTerm) ||
    d.description?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">اسناد حسابداری</h2>
            <p className="text-sm text-slate-500 mt-1">مدیریت لیست اسناد مالی و روزنامه</p>
          </div>
        </div>

        <button onClick={onNavigateToCreate} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition w-full sm:w-auto justify-center shadow-lg shadow-indigo-200">
          <Plus className="w-5 h-5" /> صدور سند دستی
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="جستجو در اسناد (شماره سند، توضیحات)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-600 text-sm">شماره سند</th>
                <th className="p-4 font-bold text-slate-600 text-sm">تاریخ</th>
                <th className="p-4 font-bold text-slate-600 text-sm">توضیحات (شرح سند)</th>
                <th className="p-4 font-bold text-slate-600 text-sm text-center">آرتیکل‌ها</th>
                <th className="p-4 font-bold text-slate-600 text-sm text-center">وضعیت</th>
                <th className="p-4 font-bold text-slate-600 text-sm">مجموع مبالغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                 <tr>
                   <td colSpan={6} className="p-6 text-center text-slate-500">
                     <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                   </td>
                 </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-400">
                     <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                     <p className="font-bold">هیچ سندی یافت نشد</p>
                   </td>
                 </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const total = doc.items.reduce((sum, item) => sum + Number(item.debit || 0), 0);
                  
                  return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-black text-slate-800 font-mono">{doc.documentNumber}</td>
                    <td className="p-4 text-sm font-bold text-slate-600">{doc.date}</td>
                    <td className="p-4 text-sm text-slate-700 truncate max-w-xs">{doc.description}</td>
                    <td className="p-4 text-sm font-bold text-slate-600 text-center">{doc.items?.length || 0} خط</td>
                    <td className="p-4 text-sm font-bold text-center">
                       {doc.status === 'approved' ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs">تایید شده</span>
                       ) : (
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs">موقت (پیش‌نویس)</span>
                       )}
                    </td>
                    <td className="p-4 text-sm font-black text-indigo-700 font-mono" dir="ltr">
                      {total.toLocaleString()}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
