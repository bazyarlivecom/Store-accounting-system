import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const signatureBlockA_old = `                        {/* Standard Signature Block */}
                        <div className="grid grid-cols-2 gap-6 pt-8 text-center text-xs font-bold text-gray-400 relative" style={{ zIndex: 10 }}>
                          <div className="border border-dashed border-gray-200 bg-gray-50 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-gray-500">{viewingInvoice.type.includes('warehouse') ? 'تحویل دهنده / مراجعه کننده' : 'مهر و امضای خریدار'}</span>
                            <span className="text-[10px] text-gray-400">تاریخ و رویت</span>
                          </div>
                          <div className="border border-indigo-200 bg-indigo-50/20 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-indigo-900">{viewingInvoice.type.includes('warehouse') ? \`تایید کننده (انباردار \${storeSettings.storeName})\` : \`مهر و امضای فروشنده (\${storeSettings.storeName})\`}</span>
                            <span className="text-[10px] text-indigo-400">{viewingInvoice.type.includes('warehouse') ? 'تاییدیه ورود/خروج کالا' : 'تضمین اعتبار'}</span>
                          </div>
                        </div>`;

const signatureBlockA_new = `                        {/* Custom Footer Notes & Signature Block */}
                        {storeSettings.print_footer_note && (
                           <div className="mt-8 text-xs font-bold text-slate-500 text-center leading-relaxed">
                              {storeSettings.print_footer_note}
                           </div>
                        )}
                        <div className={\`grid gap-6 pt-6 text-center text-xs font-bold text-gray-400 relative \${storeSettings.print_signature_3 ? 'grid-cols-3' : 'grid-cols-2'}\`} style={{ zIndex: 10 }}>
                          <div className="border border-dashed border-gray-200 bg-gray-50 p-4 rounded-2xl h-24 flex flex-col justify-between items-center">
                            <span className="text-gray-500">{storeSettings.print_signature_1 || (viewingInvoice.type.includes('warehouse') ? 'تحویل دهنده / مراجعه کننده' : 'مهر و امضای خریدار')}</span>
                          </div>
                          <div className="border border-indigo-200 bg-indigo-50/20 p-4 rounded-2xl h-24 flex flex-col justify-between items-center">
                            <span className="text-indigo-900">{storeSettings.print_signature_2 || (viewingInvoice.type.includes('warehouse') ? \`تایید کننده (انباردار \${storeSettings.storeName})\` : \`مهر و امضای فروشنده (\${storeSettings.storeName})\`)}</span>
                          </div>
                          {storeSettings.print_signature_3 && (
                             <div className="border border-emerald-200 bg-emerald-50/20 p-4 rounded-2xl h-24 flex flex-col justify-between items-center">
                                <span className="text-emerald-900">{storeSettings.print_signature_3}</span>
                             </div>
                          )}
                        </div>`;

code = code.replace(signatureBlockA_old, signatureBlockA_new);

const signatureBlockB_old = `                        {/* Standard Signature Block */}
                        <div className="grid grid-cols-2 gap-6 pt-8 text-center text-xs font-bold text-gray-400 relative" style={{ zIndex: 10 }}>
                          <div className="border border-dashed border-gray-200 bg-gray-50 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-gray-500">{previewInvoiceData.type?.includes('warehouse') ? 'تحویل دهنده / مراجعه کننده' : 'مهر و امضای خریدار'}</span>
                            <span className="text-[10px] text-gray-400">تاریخ و رویت</span>
                          </div>
                          <div className="border border-amber-200 bg-amber-50/20 p-6 rounded-2xl h-32 flex flex-col justify-between items-center">
                            <span className="text-amber-900">{previewInvoiceData.type?.includes('warehouse') ? \`تایید کننده (انباردار \${storeSettings.storeName})\` : \`مهر و امضای فروشنده (\${storeSettings.storeName})\`}</span>
                            <span className="text-[10px] text-amber-600">{previewInvoiceData.type?.includes('warehouse') ? 'تاییدیه ورود/خروج کالا' : 'تضمین اعتبار'}</span>
                          </div>
                        </div>`;

const signatureBlockB_new = `                        {/* Custom Footer Notes & Signature Block */}
                        {storeSettings.print_footer_note && (
                           <div className="mt-8 text-xs font-bold text-slate-500 text-center leading-relaxed">
                              {storeSettings.print_footer_note}
                           </div>
                        )}
                        <div className={\`grid gap-6 pt-6 text-center text-xs font-bold text-gray-400 relative \${storeSettings.print_signature_3 ? 'grid-cols-3' : 'grid-cols-2'}\`} style={{ zIndex: 10 }}>
                          <div className="border border-dashed border-gray-200 bg-gray-50 p-4 rounded-2xl h-24 flex flex-col justify-between items-center">
                            <span className="text-gray-500">{storeSettings.print_signature_1 || (previewInvoiceData.type?.includes('warehouse') ? 'تحویل دهنده / مراجعه کننده' : 'مهر و امضای خریدار')}</span>
                          </div>
                          <div className="border border-amber-200 bg-amber-50/20 p-4 rounded-2xl h-24 flex flex-col justify-between items-center">
                            <span className="text-amber-900">{storeSettings.print_signature_2 || (previewInvoiceData.type?.includes('warehouse') ? \`تایید کننده (انباردار \${storeSettings.storeName})\` : \`مهر و امضای فروشنده (\${storeSettings.storeName})\`)}</span>
                          </div>
                          {storeSettings.print_signature_3 && (
                             <div className="border border-emerald-200 bg-emerald-50/20 p-4 rounded-2xl h-24 flex flex-col justify-between items-center">
                                <span className="text-emerald-900">{storeSettings.print_signature_3}</span>
                             </div>
                          )}
                        </div>`;

code = code.replace(signatureBlockB_old, signatureBlockB_new);

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing signatures');
