const fs = require('fs');

const tabStringCode = `
                  {editingProductId && (
                     <button
                       type="button"
                       onClick={() => setProductFormTab('history')}
                       className={\`pb-3 font-bold text-sm border-b-2 transition-colors \${productFormTab === 'history' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}\`}
                     >
                       تاریخچه قیمت‌ها
                     </button>
                  )}
                </div>
`;

let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = "انبار و تکمیلی\n                  </button>\n                </div>";

if (code.includes(anchor)) {
    code = code.replace(anchor, "انبار و تکمیلی\n                  </button>" + tabStringCode);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success tabs inject");
} else {
    console.log("Failed tabs inject: anchor not found");
}
