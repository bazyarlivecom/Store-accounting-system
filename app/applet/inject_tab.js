const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const s1 = 'onClick={() => setProductFormTab(\'inventory\')}';
const b1 = 'className={`pb-3 font-bold text-sm border-b-2 transition-colors ${productFormTab === \'inventory\' ? \'border-indigo-600 text-indigo-700\' : \'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300\'}`}';

const replacement = `                  <button
                    type="button"
                    onClick={() => setProductFormTab('inventory')}
                    className={\`pb-3 font-bold text-sm border-b-2 transition-colors \${productFormTab === 'inventory' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}\`}
                  >
                    انبار و تکمیلی
                  </button>
                  {editingProductId && (
                     <button
                       type="button"
                       onClick={() => setProductFormTab('history')}
                       className={\`pb-3 font-bold text-sm border-b-2 transition-colors \${productFormTab === 'history' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}\`}
                     >
                       تاریخچه قیمت‌ها
                     </button>
                  )}
                </div>`;

const search = `                  <button
                    type="button"
                    ${s1}
                    ${b1}
                  >
                    انبار و تکمیلی
                  </button>
                </div>`;

const idx = code.indexOf(s1);
if(idx !== -1) {
    const endDiv = code.indexOf('</div>', idx);
    const oldChunk = code.substring(idx - 60, endDiv + 6);
    code = code.replace(oldChunk, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("SUCCESS");
}
