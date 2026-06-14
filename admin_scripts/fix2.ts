import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const searchStr = `<div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <User className="w-4 h-4"/> طرف حساب (شخص/شرکت)
                        </label>
                        <div 
                          className={\`w-full p-2.5 border border-slate-200 bg-white rounded-xl focus-within:ring-2 \${themeRing} font-bold text-sm text-slate-800 outline-none transition-shadow flex items-center justify-between cursor-pointer\`}
                          onClick={() => setIsReceiptPersonDropdownOpen(!isReceiptPersonDropdownOpen)}
                        >
                          <span className={!receiptPersonId ? 'text-gray-400' : 'text-slate-800'}>
                             {receiptPersonId ? persons.find(p => p.id.toString() === receiptPersonId?.toString())?.name || persons.find(p => p.id.toString() === receiptPersonId?.toString())?.alias || 'نامشخص' : '-- انتخاب کنید --'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        {isReceiptPersonDropdownOpen && (
                          <div className="absolute top-[calc(100%+0.25rem)] right-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 flex flex-col overflow-hidden">
                            <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                               <Search className="w-4 h-4 text-slate-400 shrink-0" />
                               <input 
                                 type="text" 
                                 placeholder="جستجوی نام یا تلفن..." 
                                 className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                                 value={receiptPersonSearchText}
                                 onChange={(e) => setReceiptPersonSearchText(e.target.value)}
                                 onClick={(e) => e.stopPropagation()}
                                 onKeyDown={(e) => { if(e.key === 'Escape') setIsReceiptPersonDropdownOpen(false) }}
                                 autoFocus
                               />
                            </div>
                            <div className="overflow-y-auto">
                              <div 
                                className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-600 border-b border-slate-50"
                                onClick={() => { setReceiptPersonId(''); setIsReceiptPersonDropdownOpen(false); setReceiptPersonSearchText(''); }}
                              >
                                -- انتخاب کنید --
                              </div>
                              {persons.filter(p => {
                                const st = receiptPersonSearchText.toLowerCase();
                                const searchStr = \`\${p.name} \${p.alias || ''} \${p.firstName || ''} \${p.lastName || ''} \${p.nationalId || ''} \${p.personCode || ''} \${p.phone || ''}\`.toLowerCase();
                                return searchStr.includes(st);
                              }).map(p => (
                                <div 
                                  key={p.id}
                                  className={\`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-bold transition-colors border-b border-slate-50/50 flex flex-col gap-1 \${receiptPersonId?.toString() === p.id.toString() ? 'bg-indigo-50/50 text-indigo-700 border-indigo-100/50' : 'text-slate-800'}\`}
                                  onClick={() => { setReceiptPersonId(p.id); setIsReceiptPersonDropdownOpen(false); setReceiptPersonSearchText(''); }}
                                >
                                  <span className="flex items-center justify-between">
                                    <span>{p.name} {p.alias ? \`(\${p.alias})\` : ''}</span>
                                    {p.phone && <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">{p.phone}</span>}
                                  </span>
                                </div>
                              ))}
                              {persons.filter(p => {
                                const st = receiptPersonSearchText.toLowerCase();
                                const searchStr = \`\${p.name} \${p.alias || ''} \${p.firstName || ''} \${p.lastName || ''} \${p.nationalId || ''} \${p.personCode || ''} \${p.phone || ''}\`.toLowerCase();
                                return searchStr.includes(st);
                              }).length === 0 && (
                                <div className="px-4 py-6 text-center text-sm font-bold text-rose-500 bg-rose-50/30">شخصی با این مشخصات یافت نشد</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>`;

const replaceStr = `                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <User className="w-4 h-4"/> طرف حساب (شخص/شرکت)
                        </label>
                        <Select
                          isRtl
                          value={receiptPersonId ? { value: receiptPersonId, label: persons.find(p => p.id.toString() === receiptPersonId.toString())?.personCode ? '[' + persons.find(p => p.id.toString() === receiptPersonId.toString())?.personCode + '] ' + (persons.find(p => p.id.toString() === receiptPersonId.toString())?.alias || persons.find(p => p.id.toString() === receiptPersonId.toString())?.name) : (persons.find(p => p.id.toString() === receiptPersonId.toString())?.alias || persons.find(p => p.id.toString() === receiptPersonId.toString())?.name) } : null}
                          onChange={(option: any) => setReceiptPersonId(option ? option.value : '')}
                          options={persons.map(mapPersonToOption) as any}
                          filterOption={customPersonFilter}
                          placeholder="انتخاب یا جستجوی نام شخص..."
                          noOptionsMessage={() => "شخصی یافت نشد"}
                          isClearable
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: '0.75rem',
                              borderColor: '#E5E7EB',
                              padding: '2px',
                              boxShadow: 'none',
                              '&:hover': { borderColor: isReceive ? '#34D399' : '#FB7185' }
                            })
                          }}
                        />
                        <input
                          type="hidden"
                          required
                          value={receiptPersonId}
                          onChange={() => {}}
                        />
                      </div>`;

if(content.includes(searchStr)) {
    console.log('Replacing!');
    fs.writeFileSync('src/App.tsx', content.replace(searchStr, replaceStr));
} else {
    console.log('Not found!');
}
