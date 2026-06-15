const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

const startIndex = lines.findIndex((l, i) => i > 2760 && l.includes("case 'create_warehouse_receipt':"));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes("case 'create_purchase':"));

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find boundaries');
    process.exit(1);
}

const replacement = `        case 'create_warehouse_receipt':
        case 'create_warehouse_remittance': {
           const isReceipt = activeTab === 'create_warehouse_receipt';
           if (warehouseWizardStep === 1) {
              return (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-xl mx-auto">
                       <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                         {isReceipt ? <Plus className="w-6 h-6 text-emerald-600" /> : <ShoppingCart className="w-6 h-6 text-indigo-600" />}
                         {invoiceTitle} - انتخاب انبار و نوع عملیات
                       </h2>
                       <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب انبار</label>
                            <select value={invoiceWarehouseId} onChange={(e) => setInvoiceWarehouseId(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-base font-bold">
                               <option value="">-- انتخاب انبار --</option>
                               {warehouses.filter(w => w.isActive !== false).map((v) => (
                                 <option key={v.id} value={v.id}>{v.name}</option>
                               ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نوع حواله / رسید</label>
                            <select value={warehouseOperationType} onChange={(e) => setWarehouseOperationType(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-base font-bold">
                               {isReceipt ? (
                                  <>
                                     <option value="purchase_invoice">از فاکتور خرید</option>
                                     <option value="sales_return">از برگشت فروش</option>
                                     <option value="transfer">انتقال / سایر ورود</option>
                                  </>
                               ) : (
                                  <>
                                     <option value="sales_invoice">از فاکتور فروش</option>
                                     <option value="purchase_return">از برگشت خرید</option>
                                     <option value="transfer">انتقال / سایر خروج</option>
                                  </>
                               )}
                            </select>
                          </div>
                          <div className="pt-4 border-t border-gray-100 flex justify-end">
                             <button onClick={() => {
                               if(!invoiceWarehouseId) {
                                 customAlert('لطفاً ابتدا انبار را مشخص کنید.');
                                 return;
                               }
                               setWarehouseWizardStep(2);
                             }} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">
                                مرحله بعد
                             </button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              );
           }
           if (warehouseWizardStep === 2) {
              let expectedType = '';
              if (isReceipt) {
                 if (warehouseOperationType === 'purchase_invoice') expectedType = 'purchase';
                 if (warehouseOperationType === 'sales_return') expectedType = 'sale'; // returns use same invoice type often? Actually, let's keep it simple: filter by type
              } else {
                 if (warehouseOperationType === 'sales_invoice') expectedType = 'sale';
                 if (warehouseOperationType === 'purchase_return') expectedType = 'purchase';
              }

              const relevantInvoices = expectedType ? invoices.filter(i => i.type === expectedType && hasRemainingWarehouseItems(i.id)) : [];

              return (
                 <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-right font-sans">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
                       <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                         {isReceipt ? <Plus className="w-6 h-6 text-emerald-600" /> : <ShoppingCart className="w-6 h-6 text-indigo-600" />}
                         {invoiceTitle} - انتخاب سند مرجع
                       </h2>
                       <div className="space-y-6">
                          {warehouseOperationType !== 'transfer' ? (
                            <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب فاکتور مرتبط</label>
                               <SearchableSelect
                                 options={relevantInvoices.map(i => ({
                                   value: i.id,
                                   label: \`فاکتور \${i.invoiceMode === 'manual' ? '(دستی) ' : ''}#\${i.invoiceNumber}\`,
                                   subLabel: \`مبلغ: \${formatCurrency(i.totalAmount || 0)} \${i.currency || 'تومان'} - مشتری: \${persons.find(p => p.id.toString() === i.customerId?.toString())?.name || 'نامشخص'}\`,
                                 }))}
                                 value={String(sourceInvoiceId || '')}
                                 onChange={(val) => setSourceInvoiceId(val)}
                                 placeholder="-- فاکتور مورد نظر را جستجو و انتخاب کنید --"
                                 searchPlaceholder="جستجو در فاکتورها..."
                               />
                               <div className="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm font-bold text-amber-800 flex items-start gap-2">
                                  <input type="checkbox" id="deletePrev" checked={deletePreviousDocs} onChange={e => setDeletePreviousDocs(e.target.checked)} className="mt-1 w-4 h-4 cursor-pointer" />
                                  <label htmlFor="deletePrev" className="cursor-pointer">
                                     حذف حواله‌های انبار قبلی برای این فاکتور (تنظیم مجدد رسید/حواله)
                                  </label>
                               </div>
                            </div>
                          ) : (
                            <div className="bg-indigo-50 p-6 rounded-xl text-indigo-800 text-center font-bold">
                               صدور سند آزاد (مستقیم)
                            </div>
                          )}

                          <div className="pt-4 border-t border-gray-100 flex justify-between">
                             <button onClick={() => setWarehouseWizardStep(1)} className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-colors">
                                مرحله قبل
                             </button>
                             <button onClick={() => {
                                if (warehouseOperationType !== 'transfer' && !sourceInvoiceId) {
                                  customAlert('لطفاً فاکتور مرجع را انتخاب کنید');
                                  return;
                                }
                                if (warehouseOperationType !== 'transfer') {
                                    const sourceInv = invoices.find(i => i.id.toString() === sourceInvoiceId?.toString());
                                    if (sourceInv) {
                                        if (isReceipt) {
                                            setInvoiceDescription(\`رسید ورود به انبار - فاکتور مرجع # \${sourceInv.invoiceNumber}\`);
                                        } else {
                                            setInvoiceDescription(\`حواله خروج از انبار - فاکتور مرجع # \${sourceInv.invoiceNumber}\`);
                                        }
                                        if (sourceInv.customerId) setCustomerId(sourceInv.customerId);
                                        if (sourceInv.currency) {
                                            setInvoiceCurrency(sourceInv.currency);
                                            setExchangeRate(sourceInv.exchangeRate || 1);
                                            setExchangeRateInput(String(sourceInv.exchangeRate || 1));
                                        }
                                        
                                        let processedAmounts = {};
                                        if (deletePreviousDocs) {
                                            // Delete past docs
                                            const pastDocs = invoices.filter(i => 
                                              i.sourceInvoiceId?.toString() === sourceInvoiceId?.toString() && 
                                              (isReceipt ? i.type === 'warehouse_receipt' : i.type === 'warehouse_remittance')
                                            );
                                            if (pastDocs.length > 0) {
                                              setInvoices(prev => prev.filter(p => !pastDocs.find(pd => pd.id === p.id)));
                                            }
                                        } else {
                                            const pastDocs = invoices.filter(i => 
                                              i.sourceInvoiceId?.toString() === sourceInvoiceId?.toString() && 
                                              (isReceipt ? i.type === 'warehouse_receipt' : i.type === 'warehouse_remittance')
                                            );
                                            pastDocs.forEach(doc => {
                                              if (doc.items) {
                                                doc.items.forEach((rt) => {
                                                   const key = String(rt.productId || rt.productName || '');
                                                   if (!key) return;
                                                   if (!processedAmounts[key]) processedAmounts[key] = 0;
                                                   processedAmounts[key] += Number(rt.quantity) || 0;
                                                });
                                              }
                                            });
                                        }
                                        
                                        const remainingItems = sourceInv.items.map((it) => {
                                          const key = String(it.productId || it.productName || '');
                                          const processed = key ? (processedAmounts[key] || 0) : 0;
                                          const remaining = (Number(it.quantity) || 0) - processed;
                                          return {
                                            ...it,
                                            id: generateId(),
                                            maxQuantity: remaining > 0 ? remaining : 0,
                                            quantity: remaining > 0 ? remaining : 0,
                                            warehouseId: invoiceWarehouseId,
                                          };
                                        }).filter((it) => it.quantity > 0);

                                        setItems(remainingItems);
                                    }
                                } else {
                                   setSourceInvoiceId('');
                                   setItems([]);
                                }
                                setWarehouseWizardStep(3);
                             }} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">
                                تایید و تهیه فرم
                             </button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              );
           }
           if (warehouseWizardStep === 3) {
              return (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-right">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                       <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                         {isReceipt ? <Plus className="w-6 h-6 text-emerald-600" /> : <ShoppingCart className="w-6 h-6 text-indigo-600" />}
                         {invoiceTitle} - صدور نهایی
                       </h2>
                       <button onClick={() => setWarehouseWizardStep(2)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 text-sm">مرحله قبل</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{isReceipt ? 'شماره رسید' : 'شماره حواله'}</label>
                        <div className="flex gap-2">
                            <select value={invoiceMode} onChange={(e) => setInvoiceMode(e.target.value)} className="p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm">
                              <option value="auto">خودکار</option>
                              <option value="manual">دستی</option>
                            </select>
                            {invoiceMode === 'manual' && (
                              <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="flex-1 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-left" dir="ltr" placeholder="شماره..." />
                            )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500 animate-pulse"/> {isReceipt ? 'تاریخ رسید' : 'تاریخ حواله'}</label>
                        <div className="relative">
                          <DatePicker
                              value={date}
                              onChange={setDate}
                              calendar={storeSettings?.calendarType === 'gregorian' ? undefined : persian}
                              locale={storeSettings?.calendarType === 'gregorian' ? undefined : persian_fa}
                              calendarPosition="bottom-right"
                              inputClass="w-full pl-11 pr-4 p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-indigo-950 font-sans font-black text-center transition-all cursor-pointer shadow-sm text-sm"
                              containerClassName="w-full"
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                            <Calendar className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><User className="w-4 h-4"/> نام تامین کننده یا خریدار</label>
                        <SearchableSelect 
                          options={persons.map(p => ({
                            value: p.id,
                            label: p.alias || p.name,
                            subLabel: p.phone || undefined,
                            badge: getRoleName(p.role)
                          }))}
                          value={String(customerId || '')}
                          onChange={val => setCustomerId(val)}
                          placeholder="-- انتخاب کنید --"
                          searchPlaceholder="جستجوی شخص..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">انبار انتخابی</label>
                        <div className="w-full p-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 text-center">
                           {warehouses.find(w => w.id?.toString() === invoiceWarehouseId?.toString())?.name || 'نامشخص'}
                        </div>
                      </div>
                      <div className="lg:col-span-4 mt-2">
                         <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><FileText className="w-4 h-4 text-emerald-500"/> توضیحات</label>
                         <input
                             type="text"
                             value={invoiceDescription || ''}
                             onChange={(e) => setInvoiceDescription(e.target.value)}
                             className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                             placeholder="توضیحات مربوط به این سند..."
                         />
                      </div>
                    </div>
                  </div>
    
                  {/* Items List */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col justify-between items-center gap-4">
                        <div className="w-full flex justify-between">
                            <h3 className="font-extrabold text-gray-900 flex items-center gap-2 whitespace-nowrap"><Package className="w-5 h-5 text-indigo-600"/> اقلام سند</h3>
                            <button onClick={handleAddItem} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 shadow-sm rounded-xl font-bold hover:bg-gray-100 flex items-center gap-2 transition-colors whitespace-nowrap">
                              <Plus className="w-4 h-4" /> افزودن سطر دستی
                            </button>
                        </div>
                        <div className="w-full relative z-10 ">
                             <SearchableSelect 
                               options={products.map(p => ({
                                 value: p.id,
                                 label: p.name,
                                 subLabel: formatProductStockDetails(p),
                                 badge: p.type === 'service' ? 'خدمات' : 'کالا',
                                 searchStr: \`\${p.code || ''} \${p.barcode || ''}\`
                               }))}
                               value=""
                               onChange={(val) => handleFastAddProduct(String(val))}
                               placeholder="🔎 جستجو و افزودن سریع کالا به لیست..."
                               searchPlaceholder="جستجوی کالا..."
                             />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right min-w-[800px]">
                          <thead>
                            <tr className="bg-white text-sm text-gray-500 border-b border-gray-100">
                              <th className="p-4 font-bold w-12 text-center">ردیف</th>
                              <th className="p-4 font-bold min-w-[200px] w-[50%] text-right">شرح کالا</th>
                              <th className="p-4 font-bold w-32 text-center">تعداد</th>
                              <th className="p-4 font-bold w-32 text-center border-r border-gray-100">واحد</th>
                              <th className="p-4 font-bold w-12 text-center border-r border-gray-100">حذف</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {items.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400 font-bold text-sm bg-gray-50/50">
                                  <div className="flex flex-col items-center justify-center space-y-2">
                                    <Package className="w-8 h-8 text-indigo-200" />
                                    <span>هیچ کالایی به این سند اضافه نشده است.</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                                  <td className="p-4">
                                      {item.productId ? (
                                        <div className="font-extrabold text-slate-800 flex flex-col gap-1">
                                          <span>{item.productName}</span>
                                          {(() => {
                                            const p = products.find(prod => prod.id === item.productId);
                                            return <span className="text-xs text-slate-400 font-normal flex gap-2">کالای سیستمی {p?.code ? <span className="font-mono bg-slate-100 px-1 rounded">کد: {p.code}</span> : ''} {p?.barcode ? <span className="font-mono bg-slate-100 px-1 rounded">بارکد: {p.barcode}</span> : ''}</span>;
                                          })()}
                                        </div>
                                      ) : (
                                        <input
                                          type="text"
                                          placeholder="نام کالا دلخواه..."
                                          value={item.productName}
                                          onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                                        />
                                      )}
                                  </td>
                                  <td className="p-4">
                                      <div className="flex flex-col gap-1.5">
                                        <CurrencyInput hideWords value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans text-center font-bold text-indigo-900" />
                                        {isReceipt && typeof item.maxQuantity !== 'undefined' && item.maxQuantity > 0 && (
                                           <span className="text-[10px] text-gray-500 text-center font-bold mt-1">
                                              حداکثر סقף مجاز: {item.maxQuantity}
                                           </span>
                                        )}
                                      </div>
                                  </td>
                                  <td className="p-4 text-center">
                                      {(() => {
                                        const product = item.productId ? products.find((p) => p.id.toString() === String(item.productId)) : null;
                                        const hasSecondary = product?.secondaryUnit;
                                        return (
                                          <div className="flex flex-col gap-1.5">
                                            {hasSecondary ? (
                                              <select value={item.isSecondaryUnit ? "true" : "false"} onChange={(e) => handleItemChange(item.id, 'isSecondaryUnit', e.target.value === 'true')} className="w-full p-2 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-slate-400">
                                                <option value="false">{product.unit} (اصلی)</option>
                                                <option value="true">{product.secondaryUnit} (فرعی)</option>
                                              </select>
                                            ) : product ? (
                                              <div className="w-full p-2 text-center text-slate-600 font-bold bg-slate-50 border border-slate-100 rounded-xl text-sm shadow-sm">
                                                {product.unit || '-'}
                                              </div>
                                            ) : (
                                              <input
                                                type="text"
                                                value={item.selectedUnit || ''}
                                                onChange={(e) => handleItemChange(item.id, 'selectedUnit', e.target.value)}
                                                placeholder="واحد..."
                                                className="w-full p-2 text-center text-slate-700 font-bold bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                              />
                                            )}
                                          </div>
                                        );
                                      })()}
                                  </td>
                                  <td className="p-4 text-center">
                                      <button onClick={() => handleRemoveItem(item.id)} className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                                        <Trash2 className="w-5 h-5"/>
                                      </button>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end">
                       <button onClick={handleInvoicePreviewTrigger} disabled={submitting || items.length === 0} className="px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-500/20">
                         {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                         {isReceipt ? 'صدور نهایی رسید انبار' : 'صدور نهایی حواله انبار'}
                       </button>
                    </div>
                  </div>
                 </motion.div>
              );
           }
        }`;

const newLines = [
    ...lines.slice(0, startIndex),
    replacement,
    ...lines.slice(endIndex)
];

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
console.log('Successfully replaced logic.');
