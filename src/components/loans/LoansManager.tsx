import React, { useState } from 'react';
import { Loan, Installment, Person, Account } from '../../types';
import { Plus, Percent, Edit2, Trash2, Search, CheckCircle, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Layers, Calendar, DollarSign, Wallet, Users, Activity, List, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoansManagerProps {
  loans: Loan[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  installments: Installment[];
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>;
  persons: Person[];
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function LoansManager({
  loans,
  setLoans,
  installments,
  setInstallments,
  persons,
  accounts,
  setAccounts,
  transactions,
  setTransactions,
}: LoansManagerProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [expandedLoanId, setExpandedLoanId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState<{
    personId: string | number;
    amount: number | '';
    interestRate: number | '';
    startDate: string;
    totalInstallments: number | '';
    installmentAmount: number | '';
    description: string;
    type: 'given' | 'received';
    accountId: string | number;
  }>({
    personId: '',
    amount: '',
    interestRate: '',
    startDate: new Date().toLocaleDateString('fa-IR').replace(/\//g, '-'),
    totalInstallments: '',
    installmentAmount: '',
    description: '',
    type: 'given',
    accountId: '',
  });


  const [useBalanceAsAmount, setUseBalanceAsAmount] = useState(false);

  const selectedPersonBalance = React.useMemo(() => {
    if (!formData.personId) return null;
    const personIdStr = formData.personId.toString();
    const person = persons.find(p => p.id.toString() === personIdStr);
    if (!person) return null;
    
    let balance = 0;
    transactions.filter(t => t.personId?.toString() === personIdStr).forEach(t => {
        if (t.type === 'receive') balance -= (t.amount || 0);
        else if (t.type === 'pay') balance += (t.amount || 0);
        else if (t.type === 'salary') balance -= (t.amount || 0);
    });
    if (balance > 0) return { amount: balance, status: 'بدهکار', value: balance, color: 'text-rose-600', bg: 'bg-rose-50' };
    if (balance < 0) return { amount: Math.abs(balance), status: 'بستانکار', value: balance, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    return { amount: 0, status: 'بی‌حساب', value: 0, color: 'text-gray-500', bg: 'bg-gray-100' };
  }, [formData.personId, persons, transactions]);

  const [paymentForm, setPaymentForm] = useState<{
    installmentId: string | number | null;
    amount: number | '';
    accountId: string | number;
    paymentDate: string;
  }>({
    installmentId: null,
    amount: '',
    accountId: '',
    paymentDate: new Date().toLocaleDateString('fa-IR').replace(/\//g, '-'),
  });

  const addCommas = (num: number | string) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

    const toEnglishNumbers = (str: string) => {
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    let result = str;
    for(let i=0; i<10; i++) {
      result = result.replace(persianNumbers[i], i.toString()).replace(arabicNumbers[i], i.toString());
    }
    return result;
  };

  const removeCommas = (str: string) => {
    return str.replace(/,/g, "");
  };

  const handleCreateLoan = () => {
    if (!formData.personId || formData.amount === '' || formData.totalInstallments === '' || formData.installmentAmount === '' || !formData.accountId) {
      alert('لطفا تمام فیلدهای ضروری را پر کنید.');
      return;
    }

    const loanId = Date.now().toString();
    const amountNum = Number(formData.amount);
    const instCount = Number(formData.totalInstallments);
    const instAmount = Number(formData.installmentAmount);

    const newLoan: Loan = {
      id: loanId,
      personId: formData.personId,
      amount: amountNum,
      startDate: formData.startDate,
      totalInstallments: instCount,
      installmentAmount: instAmount,
      description: formData.description,
      status: 'active',
      type: formData.type,
    };

        
    let [initY, initM, initD] = toEnglishNumbers(formData.startDate).replace(/\//g, '-').split('-').map(Number);
    if (isNaN(initY) || isNaN(initM) || isNaN(initD)) {
        initY = 1403; initM = 1; initD = 1; // fallback
    }

    const newInstallments: Installment[] = [];
    for (let i = 0; i < instCount; i++) {
      let instM = initM + i + 1; // each installment 1 month later
      let instY = initY;
      while (instM > 12) {
        instM -= 12;
        instY += 1;
      }
      let finalD = initD;
      if (instM === 12 && finalD > 29) finalD = 29;
      if (instM > 6 && finalD === 31) finalD = 30;

      let dueDateStr = instY + '-' + instM.toString().padStart(2, '0') + '-' + finalD.toString().padStart(2, '0');

      newInstallments.push({
        id: 'inst-' + loanId + '-' + i,
        loanId: loanId,
        dueDate: dueDateStr,
        amount: instAmount,
        status: 'pending',
      });
    }

    const transactionId = `txn-loan-${loanId}`;
    const newTransaction = {
      id: transactionId,
      type: formData.type === 'given' ? 'payment' : 'receive',
      amount: amountNum,
      accountId: formData.accountId,
      personId: formData.personId,
      categoryId: formData.type === 'given' ? 'loan_given' : 'loan_received',
      description: `ثبت اولیه وام ${formData.type === 'given' ? 'پرداختی' : 'دریافتی'}`,
      date: formData.startDate,
      time: new Date().toLocaleTimeString('fa-IR', { hour12: false }),
      isSystem: true,
    };

    setLoans([...loans, newLoan]);
    setInstallments([...installments, ...newInstallments]);
    setTransactions([...transactions, newTransaction]);
    
    setFormData({
      personId: '',
      amount: '',
      interestRate: '',
      startDate: new Date().toLocaleDateString('fa-IR').replace(/\//g, '-'),
      totalInstallments: '',
      installmentAmount: '',
      description: '',
      type: 'given',
      accountId: '',
    });
    setActiveTab('list');
  };

  const handlePayInstallment = () => {
    if(!paymentForm.installmentId || paymentForm.amount === '' || !paymentForm.accountId) {
       alert('اطلاعات پرداخت ناقص است.');
       return;
    }

    const inst = installments.find(i => i.id === paymentForm.installmentId);
    if (!inst) return;
    const loan = loans.find(l => l.id === inst.loanId);
    if (!loan) return;

    const amountNum = Number(paymentForm.amount);

    const updatedInstallments = installments.map(i => {
      if (i.id === paymentForm.installmentId) {
        return {
          ...i,
          status: 'paid' as 'paid',
          paidDate: paymentForm.paymentDate,
          paidAmount: amountNum,
        };
      }
      return i;
    });

    const loanInstallments = updatedInstallments.filter(i => i.loanId === loan.id);
    const allPaid = loanInstallments.every(i => i.status === 'paid');
    
    const updatedLoans = loans.map(l => {
      if (l.id === loan.id) {
        return {
          ...l,
          status: allPaid ? ('completed' as 'completed') : l.status
        }
      }
      return l;
    });

    const newTransaction = {
      id: `txn-inst-${Date.now()}`,
      type: loan.type === 'given' ? 'receive' : 'payment',
      amount: amountNum,
      accountId: paymentForm.accountId,
      personId: loan.personId,
      categoryId: loan.type === 'given' ? 'loan_installment_received' : 'loan_installment_paid',
      description: `پرداخت قسط وام`,
      date: paymentForm.paymentDate,
      time: new Date().toLocaleTimeString('fa-IR', { hour12: false }),
      isSystem: true,
    };

    setInstallments(updatedInstallments);
    setLoans(updatedLoans);
    setTransactions([...transactions, newTransaction]);
    setPaymentForm({ installmentId: null, amount: '', accountId: '', paymentDate: new Date().toLocaleDateString('fa-IR').replace(/\//g, '-') });
  };

  const getPersonName = (pid: string | number) => {
    const p = persons.find(x => x.id === pid);
    return p ? p.name : 'نامشخص';
  };

  const getAccountName = (aid: string | number) => {
    const a = accounts.find(x => x.id === aid);
    return a ? a.bankName : 'نامشخص';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto hide-scrollbar" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 drop-shadow-sm mb-2">مدیریت وام و اقساط</h1>
          <p className="text-gray-500 font-medium tracking-tight">وام‌های پرداختی، دریافتی و زمان‌بندی اقساط</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === 'list' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            لیست وام‌ها
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === 'create' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ثبت وام جدید
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-8">
             <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600" />
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-800">تعریف وام</h2>
                <p className="text-sm text-gray-500">مشخصات و زمانبندی اقساط را وارد کنید</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="col-span-1 border border-gray-200 rounded-2xl p-1 bg-gray-50/50 flex">
                <button
                   onClick={() => setFormData({...formData, type: 'given'})}
                   className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${formData.type === 'given' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >پرداختی به شخص</button>
                <button
                   onClick={() => setFormData({...formData, type: 'received'})}
                   className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${formData.type === 'received' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >دریافتی از شخص</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <Users className="w-4 h-4 text-gray-400" /> طرف حساب
                </label>
                <select
                  value={formData.personId}
                  onChange={(e) => {
                    setFormData({...formData, personId: e.target.value});
                    setUseBalanceAsAmount(false);
                  }}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium"
                >
                  <option value="">انتخاب شخص...</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {selectedPersonBalance && selectedPersonBalance.value !== 0 && (
                   <motion.div initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="pt-2">
                      <div className={`text-xs font-bold p-3 rounded-xl border ${selectedPersonBalance.bg} ${selectedPersonBalance.color} flex flex-col gap-2`}>
                         <div className="flex items-center justify-between">
                            <span>مانده این شخص: {addCommas(selectedPersonBalance.amount)} تومان ({selectedPersonBalance.status})</span>
                         </div>
                         <button 
                            onClick={() => {
                               const useBal = !useBalanceAsAmount;
                               setUseBalanceAsAmount(useBal);
                               if (useBal) {
                                  setFormData({
                                     ...formData,
                                     amount: selectedPersonBalance.amount,
                                     type: selectedPersonBalance.value > 0 ? 'given' : 'received'
                                  });
                               }
                            }}
                            className="bg-white/60 hover:bg-white px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 mt-1 border-current border border-white/40"
                         >
                            <ArrowLeftRight className="w-3 h-3" />
                            {useBalanceAsAmount ? 'لغو استفاده از مانده' : 'تبدیل کل این مانده به وام'}
                         </button>
                      </div>
                   </motion.div>
                )}
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <DollarSign className="w-4 h-4 text-gray-400" /> مبلغ کل وام
                </label>
                <input
                  type="text"
                  disabled={useBalanceAsAmount}
                  value={formData.amount === '' ? '' : addCommas(formData.amount)}
                  onChange={(e) => {
                     let v = removeCommas(e.target.value);
                     if(v === '') { setFormData({...formData, amount: ''}); return; }
                     if(!isNaN(Number(v))) {
                        let amt = Number(v);
                        let instAmt = formData.installmentAmount;
                        if (formData.totalInstallments) {
                           let r = formData.interestRate === '' ? 0 : Number(formData.interestRate);
                           let instCount = Number(formData.totalInstallments);
                           let totalInterest = amt * (r / 100);
                           instAmt = Math.round((amt + totalInterest) / instCount) as any;
                        }
                        setFormData({...formData, amount: amt, installmentAmount: instAmt});
                     }
                  }}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-black text-left font-mono disabled:opacity-50"
                  dir="ltr"
                />
             </div>
             
             {!useBalanceAsAmount && (
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-gray-400" /> حساب بانکی / صندوق
                  </label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium"
                  >
                    <option value="">انتخاب حساب...</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.bankName}</option>
                    ))}
                  </select>
               </div>
             )}

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 font-bold text-[10px]">%</span> درصد کارمزد (سالیانه/کلی)
                </label>
                <input
                  type="number"
                  disabled={useBalanceAsAmount}
                  value={formData.interestRate}
                  onChange={(e) => {
                     let rate = (e.target.value === '' ? '' : Number(e.target.value)) as any;
                     let instAmt = '' as any;
                     if (formData.amount && formData.totalInstallments) {
                        let r = rate === '' ? 0 : Number(rate);
                        let amt = Number(formData.amount);
                        let instCount = Number(formData.totalInstallments);
                        let totalInterest = amt * (r / 100);
                        instAmt = Math.round((amt + totalInterest) / instCount);
                     }
                     setFormData({...formData, interestRate: rate, installmentAmount: instAmt});
                  }}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-black text-left font-mono disabled:opacity-50"
                  dir="ltr"
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <Percent className="w-4 h-4 text-gray-400" /> درصد سود بانکی
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => {
                       const val = Number(e.target.value);
                       setFormData({...formData, interestRate: e.target.value === '' ? '' : val});
                    }}
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-black font-mono text-left pr-10"
                    dir="ltr"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold select-none text-sm pointer-events-none">%</div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-gray-400" /> فاصله اقساط (ماه)
                </label>
                <input
                  type="number"
                  value={formData.intervalMonths_IGNORED}
                  onChange={(e) => {
                     const val = Number(e.target.value);
                     setFormData({...formData, intervalMonths_IGNORED: val > 0 ? val : 1});
                  }}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-black font-mono text-left"
                  dir="ltr"
                  min="1"
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <Layers className="w-4 h-4 text-gray-400" /> تعداد اقساط
                </label>
                <input
                  type="number"
                  value={formData.totalInstallments}
                  onChange={(e) => {
                     const val = Number(e.target.value);
                     setFormData({...formData, totalInstallments: val || ''});
                  }}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-black font-mono text-left"
                  dir="ltr"
                />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-gray-400" /> مبلغ هر قسط
                </label>
                <input
                  type="text"
                  value={formData.installmentAmount === '' ? '' : addCommas(formData.installmentAmount)}
                  onChange={(e) => {
                     let v = removeCommas(e.target.value);
                     if(v === '') { setFormData({...formData, installmentAmount: ''}); return; }
                     if(!isNaN(Number(v))) setFormData({...formData, installmentAmount: Number(v)});
                  }}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-black text-left font-mono"
                  dir="ltr"
                />
             </div>
             <div className="space-y-2 lg:col-span-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    توضیحات (اختیاری)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium resize-none min-h-[100px]"
                />
             </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-6">
             <button
               onClick={handleCreateLoan}
               className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
             >
                <Plus className="w-5 h-5"/>
                ثبت وام و ایجاد سررسید
             </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'list' && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="space-y-6"
        >
          {loans.length === 0 ? (
             <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Wallet className="w-10 h-10 text-gray-300"/>
               </div>
               <h3 className="text-xl font-black text-gray-800 mb-2">هیچ وامی ثبت نشده است</h3>
               <p className="text-gray-400 font-medium">برای ثبت وام جدید از تب «ثبت وام جدید» استفاده کنید.</p>
             </div>
          ) : (
            loans.map(loan => {
               const loanInsts = installments.filter(i => i.loanId === loan.id);
               const paidInsts = loanInsts.filter(i => i.status === 'paid').length;
               const totalInsts = loanInsts.length;
               const isExpanded = expandedLoanId === loan.id;

               return (
                 <div key={loan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-gray-200">
                    <div className="p-6 flex flex-col lg:flex-row items-center gap-6 cursor-pointer" onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}>
                       
                       <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{backgroundColor: loan.type === 'given' ? '#eff6ff' : '#ecfdf5'}}>
                          <Wallet className={`w-7 h-7 ${loan.type === 'given' ? 'text-blue-500' : 'text-emerald-500'}`}/>
                       </div>

                       <div className="flex-1 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                         
                         <div>
                            <div className="flex items-center gap-3 mb-1.5">
                               <h3 className="text-lg font-black text-gray-800">{getPersonName(loan.personId)}</h3>
                               <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${loan.type === 'given' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {loan.type === 'given' ? 'پرداختی' : 'دریافتی'}
                               </span>
                               {loan.status === 'completed' && <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-black">تسویه شده</span>}
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                               <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> تاریخ: {loan.startDate}</span>
                               <span className="flex items-center gap-1.5"><Layers className="w-4 h-4"/> تعداد اقساط: {totalInsts}</span>
                            </div>
                         </div>

                         <div className="flex flex-col md:items-end gap-1">
                            <span className="text-xl font-black font-mono text-gray-900 tracking-tight" dir="ltr">{addCommas(loan.amount)} تومان</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                               <span>پرداخت شده: {paidInsts} از {totalInsts}</span>
                               <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{width: `${(paidInsts/totalInsts)*100}%`}}></div>
                               </div>
                            </div>
                         </div>

                       </div>

                       <div className="text-gray-300">
                          {isExpanded ? <ChevronUp /> : <ChevronDown />}
                       </div>
                    </div>

                    <AnimatePresence>
                       {isExpanded && (
                          <motion.div
                            initial={{height: 0, opacity: 0}}
                            animate={{height: 'auto', opacity: 1}}
                            exit={{height: 0, opacity: 0}}
                            className="bg-gray-50/50 border-t border-gray-100"
                          >
                             <div className="p-6">
                                <h4 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                                  <List className="w-4 h-4 text-gray-400"/>
                                  لیست اقساط
                                </h4>
                                <div className="space-y-3">
                                   {loanInsts.map(inst => (
                                     <div key={inst.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${inst.status === 'paid' ? 'bg-emerald-500' : inst.status === 'overdue' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                                            <div>
                                              <div className="font-bold text-gray-800 text-sm mb-1">{inst.dueDate}</div>
                                              {inst.status === 'paid' && <div className="text-xs font-bold text-gray-500">تاریخ پرداخت: {inst.paidDate}</div>}
                                              {inst.status === 'overdue' && <div className="text-xs font-bold text-rose-500">معوقه</div>}
                                            </div>
                                         </div>

                                         <div className="text-left font-black font-mono text-gray-800" dir="ltr">
                                           {addCommas(inst.amount)} تومان
                                         </div>

                                         {(inst.status === 'pending' || inst.status === 'overdue') && loan.status === 'active' && (
                                            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                               <select
                                                 value={paymentForm.installmentId === inst.id ? paymentForm.accountId : ''}
                                                 onChange={(e) => setPaymentForm({installmentId: inst.id, amount: inst.amount, accountId: e.target.value, paymentDate: paymentForm.paymentDate})}
                                                 className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none w-full md:w-40 font-medium"
                                               >
                                                 <option value="">انتخاب حساب</option>
                                                 {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName}</option>)}
                                               </select>
                                               <div className="flex flex-wrap items-center gap-1 w-full md:w-auto">
                                                 <button
                                                   onClick={() => {
                                                      if(paymentForm.installmentId !== inst.id || !paymentForm.accountId) {
                                                         alert('لطفا حساب پرداخت/دریافت را انتخاب کنید');
                                                         setPaymentForm({...paymentForm, installmentId: inst.id, amount: inst.amount});
                                                         return;
                                                      }
                                                      handlePayInstallment();
                                                   }}
                                                   className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
                                                 >
                                                    ثبت پرداخت
                                                 </button>
                                                 {inst.status !== 'overdue' && (
                                                   <button
                                                     onClick={() => (() => {})(inst.id)}
                                                     className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
                                                   >
                                                      معوقه
                                                   </button>
                                                 )}
                                               </div>
                                            </div>
                                         )}
                                         {inst.status === 'paid' && (
                                            <div className="bg-emerald-50 text-emerald-60/ px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                              <CheckCircle className="w-4 h-4"/> پرداخت شده
                                           </div>
                                        )}
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>

                 </div>
               )
            })
          )}
        </motion.div>
      )}
    </div>
  );
}
