import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /invoices\s*\.filter\(inv => inv\.type !== 'purchase'\)\s*\.reduce\(\(sum, inv\) => sum \+ \(inv\.totalAmount \|\| 0\) \* getDefaultExchangeRate\(inv\.currency, storeSettings\.currency\), 0\)/g,
  "invoices.filter(inv => inv.type !== 'purchase' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)"
);

code = code.replace(
  /invoices\s*\.filter\(inv => inv\.type === 'purchase'\)\s*\.reduce\(\(sum, inv\) => sum \+ \(inv\.totalAmount \|\| 0\) \* getDefaultExchangeRate\(inv\.currency, storeSettings\.currency\), 0\)/g,
  "invoices.filter(inv => inv.type === 'purchase' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, inv) => sum + (inv.totalAmount || 0) * getDefaultExchangeRate(inv.currency, storeSettings.currency), 0)"
);

code = code.replace(
  /transactions\.filter\(t => t\.type === 'receive'\)\.reduce\(\(sum, t\) => sum \+ \(t\.amount \|\| 0\), 0\)/g,
  "transactions.filter(t => t.type === 'receive' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(t.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(t.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, t) => sum + (t.amount || 0), 0)"
);

code = code.replace(
  /transactions\.filter\(t => t\.type === 'pay'\)\.reduce\(\(sum, t\) => sum \+ \(t\.amount \|\| 0\), 0\)/g,
  "transactions.filter(t => t.type === 'pay' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(t.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(t.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).reduce((sum, t) => sum + (t.amount || 0), 0)"
);

// We need to add the date picker widget inside the financial report header
const headerTarget = `</div>
            <button
              onClick={async () => {
                await Promise.all([
                  fetchInvoices(),
                  fetchTransactions(),
                  fetchAccounts(),
                  fetchCashboxes()
                ]);
              }}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm border border-indigo-100 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              بروزرسانی داده‌ها
            </button>
          </div>`;

const withDatePicker = `</div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                 <span className="text-xs font-bold text-gray-500">بازه زمانی:</span>
                 <DatePicker
                   range
                   dateSeparator=" تا "
                   value={reportDateRange as any}
                   onChange={setReportDateRange as any}
                   calendar={persian}
                   locale={persian_fa}
                   calendarPosition="bottom-right"
                   inputClass="text-sm font-bold text-indigo-700 bg-transparent border-none outline-none max-w-[170px] text-center"
                   placeholder="انتخاب بازه تاریخ..."
                 />
                 {reportDateRange && reportDateRange.length > 0 && (
                   <button onClick={() => setReportDateRange([])} className="text-gray-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                 )}
              </div>
              <button
                onClick={async () => {
                  await Promise.all([
                    fetchInvoices(),
                    fetchTransactions(),
                    fetchAccounts(),
                    fetchCashboxes()
                  ]);
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm border border-indigo-100 shadow-sm"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                بروزرسانی داده‌ها
              </button>
            </div>
          </div>`;

code = code.replace(headerTarget, withDatePicker);

// Filter lengths as well
code = code.replace(
  /invoices\.filter\(inv => inv\.type !== 'purchase'\)\.length/g,
  "invoices.filter(inv => inv.type !== 'purchase' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).length"
);

code = code.replace(
  /invoices\.filter\(inv => inv\.type === 'purchase'\)\.length/g,
  "invoices.filter(inv => inv.type === 'purchase' && (!reportDateRange || reportDateRange.length !== 2 || (new Date(inv.date).setHours(0,0,0,0) >= new Date(reportDateRange[0]).setHours(0,0,0,0) && new Date(inv.date).valueOf() <= new Date(reportDateRange[1]).setHours(23,59,59,999)))).length"
);

fs.writeFileSync('src/App.tsx', code);
