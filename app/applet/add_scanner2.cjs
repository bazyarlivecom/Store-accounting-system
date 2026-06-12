const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add ScanLine to lucide-react module
content = content.replace(/import \{ Shield, Key, Maximize,/, "import { ScanLine, Shield, Key, Maximize,");

// 2. Add import for BarcodeScannerModal
if (!content.includes('import BarcodeScannerModal')) {
    content = content.replace(
        "import SearchableSelect from './components/SearchableSelect';", 
        "import SearchableSelect from './components/SearchableSelect';\nimport BarcodeScannerModal from './components/BarcodeScannerModal';"
    );
}

// 3. Add state and handler to App component
const stateStr = `const [isProductModalOpen, setIsProductModalOpen] = useState(false);`;
if (!content.includes('const [isScannerOpen')) {
    content = content.replace(
        stateStr,
        `const [isScannerOpen, setIsScannerOpen] = useState(false);\n  const handleBarcodeScan = (code: string) => {\n    setIsScannerOpen(false);\n    const product = products.find(p => p.barcode === code);\n    if (product) {\n      handleFastAddProduct(String(product.id));\n      showNotification('کالا با موفقیت اضافه شد', 'success');\n    } else {\n      showNotification('محصولی با این بارکد یافت نشد', 'error');\n    }\n  };\n  ` + stateStr
    );
}

// 4. Add scanner modal down below
const modalStr = `{isProductModalOpen && (`;
if (!content.includes('<BarcodeScannerModal')) {
    content = content.replace(
        modalStr,
        `{isScannerOpen && (<BarcodeScannerModal onClose={() => setIsScannerOpen(false)} onScan={handleBarcodeScan} />)}\n        ` + modalStr
    );
}

const purchaseSearch = `<div className="flex-1 w-full relative z-10 max-w-2xl">
                      <div className="border hover:border-emerald-300 rounded-xl bg-white shadow-sm transition-colors relative">
                        <SearchableSelect 
                          options={products.map(p => ({
                            value: p.id,
                            label: p.name,
                            subLabel: formatProductStockDetails(p),
                            badge: p.type === 'service' ? 'خدمات' : 'کالا'
                          }))}
                          value=""
                          onChange={(val) => handleFastAddProduct(String(val))}
                          placeholder="جستجو و افزودن سریع کالا به لیست خرید (نام، کد، بارکد)..."
                          searchPlaceholder="جستجوی کالای خریداری شده..."
                        />
                      </div>
                    </div>`;

const purchaseSearchNew = `<div className="flex-1 w-full flex items-center gap-2 max-w-2xl">
                        <div className="flex-1 relative z-10">
                          <div className="border hover:border-emerald-300 rounded-xl bg-white shadow-sm transition-colors relative">
                            <SearchableSelect 
                              options={products.map(p => ({
                                value: p.id,
                                label: p.name,
                                subLabel: formatProductStockDetails(p),
                                badge: p.type === 'service' ? 'خدمات' : 'کالا'
                              }))}
                              value=""
                              onChange={(val) => handleFastAddProduct(String(val))}
                              placeholder="جستجو و افزودن سریع کالا به لیست خرید (نام، کد، بارکد)..."
                              searchPlaceholder="جستجوی کالای خریداری شده..."
                            />
                          </div>
                        </div>
                        <button onClick={() => setIsScannerOpen(true)} className="p-3.5 bg-white border border-emerald-200 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors focus:ring-2 focus:ring-emerald-500" title="اسکن بارکد با دوربین">
                          <ScanLine className="w-6 h-6"/>
                        </button>
                    </div>`;

const saleSearch = `<div className="flex-1 w-full relative z-10 max-w-2xl">
                      <div className="border hover:border-indigo-300 rounded-xl bg-white shadow-sm transition-colors relative">
                        <SearchableSelect 
                          options={products.filter(p => storeSettings.allowNegativeStock || p.type === 'service' || calculateProductCurrentStock(p.id) > 0).map(p => ({
                            value: p.id,
                            label: p.name,
                            subLabel: formatProductStockDetails(p),
                            badge: p.type === 'service' ? 'خدمات' : 'کالا'
                          }))}
                          value=""
                          onChange={(val) => handleFastAddProduct(String(val))}
                          placeholder="جستجو و افزودن سریع کالا به لیست (نام، کد، بارکد)..."
                          searchPlaceholder="نام، کد یا بارکد کالا را وارد کنید..."
                        />
                      </div>
                    </div>`;

const saleSearchNew = `<div className="flex-1 w-full flex items-center gap-2 max-w-2xl">
                        <div className="flex-1 relative z-10">
                          <div className="border hover:border-indigo-300 rounded-xl bg-white shadow-sm transition-colors relative">
                            <SearchableSelect 
                              options={products.filter(p => storeSettings.allowNegativeStock || p.type === 'service' || calculateProductCurrentStock(p.id) > 0).map(p => ({
                                value: p.id,
                                label: p.name,
                                subLabel: formatProductStockDetails(p),
                                badge: p.type === 'service' ? 'خدمات' : 'کالا'
                              }))}
                              value=""
                              onChange={(val) => handleFastAddProduct(String(val))}
                              placeholder="جستجو و افزودن سریع کالا به لیست (نام، کد، بارکد)..."
                              searchPlaceholder="نام، کد یا بارکد کالا را وارد کنید..."
                            />
                          </div>
                        </div>
                        <button onClick={() => setIsScannerOpen(true)} className="p-3.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-indigo-500" title="اسکن بارکد با دوربین">
                          <ScanLine className="w-6 h-6"/>
                        </button>
                    </div>`;

if(content.includes(purchaseSearch)) {
   content = content.replace(purchaseSearch, purchaseSearchNew);
   console.log('purchase search replaced');
} else {
   console.log('purchase search NOT found');
}

if(content.includes(saleSearch)) {
   content = content.replace(saleSearch, saleSearchNew);
   console.log('sale search replaced');
} else {
   console.log('sale search NOT found');
}

fs.writeFileSync('src/App.tsx', content);
