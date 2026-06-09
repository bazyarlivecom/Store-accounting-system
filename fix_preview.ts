import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add previewReceiptData state
if (!content.includes('const [previewReceiptData')) {
  content = content.replace(
    'const [previewInvoiceData, setPreviewInvoiceData] = useState<any>(null);',
    'const [previewInvoiceData, setPreviewInvoiceData] = useState<any>(null);\n  const [previewReceiptData, setPreviewReceiptData] = useState<any>(null);'
  );
}

// 2. Modify handleSubmitReceipt
const submitFnRegex = /const handleSubmitReceipt[\s\S]*?(?=const handleSubmitSalary)/;

const match = content.match(submitFnRegex);

const replacement = `const handleSubmitReceipt = (type: 'receive' | 'pay', e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptPersonId || !receiptAmount || !receiptResourceType || !receiptResourceId) {
      customAlert('لطفا تمام اطلاعات الزامی فرم را وارد کنید.');
      return;
    }
    
    const payload = {
        type,
        personId: receiptPersonId,
        amount: Number(receiptAmount),
        date: typeof receiptDate.toDate === 'function' ? receiptDate.toDate().toISOString() : new Date(receiptDate).toISOString(),
        jalaliDate: typeof receiptDate.toDate === 'function' ? new Date(receiptDate.toDate().toISOString()).toLocaleDateString('fa-IR') : new Date(receiptDate).toLocaleDateString('fa-IR'),
        resourceType: receiptResourceType,
        resourceId: receiptResourceId,
        description: receiptDescription
    };
    
    setPreviewReceiptData(payload);
  };
  
  const confirmReceiptSubmit = async () => {
    if (!previewReceiptData) return;
    setSubmittingReceipt(true);
    try {
      await addTransaction(previewReceiptData as any);
      
      setReceiptPersonId('');
      setReceiptAmount('');
      setReceiptResourceType('bank');
      setReceiptResourceId('');
      setReceiptDescription('');
      setReceiptDate(new Date());
      setPreviewReceiptData(null);
      setReceiptPersonSearchText('');
      
      await Promise.all([
        fetchTransactions(),
        fetchPersons(),
        fetchAccounts(),
        fetchCashboxes(),
        fetchChecks()
      ]);
      
    } catch (err) {
      console.error(err);
      customAlert('خطا در ارتباط با سرور.');
    } finally {
      setSubmittingReceipt(false);
    }
  };

  `;

  if(match) {
    content = content.replace(match[0], replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log('Script ran successfully');
  } else {
    console.log('regex fail');
  }
