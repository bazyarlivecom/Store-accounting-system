import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DatePickerModule from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
const DatePicker = (DatePickerModule as any).default || DatePickerModule;
import { 
  CreditCard, Plus, Edit2, Trash2, CheckCircle, Clock, X, Save, 
  ArrowDownLeft, ArrowUpRight, Calendar, Building2, HelpCircle, AlertTriangle, Search, TrendingUp, DollarSign, Percent, BarChart
} from 'lucide-react';
import { 
  getCheckbooks, addCheckbook, updateCheckbook, deleteCheckbook, 
  getIssuedChecks, addIssuedCheck, updateIssuedCheck, deleteIssuedCheck, 
  getReceivedChecks, addReceivedCheck, updateReceivedCheck, deleteReceivedCheck, 
  getAccounts, getPersons, addTransaction
} from '../../services/dataService';
import { Checkbook, IssuedCheck, ReceivedCheck, Account, Person } from '../../types';

export default function CheckManagement({ showNotification, onUpdate }: { showNotification?: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void, onUpdate?: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'checkbooks' | 'issued_checks' | 'received_checks'>('checkbooks');
  const [checkbooks, setCheckbooks] = useState<Checkbook[]>([]);
  const [issuedChecks, setIssuedChecks] = useState<IssuedCheck[]>([]);
  const [receivedChecks, setReceivedChecks] = useState<ReceivedCheck[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  
  // Custom queries
  const [issuedSearchQuery, setIssuedSearchQuery] = useState('');
  const [receivedSearchQuery, setReceivedSearchQuery] = useState('');
  const [depositAccountId, setDepositAccountId] = useState('');
  
  // Modals state
  const [isCheckbookModalOpen, setIsCheckbookModalOpen] = useState(false);
  const [isIssuedModalOpen, setIsIssuedModalOpen] = useState(false);
  const [isReceivedModalOpen, setIsReceivedModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Checkbook form state
  const [cbAccountId, setCbAccountId] = useState('');
  const [cbStart, setCbStart] = useState('');
  const [cbEnd, setCbEnd] = useState('');
  const [cbIssued, setCbIssued] = useState('');
  const [editingCheckbookId, setEditingCheckbookId] = useState<string|number|null>(null);

  // Issued Check form state
  const [icCheckbookId, setIcCheckbookId] = useState('');
  const [icCheckNumber, setIcCheckNumber] = useState('');
  const [icPayeeId, setIcPayeeId] = useState('');
  const [icAmount, setIcAmount] = useState('');
  const [icIssueDate, setIcIssueDate] = useState('');
  const [icDueDate, setIcDueDate] = useState('');
  const [icDescription, setIcDescription] = useState('');

  // Received Check form state
  const [rcPayerId, setRcPayerId] = useState('');
  const [rcBankName, setRcBankName] = useState('');
  const [rcBranchName, setRcBranchName] = useState('');
  const [rcCheckNumber, setRcCheckNumber] = useState('');
  const [rcAmount, setRcAmount] = useState('');
  const [rcReceiveDate, setRcReceiveDate] = useState('');
  const [rcDueDate, setRcDueDate] = useState('');
  const [rcDescription, setRcDescription] = useState('');

  // Status adjustment form state
  const [updatingCheckType, setUpdatingCheckType] = useState<'issued' | 'received'>('issued');
  const [updatingCheckId, setUpdatingCheckId] = useState<string|number|null>(null);
  const [statusVal, setStatusVal] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setCheckbooks(await getCheckbooks());
    setIssuedChecks(await getIssuedChecks());
    setReceivedChecks(await getReceivedChecks());
    setAccounts(await getAccounts());
    setPersons(await getPersons());
    onUpdate?.();
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

  const handleIssueCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icCheckNumber || !icAmount || !icPayeeId || !icDueDate) {
      alert('لطفاً اطلاعات ضروری را وارد کنید');
      return;
    }

    const payload = {
      checkbookId: icCheckbookId || '',
      checkNumber: icCheckNumber,
      amount: Number(icAmount),
      payeeId: icPayeeId,
      issueDate: icIssueDate || new Date().toLocaleDateString('fa-IR'),
      dueDate: icDueDate,
      status: 'issued',
      description: icDescription
    };

    await addIssuedCheck(payload);
    setIsIssuedModalOpen(false);
    
    // Clear inputs
    setIcCheckbookId('');
    setIcCheckNumber('');
    setIcPayeeId('');
    setIcAmount('');
    setIcIssueDate('');
    setIcDueDate('');
    setIcDescription('');
    
    fetchData();
  };

  const handleReceiveCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rcCheckNumber || !rcAmount || !rcPayerId || !rcBankName || !rcDueDate) {
      alert('لطفاً اطلاعات ضروری را وارد کنید');
      return;
    }

    const payload = {
      checkNumber: rcCheckNumber,
      bankName: rcBankName,
      branchName: rcBranchName,
      amount: Number(rcAmount),
      payerId: rcPayerId,
      receiveDate: rcReceiveDate || new Date().toLocaleDateString('fa-IR'),
      dueDate: rcDueDate,
      status: 'received',
      description: rcDescription
    };

    await addReceivedCheck(payload);
    setIsReceivedModalOpen(false);

    // Clear inputs
    setRcPayerId('');
    setRcBankName('');
    setRcBranchName('');
    setRcCheckNumber('');
    setRcAmount('');
    setRcReceiveDate('');
    setRcDueDate('');
    setRcDescription('');

    fetchData();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingCheckId) return;

    const notify = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      if (showNotification) {
        showNotification(msg, type);
      } else {
        alert(msg);
      }
    };

    if (updatingCheckType === 'issued') {
      const existing = issuedChecks.find(c => c.id === updatingCheckId);
      if (existing) {
        const wasAlreadyCashed = existing.status === 'cashed';
        
        // Update check entry status
        await updateIssuedCheck(updatingCheckId.toString(), { ...existing, status: statusVal as any });

        // If status changes to 'cashed' and wasn't already, add direct transaction
        if (statusVal === 'cashed' && !wasAlreadyCashed) {
          const cb = checkbooks.find(x => x.id == existing.checkbookId);
          const bankAccountId = cb?.accountId;
          
          if (bankAccountId) {
            await addTransaction({
              type: 'pay',
              resourceType: 'bank',
              resourceId: bankAccountId,
              amount: existing.amount,
              personId: existing.payeeId,
              date: new Date().toLocaleDateString('fa-IR'),
              receiptNumber: existing.checkNumber,
              description: `تسویه و پاس شدن برگه چک صادره شماره ${existing.checkNumber} به ذینفع`
            });
            notify(`چک شماره ${existing.checkNumber} با موفقیت پاس شد و مبلغ ${Number(existing.amount).toLocaleString()} تومان از حساب بانک کسر و در معین شخص ثبت گردید.`, 'success');
          } else {
            notify(`چک شماره ${existing.checkNumber} پاس شد، اما به دلیل عدم یافتن بانک مرجع، سند کاهنده خودکار درج نگردید.`, 'warning');
          }
        } else {
          notify(`وضعیت چک صادره با موفقیت تغییر یافت.`, 'info');
        }
      }
    } else {
      const existing = receivedChecks.find(c => c.id === updatingCheckId);
      if (existing) {
        const wasAlreadyCashed = existing.status === 'cashed';
        
        if (statusVal === 'cashed' && !wasAlreadyCashed && !depositAccountId) {
          notify('لطفاً بانک مقصد جهت واریز وجه چک را انتخاب کنید', 'error');
          return;
        }

        await updateReceivedCheck(updatingCheckId.toString(), { ...existing, status: statusVal as any });

        if (statusVal === 'cashed' && !wasAlreadyCashed) {
          await addTransaction({
            type: 'receive',
            resourceType: 'bank',
            resourceId: depositAccountId,
            amount: existing.amount,
            personId: existing.payerId,
            date: new Date().toLocaleDateString('fa-IR'),
            receiptNumber: existing.checkNumber,
            description: `وصول و نقد شدن چک دریافتی شماره ${existing.checkNumber} - بانک ${existing.bankName || ''}`
          });
          notify(`چک شماره ${existing.checkNumber} وصول گردید. مبلغ ${Number(existing.amount).toLocaleString()} تومان به حساب بانک واریز و خانه معین شخص بستانکار شد.`, 'success');
        } else {
          notify(`وضعیت چک دریافتی به روزرسانی شد.`, 'info');
        }
      }
    }
    setDepositAccountId('');
    setIsStatusModalOpen(false);
    fetchData();
  };

  const deleteCb = async (id: string|number) => {
    if (window.confirm('آیا از حذف این دسته چک اطمینان دارید؟')) {
      await deleteCheckbook(id.toString());
      fetchData();
    }
  };

  const handleDeleteIssuedCheck = async (id: string|number) => {
    if (window.confirm('آیا از حذف این چک صادره اطمینان دارید؟')) {
      await deleteIssuedCheck(id.toString());
      fetchData();
    }
  };

  const handleDeleteReceivedCheck = async (id: string|number) => {
    if (window.confirm('آیا از حذف این چک دریافتی اطمینان دارید؟')) {
      await deleteReceivedCheck(id.toString());
      fetchData();
    }
  };

  // Filtered queries and statistical sums
  const filteredIssuedChecks = issuedChecks.filter(c => {
    const payeeName = String(persons.find(p => p.id?.toString() === c.payeeId?.toString())?.name || c.payeeId || '');
    const query = issuedSearchQuery.toLowerCase();
    return (
      String(c.checkNumber || '').toLowerCase().includes(query) ||
      payeeName.toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query) ||
      String(c.amount || '').includes(query)
    );
  });

  const filteredReceivedChecks = receivedChecks.filter(c => {
    const payerName = String(persons.find(p => p.id?.toString() === c.payerId?.toString())?.name || c.payerId || '');
    const query = receivedSearchQuery.toLowerCase();
    return (
      String(c.checkNumber || '').toLowerCase().includes(query) ||
      payerName.toLowerCase().includes(query) ||
      String(c.bankName || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query) ||
      String(c.amount || '').includes(query)
    );
  });

  // KPI Calculations
  const totalIssuedAmount = issuedChecks.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const cashedIssuedAmount = issuedChecks.filter(c => c.status === 'cashed').reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const bouncedIssuedAmount = issuedChecks.filter(c => c.status === 'bounced').reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const pendingIssuedAmount = issuedChecks.filter(c => c.status === 'issued' || !c.status).reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const totalReceivedAmount = receivedChecks.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const cashedReceivedAmount = receivedChecks.filter(c => c.status === 'cashed').reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const bouncedReceivedAmount = receivedChecks.filter(c => c.status === 'bounced').reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const inHandReceivedAmount = receivedChecks.filter(c => c.status === 'received' || c.status === 'deposited' || !c.status).reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-l from-indigo-50/40 to-white">
         <div>
           <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
             <CreditCard className="w-6 h-6 text-indigo-600" /> مدیریت جامع چک‌ها و تعهدات مالی
           </h1>
           <p className="text-xs text-gray-500 mt-1">مدیریت دسته چک‌های بانکی، نظارت بر وضعیت چک‌های پرداختنی صادر شده و چک‌های دریافتنی از مشتریان</p>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-8 gap-6 pt-4 bg-white overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setActiveSubTab('checkbooks')} 
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'checkbooks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> لیست دسته چک‌ها
        </button>
        <button 
          onClick={() => setActiveSubTab('issued_checks')} 
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'issued_checks' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-500" /> چک‌های صادره (پرداختی)
        </button>
        <button 
          onClick={() => setActiveSubTab('received_checks')} 
          className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'received_checks' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-500" /> چک‌های دریافتی (وصولی)
        </button>
      </div>

      <div className="p-8">
        {/* SUBTAB 1: CHECKBOOKS */}
        {activeSubTab === 'checkbooks' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">تعداد دسته چک‌ها: {checkbooks.length}</span>
              <button 
                onClick={() => { 
                  setEditingCheckbookId(null); 
                  setCbAccountId(''); 
                  setCbStart(''); 
                  setCbEnd(''); 
                  setCbIssued(''); 
                  setIsCheckbookModalOpen(true); 
                }} 
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> تعریف دسته چک جدید
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {checkbooks.map(cb => {
                 const bankAccount = accounts.find(a => a.id == cb.accountId);
                 const bankName = bankAccount?.bankName || 'حساب بانکی نامشخص';
                 const accountNo = bankAccount?.accountNumber ? `حساب: ${bankAccount.accountNumber}` : '';
                 return (
                   <div key={cb.id} className="border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all bg-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 left-0 h-1.5 bg-indigo-500"></div>
                      <div className="text-sm font-black text-indigo-950 mb-1 flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        {bankName}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 mb-3">{accountNo}</div>
                      <div className="text-xs text-gray-600 mb-1">شماره شروع: <span className="font-mono text-gray-900 font-bold">{cb.startNumber}</span></div>
                      <div className="text-xs text-gray-600 mb-1">شماره پایان: <span className="font-mono text-gray-900 font-bold">{cb.endNumber}</span></div>
                      <div className="text-xs font-bold text-gray-700 mt-2 bg-indigo-50/50 inline-block px-2.5 py-1 rounded-lg">برگ: {cb.totalLeaves} عدد</div>
                      {cb.issuedDate && <div className="text-[10px] text-gray-400 mt-2">تاریخ ثبت: {cb.issuedDate}</div>}
                      
                      <div className="flex justify-end gap-2 absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => deleteCb(cb.id)} 
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                          title="حذف دسته چک"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                 );
              })}
              {checkbooks.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="font-bold text-sm">هیچ دسته چکی ثبت نشده است</p>
                  <p className="text-xs text-gray-500 mt-1">با زدن دکمه بالا اولین دسته چک خود را اضافه کنید.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeSubTab === 'issued_checks' ? (
          /* SUBTAB 2: ISSUED CHECKS */
          <div>
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50/40 to-white border border-indigo-100/60 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-indigo-900 block">کل چک‌های صادره</span>
                  <span className="text-base font-black text-indigo-950 font-sans block mt-1">{totalIssuedAmount.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">تومان</span></span>
                </div>
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-100/60 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-emerald-950 block">مبلغ وصول شده (پاس شده)</span>
                  <span className="text-base font-black text-emerald-700 font-sans block mt-1">{cashedIssuedAmount.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">تومان</span></span>
                </div>
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50/40 to-white border border-amber-100/60 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-amber-900 block">در جریان سررسید</span>
                  <span className="text-base font-black text-amber-700 font-sans block mt-1">{pendingIssuedAmount.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">تومان</span></span>
                </div>
                <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 animate-pulse">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50/40 to-white border border-rose-100/60 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-rose-900 block">برگشت خورده (بک‌خورده)</span>
                  <span className="text-base font-black text-rose-600 font-sans block mt-1">{bouncedIssuedAmount.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">تومان</span></span>
                </div>
                <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Actions & Filters Panel */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50/40 border border-gray-100 p-4 rounded-xl">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={issuedSearchQuery} 
                  onChange={e => setIssuedSearchQuery(e.target.value)} 
                  placeholder="جستجو بر اساس شماره چک، گیرنده، مبلغ..."
                  className="w-full pr-10 pl-4 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <span className="text-xs font-bold text-gray-550">تعداد یافت شده: {filteredIssuedChecks.length}</span>
                <button 
                  onClick={() => setIsIssuedModalOpen(true)} 
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" /> صدور چک جدید (پرداختی)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-xs bg-white">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-4 font-bold">شماره چک</th>
                    <th className="px-4 py-4 font-bold">دسته چک / حساب</th>
                    <th className="px-4 py-4 font-bold">بابت (گیرنده چک)</th>
                    <th className="px-4 py-4 font-bold">مبلغ (تومان)</th>
                    <th className="px-4 py-4 font-bold">سررسید</th>
                    <th className="px-4 py-4 font-bold">وضعیت</th>
                    <th className="px-4 py-4 font-bold text-center w-36">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {filteredIssuedChecks.map(c => {
                    const cb = checkbooks.find(x => x.id == c.checkbookId);
                    const acc = accounts.find(a => a.id == cb?.accountId);
                    const bankName = acc?.bankName || 'پرداخت نقدی/مستقیم';
                    const payee = persons.find(p => p.id?.toString() === c.payeeId?.toString());
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-black text-gray-900">{c.checkNumber}</td>
                        <td className="px-4 py-3.5 text-xs text-indigo-950 font-bold max-w-[150px] truncate">{bankName}</td>
                        <td className="px-4 py-3.5 font-bold text-gray-800">{payee?.name || c.payeeId || 'ناشناس'}</td>
                        <td className="px-4 py-3.5 font-sans font-black text-rose-600">{Number(c.amount).toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-sans font-medium text-gray-700">{c.dueDate}</td>
                        <td className="px-4 py-3.5">
                           <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block border ${
                             c.status === 'cashed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                             c.status === 'bounced' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                             c.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200 line-through' :
                             'bg-amber-50 text-amber-700 border-amber-100'
                           }`}>
                               {c.status === 'cashed' ? 'پاس شده' : 
                                c.status === 'bounced' ? 'برگشتی' : 
                                c.status === 'cancelled' ? 'باطل شده' :
                                'صادره (در جریان)'}
                           </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => { 
                                setUpdatingCheckType('issued');
                                setUpdatingCheckId(c.id); 
                                setStatusVal(c.status || 'issued'); 
                                setIsStatusModalOpen(true); 
                              }} 
                              className="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-all"
                            >
                              تغییر وضعیت
                            </button>
                            <button 
                              onClick={() => handleDeleteIssuedCheck(c.id)} 
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 inline-block"
                              title="حذف چک"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredIssuedChecks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-gray-400 text-sm font-medium">
                        <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        هیچ چکی مطابق شرایط جستجو در سیستم صادر نشده است
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* SUBTAB 3: RECEIVED CHECKS */
          <div>
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50/40 to-white border border-indigo-100/60 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-indigo-900 block">مجموع چک‌های دریافتی</span>
                  <span className="text-base font-black text-indigo-950 font-sans block mt-1">{totalReceivedAmount.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">تومان</span></span>
                </div>
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-100/60 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-emerald-950 block">مبلع وصول شده و نقد شده</span>
                  <span className="text-base font-black text-emerald-750 font-sans block mt-1">{cashedReceivedAmount.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">تومان</span></span>
                </div>
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50/40 to-white border border-amber-100/60 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-amber-900 block">موجود فیزیکی یا خوابانده</span>
                  <span className="text-base font-black text-amber-700 font-sans block mt-1">{inHandReceivedAmount.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">تومان</span></span>
                </div>
                <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50/40 to-white border border-rose-100/60 p-4 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black text-rose-900 block">برگشت خورده (مشتری)</span>
                  <span className="text-base font-black text-rose-650 font-sans block mt-1">{bouncedReceivedAmount.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">تومان</span></span>
                </div>
                <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Actions & Filters Panel */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50/40 border border-gray-100 p-4 rounded-xl">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={receivedSearchQuery} 
                  onChange={e => setReceivedSearchQuery(e.target.value)} 
                  placeholder="جستجو بر اساس شماره چک، صادرکننده، بانک..."
                  className="w-full pr-10 pl-4 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <span className="text-xs font-bold text-gray-550">تعداد یافت شده: {filteredReceivedChecks.length}</span>
                <button 
                  onClick={() => setIsReceivedModalOpen(true)} 
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" /> دریافت چک جدید (وصولی)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-xs bg-white">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-4 font-bold">شماره چک</th>
                    <th className="px-4 py-4 font-bold">بانک صادرکننده</th>
                    <th className="px-4 py-4 font-bold">پرداخت‌کننده (طرف حساب)</th>
                    <th className="px-4 py-4 font-bold">مبلغ (تومان)</th>
                    <th className="px-4 py-4 font-bold">دریافت</th>
                    <th className="px-4 py-4 font-bold">سررسید</th>
                    <th className="px-4 py-4 font-bold">وضعیت</th>
                    <th className="px-4 py-4 font-bold text-center w-36">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {filteredReceivedChecks.map(c => {
                    const payer = persons.find(p => p.id?.toString() === c.payerId?.toString());
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-black text-gray-900">{c.checkNumber}</td>
                        <td className="px-4 py-3.5 text-xs text-indigo-950 font-bold max-w-[150px] truncate">
                          {c.bankName} {c.branchName ? `(شعبه: ${c.branchName})` : ''}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-gray-800">{payer?.name || c.payerId || 'ناشناس'}</td>
                        <td className="px-4 py-3.5 font-sans font-black text-emerald-600">{Number(c.amount).toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-sans font-medium text-gray-500 text-xs">{c.receiveDate}</td>
                        <td className="px-4 py-3.5 font-sans font-bold text-gray-700">{c.dueDate}</td>
                        <td className="px-4 py-3.5">
                           <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block border ${
                             c.status === 'cashed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                             c.status === 'deposited' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                             c.status === 'bounced' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                             c.status === 'returned' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                             'bg-amber-50 text-amber-700 border-amber-100'
                           }`}>
                              {c.status === 'cashed' ? 'وصول شده' : 
                               c.status === 'deposited' ? 'خوابانده دفتری' : 
                               c.status === 'bounced' ? 'برگشتی' : 
                               c.status === 'returned' ? 'عودت داده شده' :
                               'دریافت شده'}
                           </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => { 
                                setUpdatingCheckType('received');
                                setUpdatingCheckId(c.id); 
                                setStatusVal(c.status || 'received'); 
                                setIsStatusModalOpen(true); 
                              }} 
                              className="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-all"
                            >
                              تغییر وضعیت
                            </button>
                            <button 
                              onClick={() => handleDeleteReceivedCheck(c.id)} 
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 inline-block"
                              title="حذف چک"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredReceivedChecks.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-gray-400 text-sm font-medium">
                        <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        هیچ چکی مطابق شرایط جستجو در سیستم یافت نشد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* MODAL 1: ADD CHECKBOOK */}
        {isCheckbookModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm shadow" dir="rtl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-base font-black text-gray-950 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  ثبت و تعریف دسته چک جدید
                </h3>
                <button onClick={() => setIsCheckbookModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSaveCheckbook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">حساب بانکی متصل</label>
                    <select required value={cbAccountId} onChange={e => setCbAccountId(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm">
                      <option value="">انتخاب حساب بانکی ...</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName} - {a.accountNumber || a.cardNumber}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-700 mb-1">شماره شروع برگه چک</label>
                      <input required type="text" value={cbStart} onChange={e => setCbStart(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm font-mono text-center" dir="ltr" placeholder="1001" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-700 mb-1">شماره پایان برگه چک</label>
                      <input required type="text" value={cbEnd} onChange={e => setCbEnd(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm font-mono text-center" dir="ltr" placeholder="1050" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">تاریخ دریافت دسته چک</label>
                    <input type="text" value={cbIssued} onChange={e => setCbIssued(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm text-left font-sans" dir="ltr" placeholder="1405/01/01" />
                  </div>
                  
                  <div className="flex justify-end gap-2.5 pt-4 border-t">
                    <button type="button" onClick={() => setIsCheckbookModalOpen(false)} className="px-4 py-2 border bg-white border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">انصراف</button>
                    <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm">ثبت و ایجاد دسته چک</button>
                  </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL 2: ISSUE NEW CHECK */}
        {isIssuedModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-base font-black text-rose-950 flex items-center gap-1.5">
                  <ArrowUpRight className="w-5 h-5 text-rose-600" />
                  دستور صدور چک جدید (پرداختنی)
                </h3>
                <button onClick={() => setIsIssuedModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleIssueCheckSubmit} className="space-y-4 text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">دسته چک بانکی مرجع</label>
                    <select value={icCheckbookId} onChange={e => {
                      setIcCheckbookId(e.target.value);
                      const selectedCb = checkbooks.find(x => x.id == e.target.value);
                      if (selectedCb) setIcCheckNumber(selectedCb.startNumber);
                    }} className="w-full border rounded-xl px-4 py-2 text-sm bg-white">
                      <option value="">-- بدون انتخاب (صدور مستقیم) --</option>
                      {checkbooks.map(cb => {
                        const acc = accounts.find(a => a.id == cb.accountId);
                        return <option key={cb.id} value={cb.id}>{acc?.bankName || 'نامشخص'} (برگه‌های: {cb.startNumber} تا {cb.endNumber})</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">شماره چک *</label>
                    <input required type="text" value={icCheckNumber} onChange={e => setIcCheckNumber(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm font-mono text-center" dir="ltr" placeholder="مثلا 45203" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">گیرنده چک (طرف حساب ذینفع) *</label>
                  <select required value={icPayeeId} onChange={e => setIcPayeeId(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm bg-white">
                    <option value="">-- انتخاب طرف حساب --</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role === 'customer' ? 'مشتری' : p.role === 'supplier' ? 'تامین کننده' : 'همکار'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">مبلغ چک (تومان) *</label>
                  <input required type="number" min="1" value={icAmount} onChange={e => setIcAmount(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm font-mono text-left block text-indigo-950 font-black" dir="ltr" placeholder="10,000,000" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">تاریخ صدور</label>
                    <div className="relative">
                       <DatePicker
                         value={icIssueDate as any || ''}
                         onChange={(d: any) => setIcIssueDate(d ? d.format('YYYY/MM/DD') : '')}
                         calendar={persian}
                         locale={persian_fa}
                         calendarPosition="bottom-right"
                         containerClassName="w-full"
                         inputClass="w-full border rounded-xl px-4 py-2 text-sm text-center font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                         placeholder="انتخاب تاریخ"
                       />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">تاریخ سررسید چک *</label>
                    <div className="relative">
                       <DatePicker
                         value={icDueDate as any || ''}
                         onChange={(d: any) => setIcDueDate(d ? d.format('YYYY/MM/DD') : '')}
                         calendar={persian}
                         locale={persian_fa}
                         calendarPosition="bottom-right"
                         containerClassName="w-full"
                         inputClass="w-full border rounded-xl px-4 py-2 text-sm font-black text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                         placeholder="انتخاب تاریخ"
                       />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">توضیحات و بابت</label>
                  <textarea rows={2} value={icDescription} onChange={e => setIcDescription(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-xs" placeholder="بابت فاکتور خرید فلان یا هرگونه یادداشت اضافی..."></textarea>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t">
                  <button type="button" onClick={() => setIsIssuedModalOpen(false)} className="px-4 py-2 border bg-white border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">انصراف</button>
                  <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm">تایید و صدور برگه چک</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL 3: RECEIVE NEW CHECK */}
        {isReceivedModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-base font-black text-emerald-950 flex items-center gap-1.5">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  ثبت و دریافت چک جدید (وصولی)
                </h3>
                <button onClick={() => setIsReceivedModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleReceiveCheckSubmit} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">پرداخت‌کننده (طرف حساب متعهد چک) *</label>
                  <select required value={rcPayerId} onChange={e => setRcPayerId(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm bg-white">
                    <option value="">-- انتخاب پرداخت‌کننده --</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role === 'customer' ? 'مشتری' : p.role === 'supplier' ? 'تامین کننده' : 'همکار'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">بانک صادرکننده چک *</label>
                    <input required type="text" value={rcBankName} onChange={e => setRcBankName(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm" placeholder="ملی، صادرات، پاسارگاد..." />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">شعبه / کد شعبه</label>
                    <input type="text" value={rcBranchName} onChange={e => setRcBranchName(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm" placeholder="شعبه مرکزی، کد 123" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">شماره چک *</label>
                    <input required type="text" value={rcCheckNumber} onChange={e => setRcCheckNumber(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm font-mono text-center" dir="ltr" placeholder="مثلا 12345/67" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">مبلغ چک (تومان) *</label>
                    <input required type="number" min="1" value={rcAmount} onChange={e => setRcAmount(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm font-mono text-left block text-indigo-950 font-black" dir="ltr" placeholder="25,000,000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">تاریخ دریافت چک</label>
                    <div className="relative">
                       <DatePicker
                         value={rcReceiveDate as any || ''}
                         onChange={(d: any) => setRcReceiveDate(d ? d.format('YYYY/MM/DD') : '')}
                         calendar={persian}
                         locale={persian_fa}
                         calendarPosition="top-right"
                         containerClassName="w-full"
                         inputClass="w-full border rounded-xl px-4 py-2 text-sm text-center font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
                         placeholder="انتخاب تاریخ"
                       />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">تاریخ سررسید چک *</label>
                    <div className="relative">
                       <DatePicker
                         value={rcDueDate as any || ''}
                         onChange={(d: any) => setRcDueDate(d ? d.format('YYYY/MM/DD') : '')}
                         calendar={persian}
                         locale={persian_fa}
                         calendarPosition="top-right"
                         containerClassName="w-full"
                         inputClass="w-full border rounded-xl px-4 py-2 text-sm text-center font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                         placeholder="انتخاب تاریخ"
                       />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">بابت و توضیحات چک</label>
                  <textarea rows={2} value={rcDescription} onChange={e => setRcDescription(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-xs" placeholder="بابت فاکتور فروش یا هرگونه یادداشت..."></textarea>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t">
                  <button type="button" onClick={() => setIsReceivedModalOpen(false)} className="px-4 py-2 border bg-white border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">انصراف</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm">ثبت و ذخیره چک</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL 4: ADJUST STATUS */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" dir="rtl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-base font-black text-gray-950">تغییر وضعیت برگه چک</h3>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); if (window.confirm('آیا از تغییر وضعیت این چک اطمینان دارید؟')) handleUpdateStatus(e); }} className="space-y-4 text-right">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1.5">وضعیت کاربری جدید</label>
                    <select required value={statusVal} onChange={e => setStatusVal(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white">
                      {updatingCheckType === 'issued' ? (
                        <>
                          <option value="issued">صادره (در حال جریان)</option>
                          <option value="cashed">پاس شده (پرداخت شده)</option>
                          <option value="bounced">برگشت خورده</option>
                          <option value="cancelled">باطل شده (ابطال دفتری)</option>
                        </>
                      ) : (
                        <>
                          <option value="received">دریافت شده (موجود)</option>
                          <option value="deposited">خوابانده به حساب بانکی</option>
                          <option value="cashed">cashed (وصول شده)</option>
                          <option value="bounced">برگشت خورده</option>
                          <option value="returned">عودت داده شده به مشتری</option>
                        </>
                      )}
                    </select>
                  </div>

                  {updatingCheckType === 'received' && statusVal === 'cashed' && (
                    <div className="bg-amber-50/50 p-3.5 border border-amber-100 rounded-xl space-y-1 mt-3 animate-fadeIn">
                       <label className="block text-[10px] font-black text-amber-900 mb-0.5">بانک مقصد جهت واریز وجه چک *</label>
                       <select 
                         required 
                         value={depositAccountId} 
                         onChange={e => setDepositAccountId(e.target.value)} 
                         className="w-full border border-amber-200 rounded-lg px-3 py-2 text-xs bg-white font-bold"
                       >
                         <option value="">-- انتخاب حساب بانکی عضو شتاب --</option>
                         {accounts.map(a => (
                           <option key={a.id} value={a.id}>{a.bankName} - {a.accountNumber || a.cardNumber}</option>
                         ))}
                       </select>
                       <p className="text-[9px] text-amber-700 font-bold mt-1">با تایید وصولی، موجودی حساب فوق افزایش می‌یابد و سند دریافت درج خواهد شد.</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2.5 pt-4 border-t">
                    <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 border bg-white border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">انصراف</button>
                    <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm">بروزرسانی وضعیت</button>
                  </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
