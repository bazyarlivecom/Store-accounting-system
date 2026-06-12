import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `              {/* Totals & Submit */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-indigo-50 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-10">`;

const newStr = `              {/* Totals & Submit */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-indigo-50 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                     {(!activeTab.includes('warehouse')) && (
                        <div className="flex w-full flex-col lg:flex-row justify-between gap-10">`;
content = content.replace(targetStr, newStr);

const targetStr2 = `                          {calculateFinalTotal() > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-indigo-200 text-right leading-relaxed text-xs font-bold text-indigo-700">
                              <span className="text-indigo-900 font-black">{numToPersianWords(calculateFinalTotal())} {invoiceCurrency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
                <div className="p-6 bg-indigo-50/20 border-t border-indigo-100 flex justify-end gap-3">`;

const newStr2 = `                          {calculateFinalTotal() > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-indigo-200 text-right leading-relaxed text-xs font-bold text-indigo-700">
                              <span className="text-indigo-900 font-black">{numToPersianWords(calculateFinalTotal())} {invoiceCurrency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                     )}
                  </div>
                </div>
                <div className="p-6 bg-indigo-50/20 border-t border-indigo-100 flex justify-end gap-3">`;

content = content.replace(targetStr2, newStr2);
fs.writeFileSync('src/App.tsx', content);
console.log('patched create totals');
