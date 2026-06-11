const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// For sale/purchase create lists
code = code.replace(/<th className="p-4 font-bold w-full text-right">شرح کالا \/ خدمات<\/th>/g, '<th className="p-4 font-bold min-w-[200px] w-[30%] text-right">شرح کالا / خدمات</th>');
code = code.replace(/<th className="p-4 font-bold w-20 text-center">تعداد<\/th>/g, '<th className="p-4 font-bold w-32 text-center">تعداد</th>');
code = code.replace(/<th className="p-4 font-bold w-24 text-center border-r border-gray-100">واحد<\/th>/g, '<th className="p-4 font-bold w-32 text-center border-r border-gray-100">واحد</th>');
code = code.replace(/<th className="p-4 font-bold w-36 border-r border-gray-100 text-left text-indigo-800">فی/g, '<th className="p-4 font-bold w-48 border-r border-gray-100 text-left text-indigo-800">فی');
code = code.replace(/<th className="p-4 font-bold w-20 text-center border-r border-gray-100">تخفیف %<\/th>/g, '<th className="p-4 font-bold w-28 text-center border-r border-gray-100">تخفیف %</th>');
code = code.replace(/<th className="p-4 font-bold w-40 border-r border-gray-100 text-left text-indigo-800">مبلغ کل/g, '<th className="p-4 font-bold w-48 border-r border-gray-100 text-left text-indigo-800">مبلغ کل');

// For purchase/warehouse receipt create lists (emerald)
code = code.replace(/<th className="p-5 w-full text-right">شرح کالا \/ خدمات<\/th>/g, '<th className="p-5 min-w-[200px] w-[30%] text-right">شرح کالا / خدمات</th>');
code = code.replace(/<th className="p-5 w-20 text-center border-r border-emerald-50\/50">تعداد<\/th>/g, '<th className="p-5 w-32 text-center border-r border-emerald-50/50">تعداد</th>');
code = code.replace(/<th className="p-5 w-24 text-center border-r border-emerald-50\/50">واحد<\/th>/g, '<th className="p-5 w-32 text-center border-r border-emerald-50/50">واحد</th>');
code = code.replace(/<th className="p-5 w-36 border-r border-emerald-50\/50 text-left text-emerald-800">فی/g, '<th className="p-5 w-48 border-r border-emerald-50/50 text-left text-emerald-800">فی');
code = code.replace(/<th className="p-5 w-20 text-center border-r border-emerald-50\/50">تخفیف %<\/th>/g, '<th className="p-5 w-28 text-center border-r border-emerald-50/50">تخفیف %</th>');
code = code.replace(/<th className="p-5 w-40 border-r border-emerald-50\/50 text-left text-emerald-800">مبلغ کل/g, '<th className="p-5 w-48 border-r border-emerald-50/50 text-left text-emerald-800">مبلغ کل');

// For viewing invoice
code = code.replace(/<th className="p-4 text-right font-black w-full">شرح کالا یا خدمات<\/th>/g, '<th className="p-4 text-right font-black w-[40%]">شرح کالا یا خدمات</th>');
code = code.replace(/<th className="p-4 text-center w-20 font-black">مقدار<\/th>/g, '<th className="p-4 text-center w-32 font-black">مقدار</th>');
code = code.replace(/<th className="p-4 text-left w-36 font-black text-indigo-800">مبلغ واحد/g, '<th className="p-4 text-left w-48 font-black text-indigo-800">مبلغ واحد');
code = code.replace(/<th className="p-4 text-center w-20 font-black">تخفیف \(٪\)<\/th>/g, '<th className="p-4 text-center w-28 font-black">تخفیف (٪)</th>');
code = code.replace(/<th className="p-4 text-left w-40 font-black text-indigo-800">کل خالص/g, '<th className="p-4 text-left w-48 font-black text-indigo-800">کل خالص');

// For viewing invoice (emerald, print)
code = code.replace(/<th className="p-3 border-l border-emerald-800 w-full">شرح کالا<\/th>/g, '<th className="p-3 border-l border-emerald-800 min-w-[200px] w-[40%]">شرح کالا</th>');
code = code.replace(/<th className="p-3 border-l border-emerald-800 text-center w-20">مقدار<\/th>/g, '<th className="p-3 border-l border-emerald-800 text-center w-28">مقدار</th>');
code = code.replace(/<th className="p-3 border-l border-emerald-800 text-left w-36 text-emerald-200">فی/g, '<th className="p-3 border-l border-emerald-800 text-left w-44 text-emerald-200">فی');
code = code.replace(/<th className="p-3 border-l border-emerald-800 text-center w-20">تخفیف<\/th>/g, '<th className="p-3 border-l border-emerald-800 text-center w-24">تخفیف</th>');
code = code.replace(/<th className="p-3 text-left w-40 text-emerald-200">مبلغ/g, '<th className="p-3 text-left w-48 text-emerald-200">مبلغ');

fs.writeFileSync('src/App.tsx', code);
console.log("Done widths substitution");
