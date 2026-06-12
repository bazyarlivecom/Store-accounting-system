import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                   <p className="text-xs text-slate-500 font-extrabold">بسته‌های بروزرسانی هسته حسابداری به صورت خودکار تطبیق داده می‌شوند.</p>
               </div>
             )}`;

const replacement = `                   <p className="text-xs text-slate-500 font-extrabold">بسته‌های بروزرسانی هسته حسابداری به صورت خودکار تطبیق داده می‌شوند.</p>
                 </div>
               </div>
             )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully replaced string");
} else {
  console.log("String not found");
}
