const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add confirmState to App component
const stateStr = `  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});
  const confirmAction = (message: string, onConfirm: () => void) => {
    setConfirmState({isOpen: true, message, onConfirm});
  };`;

content = content.replace("export default function App() {", "export default function App() {\n" + stateStr);

const modalStr = `
      {confirmState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 border border-gray-100" dir="rtl">
            <div className="flex items-center gap-3 text-indigo-600">
               <AlertTriangle className="w-8 h-8" />
               <h3 className="font-extrabold text-lg">تایید عملیات</h3>
            </div>
            <p className="text-gray-700 font-semibold">{confirmState.message}</p>
            <div className="flex items-center gap-3 mt-4">
               <button onClick={() => { confirmState.onConfirm(); setConfirmState({...confirmState, isOpen: false}) }} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">بله، تایید</button>
               <button onClick={() => setConfirmState({...confirmState, isOpen: false})} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">انصراف</button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("return (", "return (\n    <>\n" + modalStr);
content = content.replace(/}\);?(\s*)$/, "  </>\n  );\n}");

// 2. Wrap form submissions & deletes
const handlers = [
    { name: 'submitInvoice', msg: 'آیا از ثبت نهایی فاکتور اطمینان دارید؟', isForm: true },
    { name: 'handleSaveSettings', msg: 'آیا از ذخیره تنظیمات اطمینان دارید؟', isForm: true },
    { name: 'handleSubmitReceipt', msg: 'آیا از ثبت رسید اطمینان دارید؟', isForm: true },
    { name: 'handleSubmitSalary', msg: 'آیا از ثبت حقوق و دستمزد اطمینان دارید؟', isForm: true },
    { name: 'handleSubmitProduct', msg: 'آیا از ثبت اطلاعات کالا/خدمات اطمینان دارید؟', isForm: true },
    { name: 'handleSubmitPerson', msg: 'آیا از ثبت اطلاعات شخص اطمینان دارید؟', isForm: true },
    { name: 'handleSubmitAccount', msg: 'آیا از ثبت حساب بانکی اطمینان دارید؟', isForm: true },
    { name: 'handleSubmitCashbox', msg: 'آیا از ثبت صندوق اطمینان دارید؟', isForm: true },
    { name: 'handleSubmitCategory', msg: 'آیا از ثبت گروه کالایی اطمینان دارید؟', isForm: true },
    { name: 'handleSaveCategory', msg: 'آیا از ثبت گروه کالایی اطمینان دارید؟'},
    { name: 'clearDatabase', msg: 'توجه: آیا از پاک کردن کلیه اطلاعات پایگاه داده اطمینان دارید؟ این عملیات غیرقابل بازگشت است!' },
    
    // Deletes
    { name: 'handleDeleteCategory', msg: 'آیا از حذف این گروه اطمینان دارید؟' },
    { name: 'handleDeleteProduct', msg: 'آیا از حذف این کالا اطمینان دارید؟' },
    { name: 'handleDeletePerson', msg: 'آیا از حذف این شخص اطمینان دارید؟' },
    { name: 'handleDeleteAccount', msg: 'آیا از حذف این حساب بانکی اطمینان دارید؟' },
    { name: 'handleDeleteCashbox', msg: 'آیا از حذف این صندوق اطمینان دارید؟' },
    { name: 'handleDeleteTransaction', msg: 'آیا از حذف این تراکنش / فاکتور اطمینان دارید؟' },
];

for(const h of handlers) {
    if (h.isForm) {
        // e.g. onSubmit={submitInvoice} => onSubmit={(e) => { e.preventDefault(); confirmAction(msg, () => submitInvoice(e as any)) }}
        let rx = new RegExp('onSubmit={' + h.name + '}', 'g');
        content = content.replace(rx, `onSubmit={(e) => { e.preventDefault(); confirmAction('${h.msg}', () => ${h.name}(e as any)) }}`);
        
        let rx2 = new RegExp('onSubmit={\\(e\\) => ' + h.name + '\\((.*?)\\)}', 'g');
        content = content.replace(rx2, `onSubmit={(e) => { e.preventDefault(); confirmAction('${h.msg}', () => ${h.name}($1)) }}`);
    } else {
        // onClick={() => handleDeleteCategory(c.id)}
        // => onClick={() => confirmAction(msg, () => handleDeleteCategory(c.id))}
        let rx = new RegExp('onClick={\\(\\) => ' + h.name + '\\((.*?)\\)}', 'g');
        content = content.replace(rx, `onClick={() => confirmAction('${h.msg}', () => ${h.name}($1))}`);
    }
}

// category is special, wait we missed form submission for category? Let me check how category is submitted.

fs.writeFileSync('src/App.tsx', content);
console.log('DONE');
