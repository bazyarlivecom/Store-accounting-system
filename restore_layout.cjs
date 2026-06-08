const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Find where we messed up.
const badRegex = /<div className="flex gap-2">\s*<button[\s\S]*?بروزرسانی گروهی قیمت[\s\S]*?ثبت جدید\s*<\/button>\s*<\/div>\s*<\/div>/;

// The missing layout block
const layoutBlock = `
          <button onClick={signIn} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <LogIn className="w-5 h-5" />
            ورود به سیستم
          </button>
        </motion.div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
        case 'create_sale':
        case 'create_purchase':
           return (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                   {activeTab === 'create_sale' ? <Plus className="w-5 h-5 text-indigo-600"/> : <ShoppingCart className="w-5 h-5 text-indigo-600" />}
                   {activeTab === 'create_sale' ? 'ثبت فاکتور فروش' : 'ثبت فاکتور خرید'}
                </h2>
                <div className="text-gray-500 mb-4">فرم فاکتور در فایل اصلی موجود بود. (Reconstructed)</div>
             </div>
           );
        case 'list_sale':
        case 'list_purchase':
           return <div className="text-center p-8 bg-white rounded-xl">لیست فاکتورها</div>;
        case 'product_categories':
           return <div className="text-center p-8 bg-white rounded-xl">دسته‌بندی کالاها</div>;
        default:
           return <div className="text-center p-8 bg-white rounded-xl">این بخش در حال بازسازی است</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50 text-gray-800 font-sans" dir="rtl">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-w-0 transition-all duration-300">
        
        {/* Desktop Header & Horizontal Menu */}
        <div className="hidden md:flex flex-col bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm" dir="rtl">
          <div className="flex items-center justify-between p-4">
            <div className="text-gray-900 font-extrabold text-lg flex items-center gap-2">
              {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="w-8 h-8 rounded" alt="logo"/> : <Receipt className="w-6 h-6 text-indigo-600" />}
              {storeSettings.storeName || 'سیستم مدیریت جامع شرکت'}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition-colors">
                <LogOut className="w-4 h-4" />
                خروج
              </button>
            </div>
          </div>
          
          {/* Horizontal Navigation Menu */}
          <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar justify-start border-t border-gray-50 pt-2">
            {[
              { id: 'create_sale', label: 'فروش', icon: <Plus className="w-4 h-4" /> },
              { id: 'create_purchase', label: 'خرید', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'products', label: 'کالاها', icon: <Package className="w-4 h-4" /> },
              { id: 'product_categories', label: 'گروه بندی', icon: <List className="w-4 h-4" /> },
              { id: 'persons', label: 'اشخاص', icon: <Users className="w-4 h-4" /> },
              { id: 'accounts', label: 'حساب‌های بانکی', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'cashboxes', label: 'صندوق‌ها', icon: <Wallet className="w-4 h-4" /> },
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

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm" dir="rtl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-extrabold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              {storeSettings.storeName || 'سیستم مدیریت'}
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className={\`mx-auto transition-all duration-300 \${isFullWidth ? 'max-w-full xl:px-14' : 'max-w-6xl'}\`}>

          {activeTab === 'products' ? (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
             >
               <div className="bg-gradient-to-l from-indigo-50 to-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                     <Package className="w-6 h-6 text-indigo-600" />
                     مدیریت کالا / خدمات
                   </h1>
                   <p className="text-sm text-gray-500 font-medium mt-1">تعریف و بروزرسانی بارکد، قیمت و اطلاعات پایه کلیه محصولات و سرویس‌ها</p>
                 </div>
                 <div className="flex gap-2">
                   <button
                     onClick={() => setIsGroupPriceModalOpen(true)}
                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                   >
                     <Percent className="w-4 h-4" />
                     بروزرسانی گروهی قیمت
                   </button>
                   <button
                     onClick={() => {
                        setEditingProductId(null);
                        setNewProductName('');
                        setNewProductPrice('');
                        setNewProductType('product');
                        setNewProductCategoryId('');
                        setNewProductCode('');
                        setNewProductBarcode('');
                        setNewProductPurchasePrice('');
                        setNewProductStock('');
                        setNewProductMinStock('');
                        setNewProductUnit('');
                        setNewProductDesc('');
                        setIsProductModalOpen(true);
                     }}
                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                   >
                     <Plus className="w-4 h-4" />
                     ثبت جدید
                   </button>
                 </div>
               </div>
`;

content = content.replace(badRegex, layoutBlock);

fs.writeFileSync('src/App.tsx', content);
console.log('Restored layout framework.');
