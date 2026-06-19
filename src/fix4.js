import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');

const originalRemovedContent = `                  className="fixed top-0 bottom-0 right-0 w-full md:w-[700px] bg-gray-50 z-[160] shadow-2xl flex flex-col border-l border-slate-200"
                  dir="rtl"
                >
                  {/* Header */}
                  <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0 shadow-sm z-10">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        پیش‌نمایش گردش حساب: {selectedPerson.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setDrawerPersonId('')}
                      className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors border border-transparent shadow-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                      <div className={\`absolute right-0 top-0 bottom-0 w-1.5 \${isClear ? 'bg-slate-500' : (isOwedToUs ? 'bg-rose-500' : 'bg-emerald-500')}\`}></div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 block mb-2">وضعیت نهایی تراز حساب شخص</span>
                        <div className="py-2 font-semibold">
                          <span className={\`text-[11px] font-extrabold px-2.5 py-1 rounded-md inline-block mb-2 \${
                            isClear 
                              ? 'bg-slate-50 text-slate-700' 
                              : isOwedToUs 
                                ? 'bg-rose-50 text-rose-700' 
                                : 'bg-emerald-50 text-emerald-700'
                          }\`}>
                            {isClear ? '✔ کاملاً تسویه شده' : isOwedToUs ? '🔺 بدهکار به فروشگاه' : '🔻 بستانکار از فروشگاه'}
                          </span>
                          
                          <span className={\`text-2xl font-black block tracking-tight \${
                            isClear ? 'text-slate-700' : isOwedToUs ? 'text-rose-700' : 'text-emerald-700'
                          }\`}>
                            {formatNumber(Math.abs(finalBalance))}{' '}
                            <span className="text-xs font-medium text-gray-500">{storeSettings.currency}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline / Simplified Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-extrabold text-gray-800 text-sm">ریز ۵۰ تراکنش اخیر</h3>
                      </div>
                      <div className="overflow-x-auto">
                        {ledgerEntries.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-sm">
                            هیچ گردش مالی یا سندی برای این شخص یافت نشد.
                          </div>
                        ) : (
                          <table className="w-full text-right text-xs whitespace-nowrap min-w-[600px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                <th className="py-3 px-4 font-bold">تاریخ / ردیف</th>
                                <th className="py-3 px-4 font-bold">نوع سند</th>
                                <th className="py-3 px-4 font-bold text-left">مبلغ رویداد</th>
                                <th className="py-3 px-4 font-bold text-left">مانده نهایی</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700">
                              {ledgerEntries.slice(-50).reverse().map((entry, idx) => {
                                const isDeb = entry.debit > 0;
                                const isCred = entry.credit > 0;
                                const isTxBalZero = entry.runningBalance === 0;
                                const isTxDeb = entry.runningBalance > 0;

                                return (
                                  <tr key={entry.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => {
                                    if (entry.entryType === 'invoice' && entry.rawItem) {
                                      setViewingInvoice(entry.rawItem);
                                    } else if (entry.entryType === 'transaction' && entry.rawItem) {
                                      if (entry.rawItem.type === 'salary') {
                                        try {
                                          const parsedDesc = JSON.parse(entry.rawItem.description);
                                          if (parsedDesc.isPayslip) {
                                            setViewingPayslip({ ...entry.rawItem, parsed: parsedDesc, computedPersonName: selectedPerson.name });
                                            return;
                                          }
                                        } catch (e) {}
                                      }
                                      setPreviewReceiptData({ ...entry.rawItem, jalaliDate: entry.jalaliDate, personId: selectedPerson.id, _isReadOnly: true });
                                    } else if (entry.entryType === 'issued_check') {
                                      setDrawerPersonId('');
                                      setActiveTab('issued_checks');
                                    } else if (entry.entryType === 'received_check') {
                                      setDrawerPersonId('');
                                      setActiveTab('received_checks');
                                    }
                                  }}>
                                    <td className="py-3 px-4">
                                      <div className="font-mono text-gray-500 font-bold">{entry.jalaliDate}</div>
                                      <div className="text-[10px] text-gray-400 mt-0.5">{entry.refId}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="font-bold">{entry.type}</div>
                                      <div className="text-[10px] text-gray-400 font-normal whitespace-pre-wrap line-clamp-1 max-w-[200px]" title={entry.desc}>{entry.desc}</div>
                                    </td>
                                    <td className="py-3 px-4 text-left font-mono" dir="ltr">
                                      {isDeb ? (
                                        <span className="text-rose-600 font-bold block">{formatNumber(entry.debit)}</span>
                                      ) : isCred ? (
                                        <span className="text-emerald-600 font-bold block">{formatNumber(entry.credit)}</span>
                                      ) : (
                                        <span className="text-gray-400">---</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-left font-mono" dir="ltr">
                                      <div className="flex flex-col items-end">
                                        {isTxBalZero ? (
                                          <span className="text-slate-500 font-bold">۰</span>
                                        ) : (
                                          <span className={\`font-bold \${isTxDeb ? 'text-rose-600' : 'text-emerald-600'}\`}>
                                            {formatNumber(Math.abs(entry.runningBalance))}
                                          </span>
                                        )}
                                        <span className="text-[9px] text-gray-400 mt-0.5">{isTxBalZero ? 'تسویه' : isTxDeb ? 'بدهکار' : 'بستانکار'}</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-end gap-3 z-10">
                    <button
                      onClick={() => {
                        setLedgerPersonId(selectedPerson.id);
                        setActiveTab('person_ledger');
                        setDrawerPersonId('');
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors w-full"
                    >
                      مشاهده در کارت حساب بصورت کامل
                    </button>
                  </div>
                </motion.div>
              </>
            );
          })()}
        </AnimatePresence>

        {/* Receipt PRE-REGISTER Preview overlay */}
        {previewReceiptData && (() => {
          const isReceive = previewReceiptData.type === 'receive';
          const themeBg = isReceive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700';
          const themeText = isReceive ? 'text-emerald-700' : 'text-rose-700';
          const themeLightBg = isReceive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100';
          const receiptPerson = persons.find(p => p.id.toString() === previewReceiptData.personId?.toString());
          const receiptTitle = isReceive ? 'پیش‌نمایش رسید دریافت وجه' : 'پیش‌نمایش رسید پرداخت وجه';

          let resourceName = 'نامشخص';
          if (previewReceiptData.method === 'cash') {
            if(previewReceiptData.resourceType === 'bank'){
              const bank = accounts.find(a => a.id.toString() === previewReceiptData.resourceId?.toString());
              if(bank) resourceName = bank.bankName + ' - ' + bank.accountNumber;
            } else {
              const box = cashboxes.find(c => c.id.toString() === previewReceiptData.resourceId?.toString());
              if(box) resourceName = box.name;
            }
          }

          return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                    <Wallet className={\`w-5 h-5 \${themeText}\`} />
                    {receiptTitle}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-extrabold mt-1 uppercase tracking-widest">رسید پیش نویس قبل از تایید نهایی</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewReceiptData(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors border border-gray-100 bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Beautiful Ticket Style Receipt */}
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 bg-white shadow-sm relative overflow-hidden">
                  
                  {/* Decorative Ticket Edges */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full border-r-2 border-gray-200 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full border-l-2 border-gray-200 -translate-y-1/2"></div>

                  <div className="text-center mb-8">
                     <span className={\`inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3 \${themeLightBg} \${themeText}\`}>
                        {isReceive ? 'دریافت از مشتری / طرف حساب' : 'پرداخت به مشتری / طرف حساب'}
                     </span>
                     <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-gray-900 flex items-center justify-center gap-2 mb-2" dir="ltr">
                        {formatCurrency(previewReceiptData.amount)}
                     </div>
                     <p className="text-sm font-bold text-gray-500">{numToPersianWords(previewReceiptData.amount)} {storeSettings.currency}</p>
                  </div>

                  {/* Horizontal Divider */}
                  <div className="w-full border-t border-dashed border-gray-200 my-6"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                     <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">طرف حساب</span>
                        <div className="text-base font-black text-gray-800">
                          {renderPersonLink(receiptPerson?.id, receiptPerson?.name)} {receiptPerson?.personCode ? <span className="text-gray-400 font-mono text-sm ml-1">[{receiptPerson.personCode}]</span> : ''}
                        </div>
                     </div>
                     <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">شماره سند / ثبت</span>
                        <div className="text-base font-bold font-mono text-gray-800">
                          {previewReceiptData.receiptNumber || 'ثبت نشده'}
                        </div>
                     </div>
                     <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">تاریخ ایجاد سند</span>
                        <div className="text-base font-bold text-gray-800 font-mono">
                          {previewReceiptData.jalaliDate}
                        </div>
                     </div>
                     <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">نوع تسویه / حساب</span>
                        <div className="text-base font-bold text-gray-800">
                           {previewReceiptData.method === 'cash' ? (
                             <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-gray-400" /> نقدی - {resourceName}</span>
                           ) : (
                             <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-gray-400" /> چک بانکی</span>
                           )}
                        </div>
                     </div>
                  </div>

                  {previewReceiptData.method === 'check' && (
                     <div className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-amber-600/70 mb-1">شماره چک</span>
                           <div className="text-sm font-bold font-mono text-amber-900">{previewReceiptData.checkNumber}</div>
                        </div>
                        <div>
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-amber-600/70 mb-1">تاریخ سررسید چک</span>
                           <div className="text-sm font-bold font-mono text-amber-900">{previewReceiptData.checkDueDate}</div>
                        </div>
                        <div className="md:col-span-2">
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-amber-600/70 mb-1">{isReceive ? 'بانک صادرکننده' : 'از دسته چک'}</span>
                           <div className="text-sm font-bold text-amber-900">
                             {isReceive ? previewReceiptData.checkBankName : (() => {
                               const checkbook = checkbooks.find(cb => cb.id === previewReceiptData.checkbookId);
                               const bankAccount = accounts.find(a => a.id === checkbook?.accountId);
                               return \`\${bankAccount?.bankName} (\${checkbook?.startNumber} - \${checkbook?.endNumber})\`;
                             })()}
                           </div>
                        </div>
                     </div>
                  )}

                  {previewReceiptData.description && (
                     <div className="mt-6 pt-6 border-t border-gray-100">
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">یادداشت سند</span>
                        <p className="text-sm font-bold text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed">{previewReceiptData.description}</p>
                     </div>
                  )}
                </div>

                {/* Linked Invoices Section */}
                {Object.keys(previewReceiptData.linkedInvoices || receiptLinkedInvoices || {}).filter(k => (previewReceiptData.linkedInvoices || receiptLinkedInvoices)[k] > 0).length > 0 && (
                  <div className="mt-6 border-2 border-indigo-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <span className="font-black text-indigo-900 text-sm">تخصیص یافته به فاکتورهای:</span>
                    </div>
                    <table className="w-full text-sm text-right bg-white">
                       <thead className="bg-white border-b border-gray-100 text-gray-400">
                         <tr>
                            <th className="p-4 font-bold text-xs uppercase tracking-widest">شماره فاکتور</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-widest text-center">مبلغ تسویه شده</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                         {Object.entries(previewReceiptData.linkedInvoices || receiptLinkedInvoices || {}).filter(([_, amt]) => (amt as number) > 0).map(([invId, amt]) => {
                            const inv = invoices.find(i => i.id.toString() === invId.toString());
                            return (
                               <tr key={invId} className="hover:bg-gray-50 transition-colors">
                                  <td className="p-4 font-black text-gray-800">فاکتور {inv ? (inv.invoiceNumber || \`#\${inv.id}\`) : \`#\${invId}\`}</td>
                                  <td className="p-4 font-mono font-black text-indigo-600 text-center text-base" dir="ltr">{formatCurrency(amt as number)} <span className="text-[10px] font-sans text-gray-400">{storeSettings.currency}</span></td>
                               </tr>
                            );
                         })}
                       </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setPreviewReceiptData(null)}
                  className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm transition-colors shadow-sm"
                >
                  {previewReceiptData._isReadOnly ? 'بستن پیش‌نمایش' : 'بازگشت'}
                </button>
                {!previewReceiptData._isReadOnly && (
                <button
                  type="button"`;

const lines = content.split('\n');

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("transition={{ type: 'spring'") && startIndex === -1) {
    startIndex = i + 1; // Start line is the line after transition=...
  }
}

for (let i = startIndex; i < lines.length; i++) {
  // We want to remove everything down to the button that corresponds to the end of previewReceiptData overlay.
  // We can look for "disabled={submittingReceipt}" that occurs right after the "بستن پیش‌نمایش" logic.
  if (lines[i].includes('disabled={submittingReceipt}')) {
    // We want endIndex to be the line BEFORE this!
    endIndex = i - 1;
    break;
  }
}

console.log('Replacing from', startIndex, 'to', endIndex);
lines.splice(startIndex, endIndex - startIndex + 1, originalRemovedContent);

fs.writeFileSync('src/App.tsx', lines.join('\n'));
