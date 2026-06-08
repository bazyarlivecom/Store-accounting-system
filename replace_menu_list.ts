import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacementStr = `              {
                title: 'عملیات بازرگانی',
                items: [
                  { id: 'create_sale', label: 'ثبت فاکتور فروش', icon: <Plus className="w-4 h-4" /> },
                  { id: 'create_purchase', label: 'ثبت فاکتور خرید', icon: <ShoppingCart className="w-4 h-4" /> },
                  { id: 'list_sale', label: 'لیست فاکتورهای فروش', icon: <FileText className="w-4 h-4" /> },
                  { id: 'list_purchase', label: 'لیست فاکتورهای خرید', icon: <FileText className="w-4 h-4" /> },
                ]
              },
              {
                title: 'خزانه‌داری',
                items: [
                  { id: 'create_receive_receipt', label: 'دریافت وجه (نقد/بانک)', icon: <ArrowDownToLine className="w-4 h-4" /> },
                  { id: 'list_receive_receipt', label: 'لیست رسیدهای دریافت', icon: <FileSpreadsheet className="w-4 h-4" /> },
                  { id: 'create_pay_receipt', label: 'پرداخت وجه (نقد/بانک)', icon: <ArrowUpFromLine className="w-4 h-4" /> },
                  { id: 'list_pay_receipt', label: 'لیست رسیدهای پرداخت', icon: <FileSpreadsheet className="w-4 h-4" /> },
                ]
              },`;

const oldStr = `              {
                title: 'عملیات بازرگانی',
                items: [
                  { id: 'create_sale', label: 'ثبت فاکتور فروش', icon: <Plus className="w-4 h-4" /> },
                  { id: 'create_purchase', label: 'ثبت فاکتور خرید', icon: <ShoppingCart className="w-4 h-4" /> },
                  { id: 'list_invoices', label: 'لیست فاکتورها', icon: <FileText className="w-4 h-4" /> },
                ]
              },
              {
                title: 'خزانه‌داری',
                items: [
                  { id: 'create_receipt', label: 'دریافت وجه', icon: <ArrowDownToLine className="w-4 h-4" /> },
                  { id: 'create_pay_receipt', label: 'پرداخت وجه', icon: <ArrowUpFromLine className="w-4 h-4" /> },
                  { id: 'list_pay_receipt', label: 'اسناد نقد و بانک', icon: <FileSpreadsheet className="w-4 h-4" /> },
                ]
              },`;

content = content.replace(oldStr, replacementStr);
fs.writeFileSync('src/App.tsx', content);
