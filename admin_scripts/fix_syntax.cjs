import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<RefreshCw className="w-10 h-10 text-slate-350 mx-auto animate-spin-slow" \/>\s*<div>\s*<p className="text-xs text-slate-500 font-extrabold">بسته‌های بروزرسانی هسته حسابداری به صورت خودکار تطبیق داده می‌شوند\.<\/p>\s*<\/div>\s*}\)/;

const rep = `<RefreshCw className="w-10 h-10 text-slate-350 mx-auto animate-spin-slow" />
                 <div>
                   <p className="text-xs text-slate-500 font-extrabold">بسته‌های بروزرسانی هسته حسابداری به صورت خودکار تطبیق داده می‌شوند.</p>
                 </div>
               </div>
             )}`;

code = code.replace(regex, rep);
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed tags');
