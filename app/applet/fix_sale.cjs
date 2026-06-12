const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replaceSection = (regexStr, btnClass) => {
    content = content.replace(regexStr, (match) => {
        return `<div className="flex-1 w-full flex items-center gap-2 max-w-2xl">\n` + 
               match.replace('max-w-2xl', '') + 
               `\n <button onClick={() => setIsScannerOpen(true)} className="${btnClass}" title="اسکن بارکد با دوربین"><ScanLine className="w-6 h-6"/></button></div>`;
    });
};

const saleRegex = /<div className="flex-1 w-full relative z-10 max-w-2xl">[\s\S]*?searchPlaceholder="جستجوی کالای مورد نظر برای فروش\.\.\."\s*\/>\s*<\/div>\s*<\/div>/;
replaceSection(saleRegex, "p-3.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-indigo-500");

fs.writeFileSync('src/App.tsx', content);
console.log('sale fixed');
