import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `{activeTab.includes('warehouse') ? (
                                   <div className="flex justify-center">
                                      <span className="font-sans font-bold text-xs text-emerald-950 bg-emerald-50/50 hover:bg-emerald-100/50 px-2.5 py-1.5 rounded-xl border border-emerald-100/30 inline-block transition-all shadow-xs">
                                        {storeSettings.storeName || 'انبار مرکزی'}
                                      </span>
                                   </div>
                                ) : (`;

const newStr = `{activeTab.includes('warehouse') ? (
                                   <div className="flex justify-center flex-wrap gap-1">
                                      {Array.from(new Set((inv.items || []).map((i: any) => i.warehouseId).filter(Boolean))).map((wId: any) => (
                                         <span key={wId} className="font-sans font-bold text-[10px] text-emerald-950 bg-emerald-50/50 hover:bg-emerald-100/50 px-2.5 py-1.5 rounded-xl border border-emerald-100/30 inline-block transition-all shadow-xs">
                                           {warehouses.find(w => String(w.id) === String(wId))?.name || 'انبار نامشخص'}
                                         </span>
                                      ))}
                                      {!(inv.items || []).some((i: any) => i.warehouseId) && (
                                         <span className="font-sans font-bold text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 inline-block">نامشخص</span>
                                      )}
                                   </div>
                                ) : (`;

content = content.replace(targetStr, newStr);
fs.writeFileSync('src/App.tsx', content);
console.log('patched warehouse names in list');
