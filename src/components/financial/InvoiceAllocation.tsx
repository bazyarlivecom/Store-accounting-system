import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckSquare, Search, Save, AlertCircle } from 'lucide-react';
import { getPersons, getInvoices, getTransactions, updateInvoice, updateTransaction, getStoreSettings } from '../../services/dataService';
import Select from 'react-select';

export default function InvoiceAllocation({ 
  customAlert,
  formatCurrency,
  getDefaultExchangeRate
}: { 
  customAlert?: (msg: string) => void,
  formatCurrency: (n: number) => string,
  getDefaultExchangeRate: (inc: string, stc: string) => number
}) {
  const alertUser = customAlert || alert;
  
  const [loading, setLoading] = useState(false);
  const [persons, setPersons] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>({ currency: 'تومان' });
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | number | ''>('');
  
  // Local allocations state: transactionId -> invoiceId -> amount
  const [allocations, setAllocations] = useState<Record<string, Record<string, number>>>({});
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = await getPersons();
      const inv = await getInvoices();
      const tx = await getTransactions();
      const s = await getStoreSettings();
      setPersons(p);
      setInvoices(inv);
      setTransactions(tx);
      setStoreSettings(s || { currency: 'تومان' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const personOptions = persons.filter(p => p.isActive !== false).map(p => ({
    value: p.id,
    label: `${p.personCode ? '[' + p.personCode + '] ' : ''}${p.alias || p.name}`
  }));

  // Filter open invoices for the selected person
  const openInvoices = invoices.filter(inv => 
    inv.customerId?.toString() === selectedPersonId.toString() && 
    (inv.type === 'sale' || inv.type === 'purchase' || inv.type === 'sale_return' || inv.type === 'purchase_return') && 
    (inv.paymentStatus !== 'paid' || 
      transactions.some(t => t.personId?.toString() === selectedPersonId.toString() && t.linkedInvoices?.[inv.id] > 0)
    )
  );

  // Initialize allocations from DB
  useEffect(() => {
    if (selectedPersonId) {
      const initialAllocations: Record<string, Record<string, number>> = {};
      transactions.filter(tx => tx.personId?.toString() === selectedPersonId.toString()).forEach(tx => {
        if (tx.linkedInvoices && Object.keys(tx.linkedInvoices).length > 0) {
          initialAllocations[tx.id] = { ...tx.linkedInvoices };
        }
      });
      setAllocations(initialAllocations);
    } else {
      setAllocations({});
    }
  }, [selectedPersonId, transactions]);

  // Filter open transactions for the selected person
  const openTransactions = transactions.filter(tx => 
    tx.personId?.toString() === selectedPersonId.toString() && 
    (tx.type === 'receive' || tx.type === 'pay')
  ).map(tx => {
    // local modified allocations for this tx
    const localAllocations = Object.values(allocations[tx.id] || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
    return {
      ...tx,
      unallocatedLocal: (tx.amount || 0) - localAllocations
    };
  }).filter(tx => tx.unallocatedLocal > 0 || (allocations[tx.id] && Object.values(allocations[tx.id]).some(v => v > 0))); 

  const handleAllocationChange = (txId: string, invId: string, amount: number, maxAllowedInv: number, maxAllowedTx: number) => {
     // Amount can't exceed what's remaining on the invoice
     let cleanAmount = amount;
     if (cleanAmount < 0) cleanAmount = 0;
     
     if (cleanAmount > maxAllowedTx) cleanAmount = maxAllowedTx;
     if (cleanAmount > maxAllowedInv) cleanAmount = maxAllowedInv;
     
     setAllocations(prev => ({
       ...prev,
       [txId]: {
         ...(prev[txId] || {}),
         [invId]: cleanAmount
       }
     }));
  };

  const handleSave = async () => {
     setLoading(true);
     try {
        let hasChanges = false;
        // Process each transaction that has allocations OR had allocations
        const allTxIds = Array.from(new Set([
           ...Object.keys(allocations),
           ...transactions.filter(t => t.personId?.toString() === selectedPersonId.toString() && t.linkedInvoices && Object.keys(t.linkedInvoices).length > 0).map(t => t.id.toString())
        ]));

        for (const txId of allTxIds) {
           const tx = transactions.find(t => t.id.toString() === txId);
           if (!tx) continue;
           
           const oldLinkedInvoices = tx.linkedInvoices || {};
           const newLinkedInvoices = { ...(allocations[txId] || {}) };
           
           // Clean up zeros
           Object.keys(newLinkedInvoices).forEach(k => {
               if (!newLinkedInvoices[k]) delete newLinkedInvoices[k];
           });

           let txChanged = false;
           
           // Apply diff to invoices
           const allInvIds = Array.from(new Set([...Object.keys(oldLinkedInvoices), ...Object.keys(newLinkedInvoices)]));
           
           for (const invId of allInvIds) {
               const oldAmt = oldLinkedInvoices[invId] || 0;
               const newAmt = newLinkedInvoices[invId] || 0;
               const diff = newAmt - oldAmt;
               
               if (diff !== 0) {
                  txChanged = true;
                  hasChanges = true;
                  
                  const inv = invoices.find(i => i.id.toString() === invId);
                  if (inv) {
                     const newPaid = Math.max((inv.paidAmount || 0) + diff, 0);
                     const total = (inv.totalAmount || 0) * (getDefaultExchangeRate ? getDefaultExchangeRate(inv.currency, storeSettings.currency) : 1);
                     const newStatus = newPaid >= total ? 'paid' : (newPaid > 0 ? 'partial' : 'pending');
                     await updateInvoice(inv.id, { ...inv, paidAmount: newPaid, paymentStatus: newStatus });
                  }
               }
           }
           
           if (txChanged) {
               await updateTransaction(tx.id, { ...tx, linkedInvoices: newLinkedInvoices });
           }
        }
        
        if (hasChanges) {
           alertUser('تخصیص‌ها با موفقیت ثبت شد.');
           // Don't need to setAllocations({}) here, fetchData will trigger the useEffect
           await fetchData(); // refresh data
        } else {
           alertUser('هیچ تغییری برای ثبت وجود ندارد.');
        }
     } catch(err) {
        console.error(err);
        alertUser('خطا در ثبت اطلاعات.');
     } finally {
        setLoading(false);
     }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            تخصیص دریافت‌ها و پرداخت‌ها به فاکتورها
          </h2>
          <p className="text-slate-500 text-sm mt-1">تراکنش‌های باز را به فاکتورهای تسویه‌نشده مرتبط کنید</p>
        </div>
        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="w-full max-w-lg">
        <label className="block text-sm font-bold text-slate-700 mb-1">شخص / مشتری / تامین‌کننده</label>
        <Select
          isRtl
          value={personOptions.find(o => o.value.toString() === selectedPersonId.toString()) || null}
          onChange={(opt) => {
             setSelectedPersonId(opt ? opt.value : '');
             setAllocations({});
          }}
          options={personOptions}
          placeholder="جستجوی شخص..."
          noOptionsMessage={() => "شخصی یافت نشد"}
          className="text-sm"
        />
      </div>

      {selectedPersonId && (
        <div className="space-y-8">
          {openTransactions.length === 0 ? (
            <div className="bg-slate-50 p-8 rounded-xl text-center text-slate-500 font-bold border border-slate-200">
               هیچ تراکنش آزادی برای این شخص یافت نشد.
            </div>
          ) : (
            <div className="space-y-6">
              {openTransactions.map(tx => {
                 const isReceive = tx.type === 'receive';
                 const color = isReceive ? 'emerald' : 'rose';
                 const eligibleInvoices = openInvoices.filter(inv => isReceive ? (inv.type === 'sale' || inv.type === 'purchase_return') : (inv.type === 'purchase' || inv.type === 'sale_return'));
                 
                 return (
                   <div key={tx.id} className={`border border-${color}-200 bg-${color}-50/30 rounded-xl overflow-hidden`}>
                     <div className={`p-4 bg-${color}-100/50 border-b border-${color}-200 flex justify-between items-center`}>
                       <div>
                         <span className={`font-bold text-${color}-800`}>
                           {isReceive ? 'رسید دریافت' : 'رسید پرداخت'} {tx.receiptNumber || `#${tx.id}`}
                         </span>
                         <span className="text-xs text-slate-500 mr-3 mr-3 mt-1 block">تاریخ: {tx.jalaliDate}</span>
                       </div>
                       <div className="text-left">
                         <div className={`text-sm font-black text-${color}-700 font-mono`}>
                            مبلغ اصلی: {formatCurrency(tx.amount)}
                         </div>
                         <div className="text-xs font-bold text-slate-600 mt-1">
                            مانده قابل تخصیص: <span className="font-mono text-indigo-700 font-black">{formatCurrency(tx.unallocatedLocal)}</span>
                         </div>
                       </div>
                     </div>
                     
                     <div className="p-4">
                       {eligibleInvoices.length > 0 ? (
                         <table className="w-full text-sm text-right bg-white rounded-lg border border-slate-200 overflow-hidden">
                           <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase border-b border-slate-200">
                             <tr>
                               <th className="p-3">شماره فاکتور</th>
                               <th className="p-3">تاریخ</th>
                               <th className="p-3">مبلغ فاکتور</th>
                               <th className="p-3">مانده وتسویه نشده</th>
                               <th className="p-3">مبلغ تخصیصی از این رسید</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {eligibleInvoices.map(inv => {
                                const total = (inv.totalAmount || 0) * (getDefaultExchangeRate ? getDefaultExchangeRate(inv.currency, storeSettings.currency) : 1);
                                const paidInDB = (inv.paidAmount || 0);
                                
                                let oldAllocationsSum = 0;
                                transactions.filter(t => t.personId?.toString() === selectedPersonId.toString()).forEach(t => {
                                    oldAllocationsSum += (t.linkedInvoices?.[inv.id] || 0);
                                });
                                
                                const basePaid = paidInDB - oldAllocationsSum;
                                
                                let otherTxNewAllocations = 0;
                                Object.entries(allocations).forEach(([tId, invs]) => {
                                   if (tId !== String(tx.id) && invs[inv.id]) {
                                      otherTxNewAllocations += invs[inv.id];
                                   }
                                });
                                
                                const currentRemainder = Math.max(total - basePaid - otherTxNewAllocations, 0);
                                const currentAllocated = allocations[tx.id]?.[inv.id] || 0;
                                
                                return (
                                 <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                   <td className="p-3 font-mono font-bold text-slate-700">{inv.invoiceNumber || `#${inv.id}`}</td>
                                   <td className="p-3 font-mono text-slate-500">{inv.jalaliDate}</td>
                                   <td className="p-3 font-mono text-slate-700">{formatCurrency(total)}</td>
                                   <td className="p-3 font-mono font-bold text-rose-600">{formatCurrency(currentRemainder)}</td>
                                   <td className="p-3">
                                     <div className="flex items-center gap-2 justify-end">
                                       <button 
                                         type="button" 
                                         className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100" 
                                         title="تخصیص حداکثری (تکمیل وجه)"
                                         onClick={() => {
                                           const maxAlloc = Math.min(currentRemainder, tx.unallocatedLocal + currentAllocated);
                                           handleAllocationChange(
                                              String(tx.id), 
                                              String(inv.id), 
                                              maxAlloc, 
                                              currentRemainder, // max for invoice
                                              tx.unallocatedLocal + currentAllocated // max we have from transaction
                                           );
                                         }}
                                       >
                                         <CheckSquare className="w-4 h-4" />
                                       </button>
                                       <input 
                                         type="number"
                                         className="p-1.5 border border-slate-200 rounded-lg text-sm font-mono w-32 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-left bg-white transition-all shadow-sm"
                                         placeholder="0"
                                         value={currentAllocated || ''}
                                         min={0}
                                         max={Math.min(currentRemainder, tx.unallocatedLocal + currentAllocated)}
                                         onChange={(e) => {
                                            handleAllocationChange(
                                               String(tx.id), 
                                               String(inv.id), 
                                               Number(e.target.value), 
                                               currentRemainder, // max for invoice
                                               tx.unallocatedLocal + currentAllocated // max we have from transaction
                                            );
                                         }}
                                       />
                                     </div>
                                   </td>
                                 </tr>
                                );
                             })}
                           </tbody>
                         </table>
                       ) : (
                         <div className="text-xs text-slate-500 font-bold bg-white p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                           <AlertCircle className="w-4 h-4 text-amber-500" />
                           فاکتور آزادی برای این تراکنش یافت نشد
                         </div>
                       )}
                     </div>
                   </div>
                 );
              })}
              
              {Object.keys(allocations).length > 0 && Object.values(allocations).some(invs => Object.values(invs).some(amt => amt > 0)) && (
                <div className="flex justify-end pt-4">
                  <button 
                    disabled={loading}
                    onClick={handleSave}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    ثبت نهایی تخصیص‌ها
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
