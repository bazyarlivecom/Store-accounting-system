import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');
const searchString = `{/* --- COMPLETELY DIFFERENT CONDITIONAL RENDERING END --- */}
                <button
                  type="button"
                  disabled={submittingReceipt}`;

const replacement = `{/* --- COMPLETELY DIFFERENT CONDITIONAL RENDERING END --- */}
                </motion.div>
              </div>
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
                  type="button"
                  disabled={submittingReceipt}`;

const finalContent = content.replace(searchString, replacement);
fs.writeFileSync('src/App.tsx', finalContent);
