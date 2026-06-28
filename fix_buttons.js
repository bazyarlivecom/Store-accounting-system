const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = '<FastBarcodeScanner onScan={handleFastBarcodeScan} />';
const replaceStr = `<FastBarcodeScanner onScan={handleFastBarcodeScan} />
                    <button
                      onClick={() => setIsFastProductModalOpen(true)}
                      className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-md shadow-amber-200 transition-colors flex items-center justify-center shrink-0"
                      title="ثبت سریع کالای جدید"
                    >
                      <Zap className="w-5 h-5 fill-current" />
                    </button>`;

const parts = content.split(targetStr);
content = parts[0] + targetStr + parts[1] + replaceStr + parts[2] + replaceStr + parts[3] + replaceStr + parts[4] + replaceStr + parts[5];

fs.writeFileSync('src/App.tsx', content);
