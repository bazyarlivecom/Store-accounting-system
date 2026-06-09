import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /\{\/\* Invoice PRE-REGISTER Preview overlay \*\/\}/;

const modalHTML = `
        {/* Receipt PRE-REGISTER Preview overlay */}
        {previewReceiptData && (() => {
          const isReceive = previewReceiptData.type === 'receive';
          const themeBg = isReceive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700';
          const themeText = isReceive ? 'text-emerald-700' : 'text-rose-700';
          const themeLightBg = isReceive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100';
          const receiptPerson = persons.find(p => p.id.toString() === previewReceiptData.personId?.toString());
          const receiptTitle = isReceive ? 'پیش‌نمایش رسید دریافت وجه' : 'پیش‌نمایش رسید پرداخت وجه';

          let resourceName = 'نامشخص';
          if(previewReceiptData.resourceType === 'bank'){
            const bank = accounts.find(a => a.id.toString() === previewReceiptData.resourceId?.toString());
            if(bank) resourceName = bank.bankName + ' - ' + bank.accountNumber;
          } else {
            const box = cashboxes.find(c => c.id.toString() === previewReceiptData.resourceId?.toString());
            if(box) resourceName = box.name;
          }

          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                    <Wallet className={\`w-5 h-5 \${themeText}\`} />
                    {receiptTitle}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-extrabold mt-0.5">لطفاً موارد و مبالغ را بررسی کرده و سپس تایید کنید.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewReceiptData(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors border border-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className={\`p-4 rounded-xl border \${themeLightBg} mb-6\`}>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                         <span className="text-gray-500 font-bold block mb-1">طرف حساب:</span>
                         <span className="font-black text-gray-900">{receiptPerson ? receiptPerson.name : 'نامشخص'} {receiptPerson?.personCode ? \`[\${receiptPerson.personCode}]\` : ''}</span>
                      </div>
                      <div>
                         <span className="text-gray-500 font-bold block mb-1">شماره تماس:</span>
                         <span className="font-bold text-gray-700 font-mono">{receiptPerson?.phone || 'ندارد'}</span>
                      </div>
                   </div>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-right text-sm">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-4 bg-gray-50 text-gray-600 font-bold w-1/3">مبلغ تراکنش</td>
                        <td className="p-4 font-black flex items-center gap-2 text-lg">
                           <span className={\`\${themeText} font-mono\`}>{formatCurrency(previewReceiptData.amount)}</span>
                           <span className="text-xs text-gray-500">{storeSettings.currency}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 bg-gray-50 text-gray-600 font-bold">تاریخ</td>
                        <td className="p-4 font-bold text-gray-900 font-mono">{previewReceiptData.jalaliDate}</td>
                      </tr>
                      <tr>
                        <td className="p-4 bg-gray-50 text-gray-600 font-bold">حساب/صندوق</td>
                        <td className="p-4 font-bold text-gray-900">{resourceName}</td>
                      </tr>
                      {previewReceiptData.description && (
                      <tr>
                        <td className="p-4 bg-gray-50 text-gray-600 font-bold">توضیحات بابت</td>
                        <td className="p-4 font-bold text-gray-900">{previewReceiptData.description}</td>
                      </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewReceiptData(null)}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-xs transition-colors"
                >
                  بازگشت و اصلاح
                </button>
                <button
                  type="button"
                  disabled={submittingReceipt}
                  onClick={confirmReceiptSubmit}
                  className={\`px-8 py-2.5 text-white rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-70 \${themeBg}\`}
                >
                  {submittingReceipt ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isReceive ? 'تایید و صدور رسید دریافت' : 'تایید و صدور رسید پرداخت'}
                </button>
              </div>
            </motion.div>
          </div>
        );})}

        {/* Invoice PRE-REGISTER Preview overlay */}
`;

if (regex.test(content)) {
    content = content.replace(regex, modalHTML);
    fs.writeFileSync('src/App.tsx', content);
    console.log('Success injected modal');
} else {
    console.log('Regex fail');
}
