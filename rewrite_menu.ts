import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The aside code
const asideRegex = /<aside className=\{\`w-64 bg-white border-l border-gray-100 flex flex-col fixed inset-y-0 right-0 h-full z-40 transition-transform duration-300 transform md:translate-x-0 \$\{isSidebarOpen \? 'translate-x-0' : 'translate-x-full'\}\`\}>/;

content = content.replace(asideRegex, 
  '<aside className={`fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-gray-100 flex flex-col transition-transform duration-300 transform md:hidden ${isSidebarOpen ? \'translate-x-0\' : \'translate-x-full\'}`}>'
);

const mdMr64Regex = /<div className="flex-1 flex flex-col w-full min-w-0 md:mr-64 transition-all duration-300">/;
content = content.replace(mdMr64Regex, '<div className="flex-1 flex flex-col w-full min-w-0 transition-all duration-300">');

const desktopHeaderMatch = `<div className="hidden md:flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-3xs" dir="rtl">\n          <div className="text-gray-900 font-extrabold text-lg flex items-center gap-2">\n            <Receipt className="w-5 h-5 text-indigo-600" />\n            سیستم مدیریت جامع شرکت\n          </div>`;
const newDesktopHeader = `<div className="hidden md:flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-3xs" dir="rtl">\n          <div className="text-gray-900 font-extrabold text-lg flex items-center gap-2">\n            {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="w-8 h-8 rounded" /> : <Receipt className="w-5 h-5 text-indigo-600" />}\n            {storeSettings.storeName || 'سیستم مدیریت جامع شرکت'}\n          </div>`;
content = content.replace(desktopHeaderMatch, newDesktopHeader);

// We need to add the horizontal navigation to the Desktop Header
const headerFullRegex = /\{\/\* Desktop Header \*\/\}[\s\S]*?<\/div>\s*\{\/\* Mobile Header \*\/\}/;

const hNavHTML = `
        {/* Desktop Header & Horizontal Menu */}
        <div className="hidden md:flex flex-col bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm" dir="rtl">
          <div className="flex items-center justify-between p-4">
            <div className="text-gray-900 font-extrabold text-lg flex items-center gap-2">
              {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="w-8 h-8 rounded" /> : <Receipt className="w-6 h-6 text-indigo-600" />}
              {storeSettings.storeName || 'سیستم مدیریت جامع شرکت'}
            </div>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-gray-100 rounded-full shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-gray-700">
                {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date())}
              </span>
              <span className="h-3 w-px bg-gray-200 my-0.5"></span>
              <span className="text-[11px] font-semibold text-gray-500">
                {storeSettings.currency ? \`ارز مبنا: \${storeSettings.currency}\` : 'تومان'}
              </span>
            </div>
          </div>
          
          {/* Horizontal Navigation Menu starting from right */}
          <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar justify-start border-t border-gray-50 pt-2">
            {[
              { id: 'dashboard', label: 'داشبورد جامع', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'create_sale', label: 'فروش', icon: <Plus className="w-4 h-4" /> },
              { id: 'create_purchase', label: 'خرید', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'list_invoices', label: 'فاکتورها', icon: <FileText className="w-4 h-4" /> },
              { id: 'create_receipt', label: 'دریافت', icon: <ArrowDownToLine className="w-4 h-4" /> },
              { id: 'create_pay_receipt', label: 'پرداخت', icon: <ArrowUpFromLine className="w-4 h-4" /> },
              { id: 'list_pay_receipt', label: 'اسناد دریافت/پرداخت', icon: <FileSpreadsheet className="w-4 h-4" /> },
              { id: 'create_salary_payroll', label: 'ثبت دستمزد', icon: <Users className="w-4 h-4" /> },
              { id: 'list_salary_payroll', label: 'لیست حقوق', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'financial_report', label: 'ترازنامه', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'person_ledger', label: 'دفتر معین اشخاص', icon: <User className="w-4 h-4" /> },
              { id: 'product_categories', label: 'گروه بندی', icon: <List className="w-4 h-4" /> },
              { id: 'products', label: 'کالاها', icon: <Package className="w-4 h-4" /> },
              { id: 'persons', label: 'اشخاص', icon: <Users className="w-4 h-4" /> },
              { id: 'accounts', label: 'حساب‌های بانکی', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'cashboxes', label: 'صندوق‌ها', icon: <Wallet className="w-4 h-4" /> },
              { id: 'checklist', label: 'چک‌لیست', icon: <ClipboardList className="w-4 h-4" /> },
              { id: 'settings', label: 'تنظیمات', icon: <Settings className="w-4 h-4" /> },
              { id: 'database', label: 'پایگاه داده', icon: <Database className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={\`flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap rounded-lg text-xs font-semibold transition-colors \${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                }\`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Header */}`;

content = content.replace(headerFullRegex, hNavHTML);

fs.writeFileSync('src/App.tsx', content);
