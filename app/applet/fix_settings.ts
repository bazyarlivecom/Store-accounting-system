import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update settingsTab state definition
code = code.replace(
  /const \[settingsTab, setSettingsTab\] = useState\<'general' \| 'numbering'\>\('general'\);/g,
  "const [settingsTab, setSettingsTab] = useState<'general' | 'numbering' | 'features' | 'printing'>('general');"
);

// 2. Add extra fields to settings state if needed
// prefix_proforma, prefix_salary, print_footer_note, print_signature_1, print_signature_2
const settingsInitRegex = /const \[settingsForm\, setSettingsForm\] = useState\<any\>\(\{([\s\S]*?)prefix_pay_receipt: 'PD-'/g;
const settingsInitReplace = `const [settingsForm, setSettingsForm] = useState<any>({$1prefix_pay_receipt: 'PD-',
    prefix_proforma: 'PF-', prefix_salary: 'PAY-',
    print_footer_note: '', print_signature_1: '', print_signature_2: '', print_signature_3: ''`;

if (!code.includes('prefix_salary:')) {
   code = code.replace(settingsInitRegex, settingsInitReplace);
}

// 3. Create the tabs menu
const oldTabsMenu = /<div className="border-b border-gray-100 flex gap-6 px-6 bg-white overflow-x-auto">[\s\S]*?<\/div>\s*<div className="p-6 bg-white">/g;
const newTabsMenu = `<div className="border-b border-gray-100 flex gap-6 px-6 bg-white overflow-x-auto">
            <button
               onClick={() => setSettingsTab('general')}
               className={\`py-4 font-bold text-sm whitespace-nowrap transition-colors relative \${settingsTab === 'general' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}\`}
            >
               عمومی و اطلاعات فروشگاه
               {settingsTab === 'general' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setSettingsTab('features')}
               className={\`py-4 font-bold text-sm whitespace-nowrap transition-colors relative \${settingsTab === 'features' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}\`}
            >
               امکانات سیستم (انبار/فروش)
               {settingsTab === 'features' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setSettingsTab('numbering')}
               className={\`py-4 font-bold text-sm whitespace-nowrap transition-colors relative \${settingsTab === 'numbering' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}\`}
            >
               شماره‌گذاری اسناد
               {settingsTab === 'numbering' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
               onClick={() => setSettingsTab('printing')}
               className={\`py-4 font-bold text-sm whitespace-nowrap transition-colors relative \${settingsTab === 'printing' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}\`}
            >
               چاپ و امضائات
               {settingsTab === 'printing' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
          </div>

          <div className="p-6 bg-white">`;

code = code.replace(oldTabsMenu, newTabsMenu);

// 4. We need to refactor the form content
// find the beginning of forms
const generalStart = `{settingsTab === 'general' && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">`;

const generalEnd = `</motion.div>
              )}`;

const oldNumberingContent = /{settingsTab === 'numbering' && \([\s\S]*?<\/motion\.div>\s*\)}/g;

const featuresContent = `

              {settingsTab === 'features' && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col gap-6">
                  <div className="col-span-full border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-500" />
                      تنظیمات انبار و فروش
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer" onClick={() => setSettingsForm({...settingsForm, allowNegativeStock: !settingsForm.allowNegativeStock})}>
                        <div className="pr-2">
                          <div className="font-bold text-gray-800 text-sm">مجوز فروش موجودی منفی انبار</div>
                          <div className="text-xs text-gray-500 mt-1">امکان ثبت فاکتور فروش برای کالاهایی که موجودی آنها صفر یا ناکافی است فراهم می‌شود.</div>
                        </div>
                        <div className={\`w-12 h-6 rounded-full p-1 transition-colors \${settingsForm.allowNegativeStock ? 'bg-indigo-600' : 'bg-gray-300'}\`}>
                          <div className={\`bg-white w-4 h-4 rounded-full shadow-sm transition-transform transform \${settingsForm.allowNegativeStock ? '-translate-x-6' : 'translate-x-0'}\`}></div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer" onClick={() => setSettingsForm({...settingsForm, requireWarehouse: !settingsForm.requireWarehouse})}>
                        <div className="pr-2">
                          <div className="font-bold text-gray-800 text-sm">اجباری بودن انتخاب انبار در ردیف فاکتور</div>
                          <div className="text-xs text-gray-500 mt-1">هنگام ثبت فاکتورهای فروش و خرید، انتخاب انبار برای هر سطر کالا الزامی خواهد شد.</div>
                        </div>
                        <div className={\`w-12 h-6 rounded-full p-1 transition-colors \${settingsForm.requireWarehouse ? 'bg-indigo-600' : 'bg-gray-300'}\`}>
                          <div className={\`bg-white w-4 h-4 rounded-full shadow-sm transition-transform transform \${settingsForm.requireWarehouse ? '-translate-x-6' : 'translate-x-0'}\`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
`;

const printContent = `

              {settingsTab === 'printing' && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col gap-6">
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">تنظیمات چاپ فاکتور و رسید</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="w-full text-right md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">یادداشت ثابت انتهای فاکتورها (فوتر)</label>
                          <textarea
                            value={settingsForm.print_footer_note || ''}
                            onChange={e => setSettingsForm({...settingsForm, print_footer_note: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                            placeholder="متنی که مایلید همیشه در پایین فاکتورهای چاپ شده نمایش داده شود..."
                            rows={3}
                          ></textarea>
                       </div>
                       
                       <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان امضاکننده 1 (خریدار/تحویل‌گیرنده)</label>
                          <input
                            type="text"
                            value={settingsForm.print_signature_1 || ''}
                            onChange={e => setSettingsForm({...settingsForm, print_signature_1: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                            placeholder="مثال: مهر و امضای خریدار"
                          />
                       </div>

                       <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان امضاکننده 2 (فروشنده/تحویل‌دهنده)</label>
                          <input
                            type="text"
                            value={settingsForm.print_signature_2 || ''}
                            onChange={e => setSettingsForm({...settingsForm, print_signature_2: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                            placeholder="مثال: مهر و امضای فروشنده"
                          />
                       </div>
                       
                       <div className="w-full text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان امضاکننده 3 (مدیر/تایید کننده)</label>
                          <input
                            type="text"
                            value={settingsForm.print_signature_3 || ''}
                            onChange={e => setSettingsForm({...settingsForm, print_signature_3: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                            placeholder="مثال: مدیریت"
                          />
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
`;

const numberingContent = `
              {settingsTab === 'numbering' && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col gap-6">
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl mb-2">
                    <p className="text-sm text-indigo-800 font-medium">در این بخش پیشوند شماره‌گذاری خودکار انواع اسناد را تعیین کنید.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="w-full text-right">
                      <label className="block text-sm font-bold text-gray-700 mb-2">فاکتور فروش</label>
                      <input
                        type="text"
                        value={settingsForm.prefix_sale || ''}
                        onChange={e => setSettingsForm({...settingsForm, prefix_sale: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                        dir="ltr"
                        placeholder="INV-"
                      />
                    </div>
                    
                    <div className="w-full text-right">
                      <label className="block text-sm font-bold text-gray-700 mb-2">پیش‌فاکتور (Proforma)</label>
                      <input
                        type="text"
                        value={settingsForm.prefix_proforma || ''}
                        onChange={e => setSettingsForm({...settingsForm, prefix_proforma: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                        dir="ltr"
                        placeholder="PF-"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-bold text-gray-700 mb-2">فاکتور خرید</label>
                      <input
                        type="text"
                        value={settingsForm.prefix_purchase || ''}
                        onChange={e => setSettingsForm({...settingsForm, prefix_purchase: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                        dir="ltr"
                        placeholder="PUR-"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-bold text-gray-700 mb-2">رسید انبار (ورود)</label>
                      <input
                        type="text"
                        value={settingsForm.prefix_warehouse_receipt || ''}
                        onChange={e => setSettingsForm({...settingsForm, prefix_warehouse_receipt: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                        dir="ltr"
                        placeholder="REC-"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-bold text-gray-700 mb-2">حواله انبار (خروج)</label>
                      <input
                        type="text"
                        value={settingsForm.prefix_warehouse_remittance || ''}
                        onChange={e => setSettingsForm({...settingsForm, prefix_warehouse_remittance: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                        dir="ltr"
                        placeholder="REM-"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-bold text-gray-700 mb-2">سند دریافت وجه</label>
                      <input
                        type="text"
                        value={settingsForm.prefix_receive_receipt || ''}
                        onChange={e => setSettingsForm({...settingsForm, prefix_receive_receipt: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                        dir="ltr"
                        placeholder="RD-"
                      />
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-bold text-gray-700 mb-2">سند پرداخت وجه</label>
                      <input
                        type="text"
                        value={settingsForm.prefix_pay_receipt || ''}
                        onChange={e => setSettingsForm({...settingsForm, prefix_pay_receipt: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                        dir="ltr"
                        placeholder="PD-"
                      />
                    </div>
                    
                    <div className="w-full text-right">
                      <label className="block text-sm font-bold text-gray-700 mb-2">فیش حقوق و دستمزد</label>
                      <input
                        type="text"
                        value={settingsForm.prefix_salary || ''}
                        onChange={e => setSettingsForm({...settingsForm, prefix_salary: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                        dir="ltr"
                        placeholder="PAY-"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
`;

code = code.replace(oldNumberingContent, featuresContent + printContent + numberingContent);

// Also remove from general settings:
// The Warehouse section in general settings
const warehouseConfigRegex = /<div className="col-span-full border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-6">[\s\S]*?<h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">[\s\S]*?تنظیمات انبار[\s\S]*?<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;

code = code.replace(warehouseConfigRegex, '');

fs.writeFileSync('src/App.tsx', code);
console.log('done updating settings page structure');
