const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tPrefix = `  const saveInvoiceData = async (customPayload?: any) => {`;
const repPrefix = `  const getInvoicePrefix = () => {
    if (activeTab === 'create_warehouse_receipt') return 'REC-';
    if (activeTab === 'create_warehouse_remittance') return 'REM-';
    if (activeTab === 'create_purchase') return 'PUR-';
    if (activeTab === 'create_sale') return 'INV-';
    // Fallback based on type if activeTab is list
    if (invoiceType === 'warehouse_receipt') return 'REC-';
    if (invoiceType === 'warehouse_remittance') return 'REM-';
    if (invoiceType === 'purchase') return 'PUR-';
    return 'INV-';
  };

  const saveInvoiceData = async (customPayload?: any) => {`;

code = code.replace(tPrefix, repPrefix);

const targetNum1 = `    const finalInvoiceNumber = invoiceMode === 'auto' ? \`INV-\${Math.floor(Math.random() * 1000000)}\` : invoiceNumber;`;
const repNum1 = `    const finalInvoiceNumber = invoiceMode === 'auto' ? \`\${getInvoicePrefix()}\${Math.floor(Math.random() * 1000000)}\` : invoiceNumber;`;
code = code.replace(targetNum1, repNum1);

const targetNum2 = `      invoiceNumber: customPayload.invoiceNumber.includes('پیش‌نویس') || customPayload.invoiceNumber.includes('خودکار') ? \`INV-\${Math.floor(Math.random() * 1000000)}\` : customPayload.invoiceNumber`;
const repNum2 = `      invoiceNumber: customPayload.invoiceNumber.includes('پیش‌نویس') || customPayload.invoiceNumber.includes('خودکار') ? \`\${getInvoicePrefix()}\${Math.floor(Math.random() * 1000000)}\` : customPayload.invoiceNumber`;
code = code.replace(targetNum2, repNum2);

const targetTemp1 = `      jalaliDate: new Date(date).toLocaleDateString('fa-IR'),
      customerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'نامشخص',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '',
      customerAddress: selectedCustomer ? selectedCustomer.address : '',
      items: items.map(item => {`;
const repTemp1 = `      jalaliDate: new Date(date).toLocaleDateString('fa-IR'),
      customerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'نامشخص',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '',
      customerAddress: selectedCustomer ? selectedCustomer.address : '',
      sourceInvoiceId, // Pass it correctly
      items: items.map(item => {`;

code = code.replace(targetTemp1, repTemp1);

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing saves');
