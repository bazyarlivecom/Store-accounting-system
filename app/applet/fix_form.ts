import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<form id="settingsForm" onSubmit=\{\(e\) => \{ e\.preventDefault\(\); confirmAction\('آیا از ذخیره تنظیمات اطمینان دارید\؟', \(\) => handleSaveSettings\(e as any\)\) \}\} className="flex flex-col gap-6">[\s\S]*?<\/form>/g;

const newForm = `<form id="settingsForm" onSubmit={(e) => { e.preventDefault(); confirmAction('آیا از ذخیره تنظیمات اطمینان دارید؟', () => handleSaveSettings(e as any)) }} className="flex flex-col gap-6">
              
              {settingsTab === 'general' && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full text-right md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام فروشگاه / شرکت</label>
                      <input
                        type="text"
                        value={settingsForm.storeName}
                        onChange={e => setSettingsForm({...settingsForm, storeName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        required
                      />
                    </div>
                    
                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">واحد پولی سیستم</label>
                      <select
                        value={settingsForm.currency}
                        onChange={e => setSettingsForm({...settingsForm, currency: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white"
                        dir="ltr"
                      >
                        <option value="تومان">تومان (Toman)</option>
                        <option value="ریال">ریال (Rial)</option>
                        <option value="$">دلار آمریکا ($)</option>
                        <option value="€">یورو (€)</option>
                        <option value="£">پوند (£)</option>
                        <option value="دینار">دینار</option>
                        <option value="افغانی">افغانی</option>
                      </select>
                    </div>

                    <div className="w-full text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">تلفن تماس</label>
                      <input
                        type="text"
                        value={settingsForm.phone || ''}
                        onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        dir="ltr"
                      />
                    </div>

                    <div className="w-full text-right md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">آدرس</label>
                      <input
                        type="text"
                        value={settingsForm.address || ''}
                        onChange={e => setSettingsForm({...settingsForm, address: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'features' && (
                <div className="flex flex-col gap-6">
                  <div className="col-span-full border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
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
                </div>
              )}

              {settingsTab === 'numbering' && (
                <div className="flex flex-col gap-6">
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
                </div>
              )}

              {settingsTab === 'printing' && (
                <div className="flex flex-col gap-6">
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
                </div>
              )}

              <div className="flex justify-start border-t border-gray-100 pt-6 mt-4">
                <button
                  type="submit"
                  disabled={submittingSettings}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submittingSettings ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : <Save className="w-5 h-5" />}
                  ذخیره تغییرات و اعمال در سیستم
                </button>
              </div>
            </form>`;

code = code.replace(regex, newForm);

fs.writeFileSync('src/App.tsx', code);
console.log('rewrote form');
