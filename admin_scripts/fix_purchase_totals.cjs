const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<div className="mt-6 flex justify-between items-end">/g, '<div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4 mt-2">');

code = code.replace(/<div className="w-1\/2 p-4 border border-emerald-200 bg-emerald-100\/50 space-y-2">/g, '<div className="w-full md:w-1/2 p-4 border border-emerald-200 bg-emerald-50/80 rounded-2xl space-y-3">');

code = code.replace(/<div className="text-emerald-900 font-bold text-sm bg-emerald-200\/50 p-2 border border-emerald-300">/g, '<div className="text-emerald-950 font-black text-sm bg-emerald-100/50 p-3 rounded-xl border border-emerald-200/60 mt-2">');

code = code.replace(/<div className="w-\[45%\] bg-white border-2 border-emerald-900 flex flex-col font-bold text-emerald-950">/g, '<div className="w-full md:w-5/12 bg-white border-2 border-emerald-900 rounded-3xl overflow-hidden flex flex-col font-bold text-emerald-950">');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
