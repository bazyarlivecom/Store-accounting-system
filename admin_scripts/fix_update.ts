import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchStr = `<div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 mt-6">
                     <div className="bg-slate-100 border border-slate-200 px-6 py-3 rounded-xl text-center shadow-sm flex-1 max-w-[200px]">
                        <p className="text-[10px] text-slate-500 font-bold mb-1">نسخه فعلی سیستم</p>
                        <p className="text-base font-black text-slate-700 font-mono" dir="ltr">Build 2.8.5</p>
                     </div>
                     <motion.div animate={{ x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-slate-300 hidden sm:block">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><path d="m15 18-6-6 6-6"/></svg>
                     </motion.div>
                     <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-xl text-center shadow-sm relative overflow-hidden flex-1 max-w-[200px]">
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full m-2 animate-ping"></div>
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full m-2"></div>
                        <p className="text-[10px] text-emerald-600 font-bold mb-1">نسخه جدید (آماده نصب)</p>
                        <p className="text-base font-black text-emerald-700 font-mono" dir="ltr">
                          {checkingUpdateVersion ? (
                            <RefreshCw className="w-4 h-4 mx-auto animate-spin" />
                          ) : latestVersion ? (
                            latestVersion
                          ) : (
                            'Build 2.9.0'
                          )}
                        </p>
                     </div>
                   </div>`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, '');
  fs.writeFileSync('src/App.tsx', code);
  console.log('Successfully removed update versions block.');
} else {
  console.log('Block not found.');
}
