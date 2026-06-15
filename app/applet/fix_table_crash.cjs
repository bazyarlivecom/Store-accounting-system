const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix listFilter redeclaration
code = code.replace(/const \[listFilter, setListFilter\] = useState<'all' \| 'receipt' \| 'remittance'>\('all'\);/g, '');
code = code.replace(/const \[listFilter, setListFilter\] = useState<'all' \| 'sale' \| 'purchase'>\('all'\);/g, "const [listFilter, setListFilter] = useState<any>('all');"); // generic

// 2. Fix the corrupted block.
const corruptedStart = `<div class                     <table className="w-full text-right min-w-[1000px]">`;
const totalsContent = `                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                     {(!activeTab.includes('warehouse')) && (
                        <div className="flex w-full flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-3 ml-1">تخفیف روی کل فاکتور (%)</label>
                            <input type="number" min="0" max="100" value={overallDiscountPercent} onChange={(e) => setOverallDiscountPercent(Number(e.target.value))} className="w-48 p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left font-bold text-rose-600 outline-none" dir="ltr" />
                            <p className="mt-2 text-xs font-bold text-slate-400 font-sans">این تخفیف روی مبلغ نهایی پس از کسر تخفیف‌های سطری اعمال می‌شود.</p>
                        </div>
                      </div>
                      <div className="w-full lg:w-[420px] space-y-1">
                        <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100/50 space-y-4">
                          <div className="flex justify-between items-center text-slate-500 font-bold">
                            <span>جمع مبالغ:</span>
                            <span className="font-sans font-black text-slate-700" dir="rtl">{formatCurrency(calculateSubtotal())} <span className="text-[10px]">{invoiceCurrency}</span></span>
                          </div>
                          <div className="flex justify-between items-center text-rose-500 font-bold">
                            <span>تخفیف کلی:</span>
                            <span className="font-sans font-black" dir="rtl">% {overallDiscountPercent}</span>
                          </div>
                          <div className="h-px bg-indigo-100/60 w-full my-5"></div>
                          <div className="flex justify-between items-center text-xl font-black text-indigo-800">
                            <span>مبلغ نهایی فاکتور:</span>
                            <span className="font-sans text-2xl text-indigo-950" dir="rtl">{formatCurrency(calculateFinalTotal())} <span className="text-xs">{invoiceCurrency}</span></span>
                          </div>
                          {calculateFinalTotal() > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-indigo-200 text-right leading-relaxed text-xs font-bold text-indigo-700">
                              <span className="text-indigo-900 font-black">{numToPersianWords(calculateFinalTotal())} {invoiceCurrency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                   )}
                  </div>
                </div>
                <div className="p-6 bg-indigo-50/20 border-t border-indigo-100 flex justify-end gap-3">
                    <button onClick={handleInvoicePreviewTrigger} disabled={submitting || items.length === 0 || !customerId} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-colors shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/20">
                      {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                      ثبت و بررسی فاکتور/سند
                    </button>
                </div>
              </div>
            </motion.div>
           );

        case 'list_sale':
        case 'list_purchase':
        case 'list_warehouse_docs':
           return (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                      <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        <List className="w-6 h-6 text-indigo-600" />
                        {activeTab === 'list_sale' ? 'لیست فاکتورهای فروش' : 
                         activeTab === 'list_purchase' ? 'لیست فاکتورهای خرید' :
                         'اسناد انبار (رسید و حواله)'}
                      </h2>
                      <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder="جستجوی حرفه‌ای (شماره سند، نام شخص)..." 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-400 font-bold"
                          value={invoiceSearchQuery}
                          onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                        />
                      </div>
                  </div>
                  {activeTab === 'list_warehouse_docs' && (
                      <div className="flex bg-slate-100 rounded-xl p-1 w-full max-w-sm ml-auto mr-auto md:mr-0 md:ml-auto">
                        <button onClick={() => setListFilter('all')} className={\`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all \${listFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>همه اسناد</button>
                        <button onClick={() => setListFilter('receipt')} className={\`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all \${listFilter === 'receipt' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>رسیدهای ورود</button>
                        <button onClick={() => setListFilter('remittance')} className={\`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all \${listFilter === 'remittance' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>حواله‌های خروج</button>
                      </div>
                  )}
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-right min-w-[1000px]">`;

const idxStart = code.indexOf(corruptedStart);
if (idxStart !== -1) {
    const endTablePos = code.indexOf('<table className="w-full text-right min-w-[1000px]">', idxStart + 10);
    if(endTablePos !== -1) {
        // delete everything between corruptedStart and endTablePos (including endTablePos's line)
        code = code.substring(0, idxStart) + totalsContent + code.substring(endTablePos + '<table className="w-full text-right min-w-[1000px]">'.length);
    }
}

fs.writeFileSync('src/App.tsx', code);
