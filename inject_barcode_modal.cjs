const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const generateBarcodesModal = `              {isGenerateBarcodesModalOpen && (
                <div
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                  dir="rtl"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-xl"
                  >
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <BarcodeIcon className="w-5 h-5 text-indigo-500" />{" "}
                        تولید خودکار بارکد برای کالاها
                      </h3>
                      <button
                        onClick={() => setIsGenerateBarcodesModalOpen(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                      <div className="bg-indigo-50 text-indigo-700 text-xs font-medium p-4 rounded-xl leading-relaxed border border-indigo-100">
                        این عملیات برای تمامی کالاهایی که فاقد بارکد هستند، بر اساس فرمت انتخابی شما بارکد جدید و یکتا تولید خواهد کرد.
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            پیشوند بارکد
                          </label>
                          <input
                            type="text"
                            value={barcodePrefix}
                            onChange={(e) => setBarcodePrefix(e.target.value)}
                            dir="ltr"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900 font-sans"
                            placeholder="مثال: PRD-"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              شروع شمارنده از
                            </label>
                            <input
                              type="number"
                              value={barcodeStartNumber}
                              onChange={(e) => setBarcodeStartNumber(Number(e.target.value))}
                              dir="ltr"
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900 font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              طول عدد ثابت (حداقل)
                            </label>
                            <input
                              type="number"
                              value={barcodeLength}
                              onChange={(e) => setBarcodeLength(Number(e.target.value))}
                              dir="ltr"
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900 font-sans"
                            />
                          </div>
                        </div>

                        <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                           <span className="text-xs font-bold text-slate-500">پیش‌نمایش فرمت اولین بارکد:</span>
                           <span className="text-lg font-black font-sans text-indigo-700 tracking-wider">
                              {barcodePrefix}{String(barcodeStartNumber).padStart(barcodeLength, "0")}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
                      <button
                        onClick={() => setIsGenerateBarcodesModalOpen(false)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-bold text-sm shadow-sm"
                        disabled={submittingProduct}
                      >
                        انصراف
                      </button>
                      <button
                        onClick={handleGenerateBarcodes}
                        disabled={submittingProduct}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submittingProduct ? (
                           <>
                             <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                             در حال پردازش...
                           </>
                        ) : (
                          "تولید و تخصیص بارکدها"
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {isGroupPriceModalOpen && (`;

code = code.replace('{isGroupPriceModalOpen && (', generateBarcodesModal);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log('injected barcode generator modal');
