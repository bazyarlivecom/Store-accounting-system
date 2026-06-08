import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const navStart = content.indexOf('{/* Horizontal Navigation Menu starting from right */}');
if (navStart === -1) throw new Error("Could not find horizontal navigation");

const beforeNav = content.substring(0, navStart);

const mobileHeaderStart = content.indexOf('<div className="flex-1 p-4 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">');
if (mobileHeaderStart === -1) throw new Error("Could not find flexible main area start");

const newMenuCode = `{/* Horizontal Navigation Menu starting from right */}
          <div className="flex items-end px-6 pb-4 overflow-x-auto no-scrollbar border-t border-gray-100 bg-gray-50/50 pt-6 hide-scrollbar gap-4 styled-scrollbar">
            {[
              {
                title: 'عمومی',
                items: [
                  { id: 'dashboard', label: 'داشبورد', icon: <BarChart3 className="w-4 h-4" /> },
                  { id: 'checklist', label: 'چک‌لیست', icon: <ClipboardList className="w-4 h-4" /> },
                ]
              },
              {
                title: 'عملیات بازرگانی',
                items: [
                  { id: 'create_sale', label: 'فاکتور فروش', icon: <Plus className="w-4 h-4" /> },
                  { id: 'create_purchase', label: 'فاکتور خرید', icon: <ShoppingCart className="w-4 h-4" /> },
                  { id: 'list_invoices', label: 'لیست فاکتورها', icon: <FileText className="w-4 h-4" /> },
                ]
              },
              {
                title: 'خزانه‌داری',
                items: [
                  { id: 'create_receipt', label: 'دریافت وجه', icon: <ArrowDownToLine className="w-4 h-4" /> },
                  { id: 'create_pay_receipt', label: 'پرداخت وجه', icon: <ArrowUpFromLine className="w-4 h-4" /> },
                  { id: 'list_pay_receipt', label: 'اسناد نقد و بانک', icon: <FileSpreadsheet className="w-4 h-4" /> },
                ]
              },
              {
                title: 'حقوق و دستمزد',
                items: [
                  { id: 'create_salary_payroll', label: 'ثبت کارکرد', icon: <Users className="w-4 h-4" /> },
                  { id: 'list_salary_payroll', label: 'لیست حقوق', icon: <BookOpen className="w-4 h-4" /> },
                ]
              },
              {
                title: 'اطلاعات پایه',
                items: [
                  { id: 'products', label: 'کالاها', icon: <Package className="w-4 h-4" /> },
                  { id: 'product_categories', label: 'گروه‌ها', icon: <List className="w-4 h-4" /> },
                  { id: 'persons', label: 'مشتریان / تامین‌کنندگان', icon: <Users className="w-4 h-4" /> },
                  { id: 'accounts', label: 'حساب‌های بانکی', icon: <CreditCard className="w-4 h-4" /> },
                  { id: 'cashboxes', label: 'صندوق‌ها', icon: <Wallet className="w-4 h-4" /> },
                ]
              },
              {
                title: 'گزارشات',
                items: [
                  { id: 'financial_report', label: 'ترازنامه مالی', icon: <TrendingUp className="w-4 h-4" /> },
                  { id: 'person_ledger', label: 'دفتر کل اشخاص', icon: <User className="w-4 h-4" /> },
                ]
              },
              {
                title: 'سیستم',
                items: [
                  { id: 'settings', label: 'تنظیمات کسب و کار', icon: <Settings className="w-4 h-4" /> },
                  { id: 'database', label: 'پشتیبان‌گیری', icon: <Database className="w-4 h-4" /> },
                ]
              }
            ].map((group, index) => (
              <div key={index} className="flex flex-col relative shrink-0 border border-gray-200/60 rounded-2xl bg-white p-1.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="absolute -top-3 right-3 px-2 bg-gray-100 text-[10px] font-black text-gray-500 rounded-full border border-white shrink-0 shadow-sm shadow-black/5 flex items-center z-20">
                  {group.title}
                </div>
                <div className="flex items-center gap-1 relative z-10 pt-1">
                  {group.items.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={\`flex items-center gap-1.5 px-3.5 py-2.5 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 relative group overflow-hidden \${
                        activeTab === tab.id 
                          ? 'text-indigo-700' 
                          : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                      }\`}
                    >
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="activeTabBadge"
                          className="absolute inset-0 bg-indigo-50 border border-indigo-100/50 rounded-xl"
                        />
                      )}
                      
                      <span className={\`relative z-10 flex items-center gap-1.5 \${activeTab === tab.id ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}\`}>
                        {tab.icon}
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        `;

content = beforeNav + newMenuCode + content.substring(mobileHeaderStart);

fs.writeFileSync('src/App.tsx', content);
