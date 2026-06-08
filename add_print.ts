import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add state
const statePattern = `const [receiptPersonId, setReceiptPersonId] = useState<string | number | ''>('');`;
const stateReplacement = `const [printingTransaction, setPrintingTransaction] = useState<any>(null);\n  const [receiptPersonId, setReceiptPersonId] = useState<string | number | ''>('');`;
content = content.replace(statePattern, stateReplacement);

// 2. Add Printer button before Trash2
const btnPattern = `<button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-all"
                              title="حذف سند"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>`;
                            
const btnReplacement = `<button
                              onClick={() => setPrintingTransaction(t)}
                              className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                              title="پیش‌نمایش و چاپ"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-all"
                              title="حذف سند"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>`;
// Replace all instances of this specific trash button in transaction lists 
// Note: We'll replace it carefully. Let's do string replacement.
content = content.replace(new RegExp(btnPattern.replace(/[.*+?^$\{key\}()|[\\]\\\\]/g, '\\$&'), 'g'), btnReplacement);

// 3. Add Print Modal component at the end of the return statement before the final closing div/main wrappers.
// We can locate the end of the PersonModal:
const endPattern = `        )}

      </main>
    </div>
  );
}`;

const modalComponent = `
        {printingTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm print:bg-white print:p-0 print:absolute print:z-auto print:block" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-lg flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 print:hidden">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-500" />
                  پیش‌نمایش چاپ رسید
                </h3>
                <button
                  onClick={() => setPrintingTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div id="print-area" className="p-8 print:p-0 bg-white">
                <div className="text-center mb-6">
                  {storeSettings?.logoUrl ? (
                    <img src={storeSettings.logoUrl} alt="Logo" className="w-16 h-16 mx-auto object-cover rounded-xl mb-3" />
                  ) : (
                    <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                      <Store className="w-8 h-8 text-indigo-500" />
                    </div>
                  )}
                  <h2 className="text-xl font-black text-gray-900 mb-1">{storeSettings?.storeName || 'فروشگاه من'}</h2>
                  <p className="text-xs text-gray-500 font-medium">رسید {printingTransaction.type === 'receive' ? 'دریافت' : printingTransaction.type === 'pay' ? 'پرداخت' : 'عملیات'}</p>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100">
                    <div className="text-right">
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">شماره سند</span>
                      <span className="font-mono text-sm font-bold">#{printingTransaction.id}</span>
                    </div>
                    <div className="text-left">
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">تاریخ</span>
                      <span className="text-sm font-bold text-gray-700">{printingTransaction.jalaliDate || printingTransaction.date?.split('T')[0]}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">مبداء / مقصد:</span>
                      <span className="font-bold text-gray-900">
                        {persons.find(p => p.id === printingTransaction.personId || p.id.toString() === printingTransaction.personId?.toString())?.name || 'نامشخص'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">حساب عملیاتی:</span>
                      <span className="font-bold text-gray-900">
                        {printingTransaction.resourceType === 'bank' 
                          ? ('بانک ' + (accounts.find(a => a.id === printingTransaction.resourceId || a.id.toString() === printingTransaction.resourceId?.toString())?.bankName || '')) 
                          : printingTransaction.resourceType === 'cashbox' 
                            ? ('صندوق ' + (cashboxes.find(c => c.id === printingTransaction.resourceId || c.id.toString() === printingTransaction.resourceId?.toString())?.name || ''))
                            : 'نامشخص'}
                      </span>
                    </div>
                    {printingTransaction.description && (
                      <div className="flex flex-col mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500 mb-1">بابت / توضیحات:</span>
                        <span className="text-sm text-gray-800">{printingTransaction.description}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col items-center justify-center border border-gray-100">
                  <span className="text-xs text-gray-500 mb-2">مبلغ تراکنش</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-gray-900">{typeof formatNumber === 'function' ? formatNumber(printingTransaction.amount) : printingTransaction.amount}</span>
                    <span className="text-sm font-bold text-gray-500 mb-1.5">{storeSettings?.currency || 'تومان'}</span>
                  </div>
                </div>
                
                <div className="mt-12 flex justify-between px-6">
                  <div className="text-center">
                    <span className="block text-xs font-bold text-gray-400 mb-8">مُهر و امضای فروشگاه</span>
                    <span className="block w-24 border-t border-gray-300 mx-auto"></span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-gray-400 mb-8">امضای تحویل دهنده / گیرنده</span>
                    <span className="block w-24 border-t border-gray-300 mx-auto"></span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto print:hidden">
                <button
                  onClick={() => setPrintingTransaction(null)}
                  className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  بستن
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  شروع چاپ
                </button>
              </div>
            </motion.div>
          </div>
        )}
`;

content = content.replace(endPattern, modalComponent + endPattern);

// Wrap the main layout's main content area inside a hidden class when printing
const mainLayoutStart = \`<main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">\`;
const mainLayoutStartReplacement = \`<main className={\`flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto \${printingTransaction ? 'print:hidden' : ''}\`}>\`;

content = content.replace(mainLayoutStart, mainLayoutStartReplacement);

fs.writeFileSync('src/App.tsx', content);
