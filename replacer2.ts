const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<FastBarcodeScanner onScan={handleFastBarcodeScan} />`;
const replacement = `<div className="flex gap-2">
                      <FastBarcodeScanner onScan={handleFastBarcodeScan} />
                      <button
                        onClick={() => setIsBulkImportOpen(true)}
                        className="p-2.5 bg-white border border-gray-200 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center justify-center shrink-0"
                        title="ورود گروهی کالا (اکسل / CSV / JSON)"
                      >
                        <Database className="w-5 h-5" />
                      </button>
                    </div>`;

code = code.split(target).join(replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('Done');
