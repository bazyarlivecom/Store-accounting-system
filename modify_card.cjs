const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const s1 = "              {(() => {\n                const hProduct = products.find(p => p.id.toString() === historyProductId.toString());\n                if (!hProduct) return null;";
const replaceS1 = `              {(() => {
                const hProduct = products.find(p => p.id.toString() === historyProductId.toString());
                if (!hProduct) return null;`;

let cardHTML = `
                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" />
                    مشخصات کالا
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">کد کالا</p>
                      <p className="font-bold text-gray-800 text-sm">{hProduct.code || '---'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">بارکد</p>
                      <p className="font-bold text-gray-800 text-sm">{hProduct.barcode || '---'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">دسته‌بندی</p>
                      <p className="font-bold text-gray-800 text-sm">{hProduct.category || 'بدون گروه'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">نوع</p>
                      <p className="font-bold text-gray-800 text-sm">{hProduct.type === 'service' ? 'خدمات' : 'کالا'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">قیمت خرید (تومان)</p>
                      <p className="font-bold text-emerald-600 text-sm">{addCommas(hProduct.buyPrice || 0)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">قیمت فروش (تومان)</p>
                      <p className="font-bold text-indigo-600 text-sm">{addCommas(hProduct.price || 0)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">موجودی</p>
                      <p className="font-bold text-gray-800 text-sm">{addCommas(hProduct.stock || 0)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">واحد اندازه‌گیری</p>
                      <p className="font-bold text-gray-800 text-sm">{hProduct.unit || 'عدد'}</p>
                    </div>
                  </div>
                </div>
`;

content = content.replace("سابقه قیمتی کالا", "کارت کالا و سوابق");
content = content.replace(s1, replaceS1 + "\n\n" + cardHTML);

const historyLabelStr = `<h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-500" />
                    تاریخچه خرید و فروش
                  </h4>`;
                  
content = content.replace("return entries.length > 0 ? (", `return entries.length > 0 ? (\n                  <>\n                    ${historyLabelStr}\n`);
content = content.replace(/<\/table>\n                  <\/div>\n                \) : \(/, `</table>\n                  </div>\n                  </>\n                ) : (`);

// need to import History from lucide-react if not present
if (!content.includes('History,')) {
    content = content.replace("Activity, Clock } from 'lucide-react'", "Activity, Clock, History } from 'lucide-react'");
}

fs.writeFileSync('src/App.tsx', content);
console.log('DONE');
