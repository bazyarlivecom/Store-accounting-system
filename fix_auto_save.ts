import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states for draft
const stateInjection = `
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  
  // Auto-save effect
  useEffect(() => {
    if (['create_sale', 'create_purchase', 'create_warehouse_receipt', 'create_warehouse_remittance'].includes(activeTab)) {
       const draft = {
         invoiceMode,
         invoiceNumber,
         customerId,
         sourceInvoiceId,
         items,
         overallDiscountPercent,
         invoiceCurrency,
         exchangeRate,
         exchangeRateInput,
         invoiceType,
         invoiceTitle,
         activeTab,
       };
       if (items.length > 0 || customerId) {
         localStorage.setItem('invoice_draft', JSON.stringify(draft));
         setHasDraft(true);
       } else {
         localStorage.removeItem('invoice_draft');
         setHasDraft(false);
       }
    }
  }, [items, customerId, invoiceNumber, sourceInvoiceId, overallDiscountPercent, invoiceCurrency, exchangeRate, invoiceMode, invoiceType, invoiceTitle, activeTab]);
  
  useEffect(() => {
    if (localStorage.getItem('invoice_draft')) {
      setHasDraft(true);
    }
  }, []);
  
  const restoreDraft = () => {
    const d = localStorage.getItem('invoice_draft');
    if (d) {
      try {
        const parsed = JSON.parse(d);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        setInvoiceMode(parsed.invoiceMode || 'auto');
        setInvoiceNumber(parsed.invoiceNumber || '');
        setCustomerId(parsed.customerId || '');
        setSourceInvoiceId(parsed.sourceInvoiceId || '');
        setItems(parsed.items || []);
        setOverallDiscountPercent(parsed.overallDiscountPercent || 0);
        setInvoiceCurrency(parsed.invoiceCurrency || 'تومان');
        setExchangeRate(parsed.exchangeRate || 1);
        setExchangeRateInput(parsed.exchangeRateInput || '1');
        
        // Timeout to let activeTab's effect finish, then override
        setTimeout(() => {
          setInvoiceType(parsed.invoiceType || 'sale');
          setInvoiceTitle(parsed.invoiceTitle || '');
        }, 50);
        
        showNotification('وضعیت ثبت نشده فاکتور، بازیابی شد.', 'info');
      } catch (e) {}
    }
  };
  
  const clearDraft = () => {
    localStorage.removeItem('invoice_draft');
    setHasDraft(false);
    setCustomerId('');
    setItems([]);
    setOverallDiscountPercent(0);
    setSourceInvoiceId('');
    if (invoiceMode === 'manual') setInvoiceNumber('');
  };
`;

if (!code.includes('const [hasDraft, setHasDraft]')) {
  code = code.replace(
    "  const [items, setItems] = useState<InvoiceItem[]>([]);",
    stateInjection + "\n  const [items, setItems] = useState<InvoiceItem[]>([]);"
  );
}

// 2. Remove draft on success
const successRes = `      // Reset form after short delay
      clearDraft();
      setTimeout(() => {`;
if (!code.includes('clearDraft();')) {
  code = code.replace(
    "      // Reset form after short delay\n      setTimeout(() => {",
    successRes
  );
}

// 3. Render restore button
const divStart = `<motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-right font-sans">`;
const promptHtml = `{hasDraft && (
                 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center text-amber-800 shadow-sm col-span-full w-full">
                    <span className="font-bold flex items-center gap-2.5 mb-3 md:mb-0"><History className="w-5 h-5 text-amber-500" /> یک فاکتور ناتمام و ثبت نشده بازیابی شد. مایلید از آن استفاده کنید یا فاکتور جدیدی آغاز کنید؟</span>
                    <div className="flex gap-2">
                       <button onClick={restoreDraft} className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-sm font-bold transition-colors">بازیابی فاکتور ناتمام</button>
                       <button onClick={clearDraft} className="px-4 py-2.5 bg-white border border-amber-200 hover:bg-amber-50 rounded-xl text-sm font-bold transition-colors">پاک کردن و فاکتور جدید</button>
                    </div>
                 </div>
              )}`;

code = code.replace(new RegExp(divStart.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), divStart + '\n              ' + promptHtml);

fs.writeFileSync('src/App.tsx', code);
console.log('done auto-save patch setup');
