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

// Replace the container code for purchase (2656) and sale (2908), plus generic (2361) using regex
const replaceSection = (regexStr, btnClass) => {
    content = content.replace(regexStr, (match) => {
        return `<div className="flex-1 w-full flex items-center gap-2 max-w-2xl">\n` + 
               match.replace('max-w-2xl', '') + 
               `\n <button onClick={() => setIsScannerOpen(true)} className="${btnClass}" title="اسکن بارکد با دوربین"><ScanLine className="w-6 h-6"/></button></div>`;
    });
};

const purchaseRegex = /<div className="flex-1 w-full relative z-10 max-w-2xl">[\s\S]*?searchPlaceholder="جستجوی کالای خریداری شده\.\.\."\s*\/>\s*<\/div>\s*<\/div>/;
replaceSection(purchaseRegex, "p-3.5 bg-white border border-emerald-200 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors focus:ring-2 focus:ring-emerald-500");

const saleRegex = /<div className="flex-1 w-full relative z-10 max-w-2xl">[\s\S]*?searchPlaceholder="نام، کد یا بارکد کالا را وارد کنید\.\.\."\s*\/>\s*<\/div>\s*<\/div>/;
replaceSection(saleRegex, "p-3.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-indigo-500");

const genericRegex = /<div className="flex-1 w-full relative z-10 max-w-2xl">[\s\S]*?searchPlaceholder="جستجوی کالا\.\.\."\s*\/>\s*<\/div>\s*<\/div>/;
replaceSection(genericRegex, "p-3 bg-white border border-gray-200 text-gray-600 rounded-xl shadow-sm hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-indigo-500");

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
