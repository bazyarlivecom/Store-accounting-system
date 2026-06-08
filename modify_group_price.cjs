const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const updatedButtons = `            <div className="flex gap-2">
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
            </div>`;

content = content.replace(/<button[\s\S]*?onClick=\{\(\) => \{\n\s*setEditingProductId\(null\);[\s\S]*?<\/button>/, updatedButtons);

// Add missing Percent icon
if (!content.includes('Percent,')) {
    content = content.replace("Activity, Clock, History } from 'lucide-react'", "Activity, Clock, History, Percent } from 'lucide-react'");
}

// Add state for group price modal
const stateRegex = /const \[isProductModalOpen, setIsProductModalOpen\] = useState\(false\);/;
const newState = `const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isGroupPriceModalOpen, setIsGroupPriceModalOpen] = useState(false);
  const [groupUpdateType, setGroupUpdateType] = useState<'category' | 'single'>('category');
  const [groupUpdateTargetCategory, setGroupUpdateTargetCategory] = useState<string>('all');
  const [groupUpdateTargetProduct, setGroupUpdateTargetProduct] = useState<string>('');
  const [groupUpdateAmountType, setGroupUpdateAmountType] = useState<'percent' | 'fixed'>('percent');
  const [groupUpdateAmount, setGroupUpdateAmount] = useState<string>('');
  const [groupUpdateDirection, setGroupUpdateDirection] = useState<'increase' | 'decrease'>('increase');
  const [groupUpdatePriceTarget, setGroupUpdatePriceTarget] = useState<'sell' | 'buy' | 'both'>('sell');
`;
content = content.replace(stateRegex, newState);

// Modal
const modalStr = `
      {/* Group Price Update Modal */}
      {isGroupPriceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-xl shadow-xl flex flex-col border border-gray-100" 
            dir="rtl"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50 rounded-t-2xl">
              <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                بروزرسانی گروهی قیمت کالاها
              </h3>
              <button onClick={() => setIsGroupPriceModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نوع هدف</label>
                  <select 
                    value={groupUpdateType} 
                    onChange={(e) => setGroupUpdateType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="category">دسته‌بندی خاص یا همه</option>
                    <option value="single">کالای تکی</option>
                  </select>
                </div>
                
                {groupUpdateType === 'category' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">انتخاب دسته‌بندی</label>
                    <select 
                      value={groupUpdateTargetCategory} 
                      onChange={(e) => setGroupUpdateTargetCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">تمامی کالاها</option>
                      {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">جستجوی کالا</label>
                    <Select
                      isRtl
                      isSearchable
                      value={groupUpdateTargetProduct ? { value: groupUpdateTargetProduct, label: products.find(p => p.id.toString() === groupUpdateTargetProduct)?.name } : null}
                      onChange={(option: any) => setGroupUpdateTargetProduct(option ? option.value : '')}
                      options={products.map(p => ({ value: p.id.toString(), label: p.name })) as any}
                      placeholder="انتخاب کالا"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نحوه تغییر</label>
                  <select 
                    value={groupUpdateAmountType} 
                    onChange={(e) => setGroupUpdateAmountType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="percent">درصدی (%)</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">جهت تغییر</label>
                  <select 
                    value={groupUpdateDirection} 
                    onChange={(e) => setGroupUpdateDirection(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="increase">افزایش قیمت</option>
                    <option value="decrease">کاهش قیمت</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">مقدار / مبلغ ({groupUpdateAmountType === 'percent' ? '%' : 'تومان'})</label>
                  <CurrencyInput
                    value={groupUpdateAmount}
                    onChange={(e: any) => setGroupUpdateAmount(e.target.value)}
                    placeholder={groupUpdateAmountType === 'percent' ? 'مثال: 10' : 'مثال: 50000'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">کدام قیمت‌ها آپدیت شوند؟</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="sell" checked={groupUpdatePriceTarget === 'sell'} onChange={() => setGroupUpdatePriceTarget('sell')} className="text-emerald-600 focus:ring-emerald-500"/>
                    <span className="text-sm">قیمت فروش</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="buy" checked={groupUpdatePriceTarget === 'buy'} onChange={() => setGroupUpdatePriceTarget('buy')} className="text-emerald-600 focus:ring-emerald-500"/>
                    <span className="text-sm">قیمت خرید</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="both" checked={groupUpdatePriceTarget === 'both'} onChange={() => setGroupUpdatePriceTarget('both')} className="text-emerald-600 focus:ring-emerald-500"/>
                    <span className="text-sm">هر دو</span>
                  </label>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={async () => {
                   if (!groupUpdateAmount || Number(groupUpdateAmount) <= 0) {
                      customAlert('لطفا مقدار تغییر را معتبر وارد کنید.');
                      return;
                   }
                   if (groupUpdateType === 'single' && !groupUpdateTargetProduct) {
                      customAlert('لطفا کالا را مشخص کنید.');
                      return;
                   }
                   
                   confirmAction('آیا از آپدیت گروهی قیمت‌ها اطمینان دارید؟', async () => {
                     try {
                        let targets = products;
                        if (groupUpdateType === 'single') {
                           targets = products.filter(p => p.id.toString() === groupUpdateTargetProduct);
                        } else if (groupUpdateTargetCategory !== 'all') {
                           targets = products.filter(p => String(p.categoryId) === String(groupUpdateTargetCategory));
                        }
                        
                        const amount = Number(groupUpdateAmount);
                        if (targets.length === 0) {
                           customAlert('هیچ کالایی برای اعمال تغییرات یافت نشد.');
                           return;
                        }

                        // We need to update each product (using firebase / db API inside a loop or bulk).
                        // Note: To keep things simple, we'll loop over targets and updateProduct individually
                        for (const target of targets) {
                           const updates: any = {};
                           if (groupUpdatePriceTarget === 'sell' || groupUpdatePriceTarget === 'both') {
                              let base = Number(target.price || 0);
                              let change = groupUpdateAmountType === 'percent' ? (base * amount / 100) : amount;
                              let val = groupUpdateDirection === 'increase' ? base + change : base - change;
                              if (val < 0) val = 0;
                              updates.price = val;
                           }
                           if (groupUpdatePriceTarget === 'buy' || groupUpdatePriceTarget === 'both') {
                              let base = Number(target.buyPrice || 0);
                              let change = groupUpdateAmountType === 'percent' ? (base * amount / 100) : amount;
                              let val = groupUpdateDirection === 'increase' ? base + change : base - change;
                              if (val < 0) val = 0;
                              updates.buyPrice = val;
                           }
                           
                           await updateProduct(target.id, updates);
                        }
                        
                        await fetchProducts();
                        setIsGroupPriceModalOpen(false);
                        customAlert(\`قیمت \${targets.length} کالا با موفقیت بروزرسانی شد.\`);
                     } catch(err) {
                        customAlert('خطا در بروزرسانی. لطفا مجدد تلاش کنید.');
                        console.error(err);
                     }
                   });
                }}
                className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-colors"
              >
                اعمال تغییرات
              </button>
              <button 
                onClick={() => setIsGroupPriceModalOpen(false)} 
                className="flex-1 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-bold shadow-sm transition-colors"
              >
                انصراف
              </button>
            </div>
          </motion.div>
        </div>
      )}
`;

content = content.replace("{/* Person List Filter Modal */}", modalStr + "\n      {/* Person List Filter Modal */}");

fs.writeFileSync('src/App.tsx', content);

