const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const validationStr = `    if (!customerId || items.length === 0 || items.some(i => !i.productId && !i.productName)) {
      customAlert('لطفاً همه فیلدهای ضروری را پر کنید.');
      return;
    }`;

const repValidationStr = `    if (!customerId || items.length === 0 || items.some(i => !i.productId && !i.productName)) {
      customAlert('لطفاً همه فیلدهای ضروری را پر کنید.');
      return;
    }
    if ((activeTab === 'create_warehouse_receipt' || activeTab === 'create_warehouse_remittance') && items.some(i => !i.warehouseId)) {
      customAlert('لطفاً برای تمامی اقلام انبار را انتخاب کنید.');
      return;
    }`;

code = code.replace(validationStr, repValidationStr);

// Let's also check saveInvoiceData validation if any
const valStr2 = `    const finalInvoiceNumber = invoiceMode === 'auto' ? \`INV-\${Math.floor(Math.random() * 1000000)}\` : invoiceNumber;

    const cleanItems = items.filter(
      item => item.productName || item.productId || (item.quantity > 0 && item.unitPrice > 0)
    );`;

const repValStr2 = `    const finalInvoiceNumber = invoiceMode === 'auto' ? \`INV-\${Math.floor(Math.random() * 1000000)}\` : invoiceNumber;

    if ((activeTab === 'create_warehouse_receipt' || activeTab === 'create_warehouse_remittance') && items.some(i => !i.warehouseId)) {
      customAlert('لطفاً برای تمامی اقلام انبار را 선택 کنید.');
      setSubmitting(false);
      return;
    }

    const cleanItems = items.filter(
      item => item.productName || item.productId || (item.quantity > 0 && item.unitPrice > 0)
    );`;

code = code.replace(valStr2, repValStr2);

// Check handleSubmitReceipt validation if any
fs.writeFileSync('src/App.tsx', code);
console.log('done fixing validations');
