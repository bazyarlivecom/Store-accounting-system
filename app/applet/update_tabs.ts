const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor1 = "                  <button\n                    type=\"button\"\n                    onClick={() => setProductFormTab('inventory')}";
const anchor2 = "</div>";

const idx1 = code.indexOf(anchor1);
if (idx1 !== -1) {
   const idx2 = code.indexOf(anchor2, idx1);
   if (idx2 !== -1) {
       const replacement = 
`                  <button
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
       const oldChunk = code.substring(idx1, idx2 + "</div>".length);
       code = code.replace(oldChunk, replacement);
       fs.writeFileSync('src/App.tsx', code);
       console.log("Updated Tabs HTML.");
   }
}
