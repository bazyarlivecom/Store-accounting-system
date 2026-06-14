import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const navStart = content.indexOf('{/* Horizontal Navigation Menu starting from right */}');
const navEndStr = '        {/* Main Content Area */}';
const navEnd = content.indexOf(navEndStr);

if (navStart === -1 || navEnd === -1) {
  throw new Error("Could not find boundaries");
}

const beforeNav = content.substring(0, navStart);
const afterNav = content.substring(navEnd);

const newMenuCode = `{/* Horizontal Navigation Menu starting from right */}
        <div className="flex items-center px-4 bg-white border-t border-gray-100 shadow-sm relative z-30 flex-wrap" dir="rtl">
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
                { id: 'update', label: 'بروزرسانی سیستم', icon: <RefreshCw className="w-4 h-4" /> },
              ]
            }
          ].map((group, index) => (
            <div key={index} className="group relative">
              <div className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-bold text-gray-700 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer transition-colors border-b-2 border-transparent hover:border-indigo-600">
                {group.title}
                <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
              </div>
              <div className="absolute top-full right-0 mt-0 w-56 bg-white border border-gray-100 shadow-xl rounded-bl-xl rounded-br-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-1 pointer-events-none group-hover:pointer-events-auto origin-top-right transform scale-95 group-hover:scale-100">
                {group.items.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={\`flex items-center justify-start gap-2.5 px-4 py-2.5 w-full text-sm transition-colors \${
                      activeTab === tab.id 
                        ? 'bg-indigo-50 text-indigo-700 font-bold border-r-2 border-indigo-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 font-semibold border-r-2 border-transparent'
                    }\`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

`;

// We also need to remove the extra closing `</div>` that was part of the original flex-col Desktop header,
// So let's output it exactly and correctly. Wait, the old structure ended with Mobile Header.
// Since we removed Mobile Header completely, let's just make sure we close Desktop Header flex col.

content = beforeNav + newMenuCode + afterNav;

fs.writeFileSync('src/App.tsx', content);
