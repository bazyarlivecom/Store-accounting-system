import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

const stateLineIdx = lines.findIndex(l => l.includes('const [hasDraft, setHasDraft]'));

if (stateLineIdx !== -1) {
  lines.splice(stateLineIdx + 1, 0, '  const [receiptHasDraft, setReceiptHasDraft] = useState<boolean>(false);');
}

// Add auto-save effect for receipt
const receiptEffectCode = `
  // Auto-save effect for receipt
  useEffect(() => {
    if (["create_receive_receipt", "create_pay_receipt"].includes(activeTab)) {
      const draft = {
        receiptPersonId,
        receiptDate,
        receiptAmount,
        receiptResourceType,
        receiptMethod,
        receiptCheckNumber,
        receiptCheckDueDate,
        receiptCheckBankName,
        receiptCheckbookId,
        receiptResourceId,
        receiptDescription,
        receiptLinkedInvoices,
        activeTab
      };
      
      if (receiptPersonId || receiptAmount || receiptDescription) {
        localStorage.setItem("receipt_draft", JSON.stringify(draft));
        setReceiptHasDraft(true);
      } else {
        localStorage.removeItem("receipt_draft");
        setReceiptHasDraft(false);
      }
    }
  }, [
    receiptPersonId,
    receiptDate,
    receiptAmount,
    receiptResourceType,
    receiptMethod,
    receiptCheckNumber,
    receiptCheckDueDate,
    receiptCheckBankName,
    receiptCheckbookId,
    receiptResourceId,
    receiptDescription,
    receiptLinkedInvoices,
    activeTab
  ]);

  useEffect(() => {
    if (localStorage.getItem("receipt_draft")) {
      setReceiptHasDraft(true);
    }
  }, []);

  const restoreReceiptDraft = () => {
    const d = localStorage.getItem("receipt_draft");
    if (d) {
      try {
        const parsed = JSON.parse(d);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        setReceiptPersonId(parsed.receiptPersonId || "");
        setReceiptDate(parsed.receiptDate || new Date());
        setReceiptAmount(parsed.receiptAmount || "");
        setReceiptResourceType(parsed.receiptResourceType || "cashbox");
        setReceiptMethod(parsed.receiptMethod || "cash");
        setReceiptCheckNumber(parsed.receiptCheckNumber || "");
        setReceiptCheckDueDate(parsed.receiptCheckDueDate || new Date());
        setReceiptCheckBankName(parsed.receiptCheckBankName || "");
        setReceiptCheckbookId(parsed.receiptCheckbookId || "");
        setReceiptResourceId(parsed.receiptResourceId || "");
        setReceiptDescription(parsed.receiptDescription || "");
        setReceiptLinkedInvoices(parsed.receiptLinkedInvoices || []);
        
        showNotification("پیشنویس رسید دریافت/پرداخت بازیابی شد.", "info");
      } catch (e) {}
    }
  };

  const discardReceiptDraft = () => {
    localStorage.removeItem("receipt_draft");
    setReceiptHasDraft(false);
    
    // clear form
    setReceiptPersonId("");
    setReceiptAmount("");
    setReceiptDescription("");
    setReceiptLinkedInvoices([]);
    setReceiptMethod("cash");
    setReceiptResourceType("cashbox");
    showNotification("پیشنویس رسید حذف شد.", "info");
  };
`;

const invoiceEffectIdx = lines.findIndex(l => l.includes('// Auto-save effect'));

if (invoiceEffectIdx !== -1) {
  lines.splice(invoiceEffectIdx, 0, ...receiptEffectCode.split('\\n'));
}

fs.writeFileSync('src/App.tsx', lines.join('\\n'));
