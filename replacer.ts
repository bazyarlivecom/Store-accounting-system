import fs from "fs";

const content = fs.readFileSync("src/App.tsx", "utf-8");

const startStr = `                ) : activeTab === "settings" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl mx-auto"
                  >`;

const endStr = `                  </motion.div>
                ) : activeTab === "inventory_report" ? (
                  <InventoryReport showNotification={showNotification} />`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end index.");
  process.exit(1);
}

const replacement = `                ) : activeTab === "settings" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50/50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-7xl mx-auto h-[85vh] flex flex-col"
                  >
                    <div className="bg-gradient-to-l from-indigo-900 to-indigo-700 px-8 py-5 flex items-center justify-between shrink-0 shadow-md">
                      <div className="flex flex-col">
                        <h1 className="text-xl font-extrabold text-white flex items-center gap-3">
                          <Settings className="w-6 h-6 text-indigo-200" />
                          تنظیمات جامع سیستم
                        </h1>
                        <p className="mt-1.5 text-indigo-100/80 text-sm max-w-xl leading-relaxed">
                          پیکربندی کامل امکانات فروشگاه، حسابداری، اطلاع‌رسانی، شخصی‌سازی چاپ و شماره‌گذاری اسناد.
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          confirmAction(
                            "آیا از ذخیره تنظیمات اطمینان دارید؟",
                            () => handleSaveSettings(e as any)
                          );
                        }}
                        disabled={submittingSettings}
                        className="px-6 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-black transition-all shadow-sm flex items-center gap-2 cursor-pointer border-none disabled:opacity-50"
                      >
                        {submittingSettings ? (
                          <span className="w-5 h-5 border-2 border-indigo-700/30 border-t-indigo-700 rounded-full animate-spin"></span>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        ذخیره تنظیمات
                      </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                      {/* Sidebar */}
                      <div className="w-64 bg-white border-l border-gray-200 shrink-0 flex flex-col overflow-y-auto custom-scrollbar p-4 gap-2">
                        {[
                          { id: "general", label: "اطلاعات پایه و عمومی", icon: Store },
                          { id: "features", label: "تنظیمات انبار و فروش", icon: Box },
                          { id: "financial", label: "مالی و حسابداری", icon: Calculator },
                          { id: "numbering", label: "شماره‌گذاری اسناد", icon: FileText },
                          { id: "printing", label: "چاپ و قالب فاکتور", icon: Printer },
                          { id: "notification", label: "پیامک و ارتباطات", icon: Bell },
                        ].map((tab) => {
                          const Icon = tab.icon;
                          const isActive = settingsTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setSettingsTab(tab.id)}
                              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold \${
                                isActive 
                                  ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" 
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                              }\`}
                            >
                              <Icon className={\`w-5 h-5 \${isActive ? "text-indigo-600" : "text-gray-400"}\`} />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 bg-gray-50/30 overflow-y-auto custom-scrollbar p-6 lg:p-8">
                        {successMsg && (
                          <div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 border border-emerald-100 shadow-sm">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">{successMsg}</span>
                          </div>
                        )}
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                          {settingsTab === "general" && (
                            <div className="flex flex-col gap-8">
                              <div>
                                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                  <Store className="w-5 h-5 text-indigo-500" />
                                  پروفایل کسب و کار
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="w-full text-right md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">لوگو فروشگاه / شرکت</label>
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                      {settingsForm.logoUrl ? (
                                        <div className="relative group">
                                          <img
                                            src={settingsForm.logoUrl}
                                            alt="Logo preview"
                                            className="w-16 h-16 object-contain rounded bg-white shadow-sm border border-gray-100"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => setSettingsForm({ ...settingsForm, logoUrl: "" })}
                                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
                                          <Image className="w-6 h-6" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm inline-block">
                                          انتخاب تصویر جدید
                                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2 font-medium">حداکثر حجم فایل ۲ مگابایت. فرمت‌های JPG و PNG.</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-full text-right md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">نام فروشگاه / شرکت</label>
                                    <input
                                      type="text"
                                      value={settingsForm.storeName}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                                      required
                                    />
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">تلفن تماس</label>
                                    <input
                                      type="text"
                                      value={settingsForm.phone || ""}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                                      dir="ltr"
                                    />
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">آدرس</label>
                                    <input
                                      type="text"
                                      value={settingsForm.address || ""}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-gray-100 pt-8">
                                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                  <Globe className="w-5 h-5 text-indigo-500" />
                                  منطقه و شخصی‌سازی ظاهر
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">فونت سیستم</label>
                                    <select
                                      value={settingsForm.fontFamily || "Vazirmatn"}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, fontFamily: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold"
                                    >
                                      <option value="Vazirmatn">وزیرمتن (Vazirmatn)</option>
                                      <option value="IRANYekanXFaNum">ایران یکان (IRANYekanX)</option>
                                      <option value="Lalezar">لاله‌زار (Lalezar)</option>
                                      <option value="Readex Pro">ریدکس پرو (Readex Pro)</option>
                                      <option value="Cairo">قاهره (Cairo)</option>
                                      <option value="Amiri">امیری (Amiri)</option>
                                      <option value="Changa">چنگا (Changa)</option>
                                      <option value="Tahoma">تاهوما (Tahoma)</option>
                                    </select>
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">پوسته و تم سیستم</label>
                                    <select
                                      value={settingsForm.theme || "classic"}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, theme: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold"
                                    >
                                      <option value="classic">کلاسیک سرمه‌ای (Classic Indigo)</option>
                                      <option value="gmail">گوگل جیمیل سرخ (Google Gmail Red)</option>
                                    </select>
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">واحد پولی (غیرقابل تغییر)</label>
                                    <input
                                      type="text"
                                      value={storeSettings.currency}
                                      disabled
                                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 shadow-sm font-bold cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">تقویم پایه</label>
                                    <input
                                      type="text"
                                      value={storeSettings.calendarType === "gregorian" ? "میلادی" : "شمسی (جلالی)"}
                                      disabled
                                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 shadow-sm font-bold cursor-not-allowed"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {settingsTab === "features" && (
                            <div>
                              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                <Box className="w-5 h-5 text-indigo-500" />
                                پیکربندی رفتار انبار و فاکتورها
                              </h3>
                              <div className="grid gap-4">
                                <label className="flex items-start gap-4 p-5 border border-gray-200 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all shadow-sm">
                                  <div className="mt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={settingsForm.allowNegativeStock || false}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, allowNegativeStock: e.target.checked })}
                                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900 mb-1">مجوز فروش موجودی منفی انبار</div>
                                    <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                      اجازه ثبت فاکتور فروش برای کالاهایی که موجودی فعلی آن‌ها صفر یا کمتر از مقدار درخواستی است. 
                                      (مناسب برای پیش‌فروش یا عدم ثبت دقیق ورود کالاها)
                                    </div>
                                  </div>
                                </label>
                                
                                <label className="flex items-start gap-4 p-5 border border-gray-200 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all shadow-sm">
                                  <div className="mt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={settingsForm.requireWarehouse || false}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, requireWarehouse: e.target.checked })}
                                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900 mb-1">الزام انتخاب انبار در سطرهای فاکتور</div>
                                    <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                      هنگام ثبت فاکتورهای فروش و خرید، کاربر ملزم به مشخص کردن انبار برای هر کالا خواهد بود. 
                                      (در غیر این‌صورت انبار پیش‌فرض لحاظ می‌شود)
                                    </div>
                                  </div>
                                </label>

                                <label className="flex items-start gap-4 p-5 border border-gray-200 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all shadow-sm">
                                  <div className="mt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={settingsForm.allowDuplicateInvoiceRows || false}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, allowDuplicateInvoiceRows: e.target.checked })}
                                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900 mb-1">مجوز تکرار کالا در سطرهای مجزا</div>
                                    <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                      در صورت فعال بودن، افزودن کالای تکراری به فاکتور، یک سطر جدید ایجاد می‌کند. 
                                      در غیر اینصورت، صرفاً تعداد همان کالای قبلی در فاکتور اضافه خواهد شد.
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          )}

                          {settingsTab === "financial" && (
                            <div>
                              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-indigo-500" />
                                تنظیمات پایه مالی و حسابداری
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="w-full text-right">
                                  <label className="block text-sm font-bold text-gray-700 mb-2">درصد مالیات بر ارزش افزوده پیش‌فرض</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={settingsForm.default_tax_percent !== undefined ? settingsForm.default_tax_percent : 0}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, default_tax_percent: parseFloat(e.target.value) || 0 })}
                                      className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold text-left"
                                      dir="ltr"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2 font-medium">این درصد هنگام ایجاد فاکتور جدید به صورت خودکار اعمال می‌شود.</p>
                                </div>

                                <div className="w-full text-right">
                                  <label className="block text-sm font-bold text-gray-700 mb-2">درصد تخفیف پیش‌فرض خطوط</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={settingsForm.default_discount_percent !== undefined ? settingsForm.default_discount_percent : 0}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, default_discount_percent: parseFloat(e.target.value) || 0 })}
                                      className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold text-left"
                                      dir="ltr"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-8 border-t border-gray-100 pt-8">
                                <h4 className="text-md font-black text-gray-800 mb-4">اسناد حسابداری</h4>
                                <label className="flex items-start gap-4 p-5 border border-gray-200 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all shadow-sm">
                                  <div className="mt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={settingsForm.auto_generate_accounting_docs !== false}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, auto_generate_accounting_docs: e.target.checked })}
                                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900 mb-1">صدور خودکار اسناد حسابداری</div>
                                    <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                      با ثبت هر فاکتور یا رسید مالی، سیستم به صورت خودکار سند حسابداری متناظر با آن را در دفتر روزنامه ثبت می‌کند. 
                                      غیرفعال‌سازی این گزینه نیازمند ثبت دستی اسناد است.
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          )}

                          {settingsTab === "numbering" && (
                            <div>
                              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                الگوی شماره‌گذاری اسناد
                              </h3>
                              <p className="text-sm text-gray-600 font-medium mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                پیشوند نمایشی، شماره شروع و تعداد ارقام ثابت برای هر نوع سند را تنظیم کنید.
                              </p>
                              
                              <div className="space-y-8">
                                {[
                                  {
                                    title: "فروش و انبار",
                                    items: [
                                      { key: "sale", label: "فاکتور فروش", defaultPrefix: "INV-" },
                                      { key: "proforma", label: "پیش‌فاکتور", defaultPrefix: "PF-" },
                                      { key: "purchase", label: "فاکتور خرید", defaultPrefix: "PUR-" },
                                      { key: "sale_return", label: "برگشت از فروش", defaultPrefix: "RTN-S-" },
                                      { key: "purchase_return", label: "برگشت از خرید", defaultPrefix: "RTN-P-" },
                                      { key: "warehouse_receipt", label: "رسید انبار (ورود)", defaultPrefix: "REC-" },
                                      { key: "warehouse_remittance", label: "حواله انبار (خروج)", defaultPrefix: "REM-" },
                                    ],
                                  },
                                  {
                                    title: "خزانه‌داری",
                                    items: [
                                      { key: "receive_receipt", label: "رسید دریافت", defaultPrefix: "RD-" },
                                      { key: "pay_receipt", label: "رسید پرداخت", defaultPrefix: "PD-" },
                                      { key: "salary", label: "فیش حقوقی", defaultPrefix: "PAY-" },
                                    ],
                                  },
                                  {
                                    title: "سایر",
                                    items: [
                                      { key: "person", label: "کد شخص/مشتری", defaultPrefix: "P-" },
                                      { key: "product", label: "کد کالا/خدمات", defaultPrefix: "PRD-" },
                                      { key: "accounting_document", label: "سند حسابداری", defaultPrefix: "ACC-" },
                                    ],
                                  }
                                ].map((section, sIndex) => (
                                  <div key={sIndex} className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
                                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 font-black text-gray-800">
                                      {section.title}
                                    </div>
                                    <table className="w-full text-sm text-right">
                                      <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs">
                                        <tr>
                                          <th className="p-4 border-b border-gray-200 w-1/4">نوع فرم</th>
                                          <th className="p-4 border-b border-gray-200 w-1/4">پیشوند نمادین</th>
                                          <th className="p-4 border-b border-gray-200 w-1/4">شماره شروع</th>
                                          <th className="p-4 border-b border-gray-200 w-1/4">تعداد ارقام ثابت</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {section.items.map((doc) => (
                                          <tr key={doc.key} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-bold text-gray-800 border-l border-gray-100">{doc.label}</td>
                                            <td className="p-4 border-l border-gray-100">
                                              <input
                                                type="text"
                                                value={settingsForm[\`prefix_\${doc.key}\`] || ""}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, [\`prefix_\${doc.key}\`]: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-mono text-left bg-white shadow-sm"
                                                dir="ltr"
                                                placeholder={doc.defaultPrefix}
                                              />
                                            </td>
                                            <td className="p-4 border-l border-gray-100">
                                              <input
                                                type="number"
                                                value={settingsForm[\`start_\${doc.key}\`] || ""}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, [\`start_\${doc.key}\`]: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-mono text-left bg-white shadow-sm"
                                                dir="ltr"
                                                placeholder="1000"
                                              />
                                            </td>
                                            <td className="p-4">
                                              <input
                                                type="number" min="1" max="15"
                                                value={settingsForm[\`len_\${doc.key}\`] || ""}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, [\`len_\${doc.key}\`]: parseInt(e.target.value) || "" })}
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-mono text-left bg-white shadow-sm"
                                                dir="ltr"
                                                placeholder="6"
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {settingsTab === "printing" && (
                            <div>
                              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                <Printer className="w-5 h-5 text-indigo-500" />
                                تنظیمات قالب چاپ
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">سایز پیش‌فرض کاغذ</label>
                                    <select
                                      value={settingsForm.print_paper_size || "A4"}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, print_paper_size: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold"
                                    >
                                      <option value="A4">A4 (استاندارد)</option>
                                      <option value="A5">A5 (نصف صفحه)</option>
                                      <option value="receipt80">فیش پرینتر عرض 80mm</option>
                                      <option value="receipt58">فیش پرینتر عرض 58mm</option>
                                    </select>
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">نمایش لوگو در فاکتور</label>
                                    <select
                                      value={settingsForm.print_show_logo !== false ? "true" : "false"}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, print_show_logo: e.target.value === "true" })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold"
                                    >
                                      <option value="true">بله، نمایش داده شود</option>
                                      <option value="false">خیر، مخفی شود</option>
                                    </select>
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">نمایش خلاصه وضعیت مالی مشتری</label>
                                    <select
                                      value={settingsForm.print_show_financial !== false ? "true" : "false"}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, print_show_financial: e.target.value === "true" })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold"
                                    >
                                      <option value="true">بله، نمایش داده شود</option>
                                      <option value="false">خیر، مخفی شود</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">عنوان امضاکننده اول (چپ)</label>
                                    <input
                                      type="text"
                                      value={settingsForm.print_signature_1 || ""}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, print_signature_1: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                                      placeholder="مثال: مهر و امضای خریدار"
                                    />
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">عنوان امضاکننده دوم (وسط)</label>
                                    <input
                                      type="text"
                                      value={settingsForm.print_signature_2 || ""}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, print_signature_2: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                                      placeholder="مثال: تحویل‌دهنده"
                                    />
                                  </div>
                                  <div className="w-full text-right">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">عنوان امضاکننده سوم (راست)</label>
                                    <input
                                      type="text"
                                      value={settingsForm.print_signature_3 || ""}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, print_signature_3: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                                      placeholder="مثال: مهر و امضای فروشنده"
                                    />
                                  </div>
                                </div>

                                <div className="w-full text-right md:col-span-2">
                                  <label className="block text-sm font-bold text-gray-700 mb-2">یادداشت ثابت انتهای فاکتورها (فوتر)</label>
                                  <textarea
                                    value={settingsForm.print_footer_note || ""}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, print_footer_note: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium h-24"
                                    placeholder="قوانین تعویض کالا یا تشکر از خرید و ..."
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {settingsTab === "notification" && (
                            <div className="space-y-8">
                              <div>
                                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                  <Bell className="w-5 h-5 text-indigo-500" />
                                  درگاه‌های ارتباطی
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="w-full text-right md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">سرویس اصلی پیام‌رسان</label>
                                    <div className="flex flex-wrap gap-4">
                                      {[
                                        { id: "none", label: "غیرفعال" },
                                        { id: "sms", label: "سامانه پیامکی ابری (API)" },
                                        { id: "whatsapp", label: "واتساپ بیزینس" },
                                        { id: "gsm", label: "مودم GSM محلی" }
                                      ].map((method) => (
                                        <label key={method.id} className={\`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all \${
                                          settingsForm.notify_method === method.id 
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm" 
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                        }\`}>
                                          <input 
                                            type="radio" 
                                            name="notify_method" 
                                            className="hidden" 
                                            checked={settingsForm.notify_method === method.id}
                                            onChange={() => setSettingsForm({ ...settingsForm, notify_method: method.id })} 
                                          />
                                          <span className="font-bold text-sm">{method.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  {settingsForm.notify_method && settingsForm.notify_method !== "none" && (
                                    <>
                                      <div className="w-full text-right md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">کلید API / تنظیمات درگاه / پورت COM</label>
                                        <input
                                          type="text"
                                          value={settingsForm.notify_api_key || ""}
                                          onChange={(e) => setSettingsForm({ ...settingsForm, notify_api_key: e.target.value })}
                                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                                          placeholder="Token or Port (e.g. COM3)"
                                          dir="ltr"
                                        />
                                      </div>
                                      <div className="w-full text-right md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">خط فرستنده / شماره دستگاه</label>
                                        <input
                                          type="text"
                                          value={settingsForm.notify_sender_number || ""}
                                          onChange={(e) => setSettingsForm({ ...settingsForm, notify_sender_number: e.target.value })}
                                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm font-mono text-left"
                                          placeholder="+989..."
                                          dir="ltr"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="border-t border-gray-100 pt-8">
                                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                                  <CheckSquare className="w-5 h-5 text-indigo-500" />
                                  رویدادهای خودکار اطلاع‌رسانی
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                                    <input
                                      type="checkbox"
                                      checked={settingsForm.notify_on_invoice || false}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, notify_on_invoice: e.target.checked })}
                                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-800 font-bold">ارسال فاکتور خرید/فروش برای مشتری</span>
                                  </label>

                                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                                    <input
                                      type="checkbox"
                                      checked={settingsForm.notify_on_receipt || false}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, notify_on_receipt: e.target.checked })}
                                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-800 font-bold">ارسال رسید ثبت دریافتی / پرداختی</span>
                                  </label>

                                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                                    <input
                                      type="checkbox"
                                      checked={settingsForm.notify_on_balance || false}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, notify_on_balance: e.target.checked })}
                                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-800 font-bold">گزارش مانده حساب (پس از هر تراکنش)</span>
                                  </label>
                                </div>
                              </div>

                              <div className="border-t border-gray-100 pt-8">
                                <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    هشدار سقف اعتباری مشتریان
                                  </h3>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="font-bold text-sm text-gray-600">فعال‌سازی سیستم هشدار</span>
                                    <div className={\`w-12 h-6 rounded-full p-1 transition-colors \${settingsForm.smsDebtThresholdEnabled ? "bg-indigo-600" : "bg-gray-300"}\`}>
                                      <div className={\`bg-white w-4 h-4 rounded-full shadow-sm transition-transform transform \${settingsForm.smsDebtThresholdEnabled ? "-translate-x-6" : "translate-x-0"}\`}></div>
                                    </div>
                                    <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={settingsForm.smsDebtThresholdEnabled || false}
                                      onChange={(e) => setSettingsForm({ ...settingsForm, smsDebtThresholdEnabled: e.target.checked })}
                                    />
                                  </label>
                                </div>
                                
                                {settingsForm.smsDebtThresholdEnabled && (
                                  <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-100 grid grid-cols-1 gap-6">
                                    <div className="w-full text-right">
                                      <label className="block text-sm font-bold text-gray-700 mb-2">سقف مجاز بدهی عمومی (تومان)</label>
                                      <CurrencyInput
                                        value={settingsForm.smsDebtThresholdAmount || ""}
                                        onChange={(e: any) =>
                                          setSettingsForm({ ...settingsForm, smsDebtThresholdAmount: Number(e.target.value) || 0 })
                                        }
                                        placeholder="مثال: 50,000,000"
                                        className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                        currencyLabel="تومان"
                                      />
                                    </div>
                                    <div className="w-full text-right">
                                      <label className="block text-sm font-bold text-gray-700 mb-2">متن پیامک هشدار</label>
                                      <textarea
                                        value={settingsForm.smsDebtThresholdMessage || "مشتری گرامی، مانده بدهی شما از سقف مجاز عبور کرده است. لطفا نسبت به تسویه حساب اقدام نمایید."}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, smsDebtThresholdMessage: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all h-24"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync("src/App.tsx", newContent, "utf-8");
console.log("Replaced successfully!");
