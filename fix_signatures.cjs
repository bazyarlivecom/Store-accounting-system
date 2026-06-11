const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSignViewing = `<div className="grid grid-cols-2 gap-6 pt-8 text-center text-xs font-bold text-gray-400 relative" style={{ zIndex: 10 }}>
                          <div className="border border-dashed border-gray-200 bg-gray-50 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-gray-500">مهر و امضای خریدار</span>
                            <span className="text-[10px] text-gray-400">تاریخ و رویت</span>
                          </div>
                          <div className="border border-indigo-200 bg-indigo-50/20 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-indigo-900">مهر و امضای فروشنده ({storeSettings.storeName})</span>
                            <span className="text-[10px] text-indigo-400">تضمین اعتبار</span>
                          </div>
                        </div>`;

const replaceSignViewing = `<div className="grid grid-cols-2 gap-6 pt-8 text-center text-xs font-bold text-gray-400 relative" style={{ zIndex: 10 }}>
                          <div className="border border-dashed border-gray-200 bg-gray-50 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-gray-500">{viewingInvoice.type.includes('warehouse') ? 'تحویل دهنده / مراجعه کننده' : 'مهر و امضای خریدار'}</span>
                            <span className="text-[10px] text-gray-400">تاریخ و رویت</span>
                          </div>
                          <div className="border border-indigo-200 bg-indigo-50/20 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-indigo-900">{viewingInvoice.type.includes('warehouse') ? \`تایید کننده (انباردار \${storeSettings.storeName})\` : \`مهر و امضای فروشنده (\${storeSettings.storeName})\`}</span>
                            <span className="text-[10px] text-indigo-400">{viewingInvoice.type.includes('warehouse') ? 'تاییدیه ورود/خروج کالا' : 'تضمین اعتبار'}</span>
                          </div>
                        </div>`;

code = code.replace(targetSignViewing, replaceSignViewing);

const targetSignPreview = `<div className="grid grid-cols-2 gap-6 pt-8 text-center text-xs font-bold text-gray-400 relative" style={{ zIndex: 10 }}>
                          <div className="border border-dashed border-gray-200 bg-gray-50 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-gray-500">مهر و امضای خریدار</span>
                            <span className="text-[10px] text-gray-400">تاریخ و رویت</span>
                          </div>
                          <div className="border border-amber-200 bg-amber-50/20 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-amber-900">مهر و امضای فروشنده ({storeSettings.storeName})</span>
                            <span className="text-[10px] text-amber-600">تضمین اعتبار</span>
                          </div>
                        </div>`;

const replaceSignPreview = `<div className="grid grid-cols-2 gap-6 pt-8 text-center text-xs font-bold text-gray-400 relative" style={{ zIndex: 10 }}>
                          <div className="border border-dashed border-gray-200 bg-gray-50 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-gray-500">{previewInvoiceData.type?.includes('warehouse') ? 'تحویل دهنده / مراجعه کننده' : 'مهر و امضای خریدار'}</span>
                            <span className="text-[10px] text-gray-400">تاریخ و رویت</span>
                          </div>
                          <div className="border border-amber-200 bg-amber-50/20 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-amber-900">{previewInvoiceData.type?.includes('warehouse') ? \`تایید کننده (انباردار \${storeSettings.storeName})\` : \`مهر و امضای فروشنده (\${storeSettings.storeName})\`}</span>
                            <span className="text-[10px] text-amber-600">{previewInvoiceData.type?.includes('warehouse') ? 'تاییدیه ورود/خروج کالا' : 'تضمین اعتبار'}</span>
                          </div>
                        </div>`;

code = code.replace(targetSignPreview, replaceSignPreview);

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing signatures');
