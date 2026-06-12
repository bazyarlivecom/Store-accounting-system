const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add ScanLine to lucide-react module
content = content.replace(/import { Shield, Key, Maximize,/, "import { ScanLine, Shield, Key, Maximize,");

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

const replaceSearchContainer = (color) => {
   const original = `<div className="flex-1 w-full relative z-10 max-w-2xl">\n                      <div className="border hover:border-${color}-300 rounded-xl bg-white shadow-sm transition-colors relative">`;
   
   const replacement = `<div className="flex-1 w-full flex items-center gap-2 max-w-2xl">
                        <div className="flex-1 relative z-10">
                          <div className="border hover:border-${color}-300 rounded-xl bg-white shadow-sm transition-colors relative">`;

   if (content.includes(original)) {
       content = content.replace(original, replacement);
   } else {
       console.log("Not found for color", color);
   }

   const originalEnd = `searchPlaceholder="جستجوی کالای خریداری شده..."\n                        />\n                      </div>\n                    </div>`;
   const originalEndSale = `searchPlaceholder="جستجوی کالای مورد نظر برای فروش..."\\n                        />\\n                      </div>\\n                    </div>`;

   const btn = `\\n                        />\\n                      </div>\\n                    </div>\\n                    <button onClick={() => setIsScannerOpen(true)} className="p-3 bg-white border border-\${color}-200 text-\${color}-600 rounded-xl shadow-sm hover:bg-\${color}-50 transition-colors focus:ring-2 focus:ring-\${color}-500" title="اسکن بارکد با دوربین"><ScanLine className="w-5 h-5"/></button>\\n                  </div>`;

   if (color === 'emerald') {
      content = content.replace(originalEnd, btn.replace(originalEnd, \`searchPlaceholder="جستجوی کالای خریداری شده..."\`));
   } else if (color === 'indigo') {
      content = content.replace(originalEndSale, btn.replace(originalEndSale, \`searchPlaceholder="جستجوی کالای مورد نظر برای فروش..."\`));
   }
}

replaceSearchContainer('emerald');
replaceSearchContainer('indigo');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
