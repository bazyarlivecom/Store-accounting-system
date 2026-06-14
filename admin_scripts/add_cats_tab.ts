import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const fetchProdsStr = `  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data as any);
    } catch (error) {
      console.error('Error fetching products', error);
    }
  };`;

const newFetchStr = `  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data as any);
      
      const cats = await getProductCategories();
      setProductCategories(cats as any);
    } catch (error) {
      console.error('Error fetching products or categories', error);
    }
  };`;

content = content.replace(fetchProdsStr, newFetchStr);

const menuProductStr = `{/* Products */}`;
const addMenuTabStr = `{/* Product Categories */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('product_categories')}
                    className={\`flex items-start gap-3 p-2 rounded-xl transition-all duration-200 text-right cursor-pointer \${
                      activeTab === 'product_categories'
                        ? 'bg-amber-50 text-amber-700 font-bold'
                        : 'text-gray-750 hover:bg-slate-50'
                    }\`}
                  >
                    <div className={\`p-1.5 rounded-lg \${activeTab === 'product_categories' ? 'bg-amber-100 text-amber-700' : 'bg-amber-50 text-amber-500'}\`}>
                      <List className="w-4 h-4" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-1">
                      <div>
                        <div className="text-xs font-extrabold">گروه‌بندی کالاها</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 font-medium leading-normal">مدیریت دسته‌بندی اقلام</div>
                      </div>
                      <span className="text-[10px] font-sans font-extrabold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full text-amber-700">
                        {formatNumber(productCategories.length)}
                      </span>
                    </div>
                  </button>
                  <div className="border-t border-gray-100/40 my-0.5 mx-2"></div>
                  
                  {/* Products */}`;

content = content.replace(menuProductStr, addMenuTabStr);

const addTabConditionStr = `      ) : activeTab === 'products' ? (`;

const categoriesTabStr = `      ) : activeTab === 'product_categories' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-500" />
              مدیریت گروه‌بندی کالاها
            </h2>
            <button
              onClick={() => {
                setEditingCategoryId(null);
                setNewCatName('');
                setNewCatDesc('');
                setIsCategoryModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              گروه جدید
            </button>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {productCategories.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <List className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>هیچ گروه‌بندی یافت نشد.</p>
              </div>
            ) : (
              <table className="w-full text-right whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="text-sm font-medium text-gray-500 border-b border-gray-100 bg-gray-50/30">
                    <th className="py-4 px-6 text-right w-16 text-center">ردیف</th>
                    <th className="py-4 px-6 text-right">نام گروه</th>
                    <th className="py-4 px-6 text-right">توضیحات</th>
                    <th className="py-4 px-6 w-24 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productCategories.map((c, index) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-500 w-16 text-center">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 border-r-2 border-transparent hover:border-indigo-500">
                        {c.name}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm whitespace-normal w-1/2">
                        {c.description || '---'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditCategory(c)}
                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors inline-block"
                            title="ویرایش گروه"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="حذف گروه"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'products' ? (`;

content = content.replace(addTabConditionStr, categoriesTabStr);

fs.writeFileSync('src/App.tsx', content);
