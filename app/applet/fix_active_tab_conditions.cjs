const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Line 245-255:
//     } else if (activeTab === 'create_warehouse_receipt') {
//       setInvoiceType('warehouse_receipt');
//       ...
//     } else if (activeTab === 'create_warehouse_remittance') {
//       ...
//     }
code = code.replace(/\} else if \(activeTab === 'create_warehouse_receipt'\) \{[\s\S]*?\} else if \(activeTab === 'create_warehouse_remittance'\) \{[\s\S]*?\}/, 
    `} else if (activeTab === 'create_warehouse_doc') {
      setInvoiceType('warehouse_receipt');
      setInvoiceTitle('اسناد انبار (ورود/خروج)');
      setWarehouseWizardStep(1);
      setWarehouseOperationType('purchase_invoice');
    }`);

// Line 465: if (['create_sale', 'create_purchase', 'create_warehouse_receipt', 'create_warehouse_remittance'].includes(activeTab)) {
code = code.replace(
    /if \(\['create_sale', 'create_purchase', 'create_warehouse_receipt', 'create_warehouse_remittance'\]\.includes\(activeTab\)\) \{/g,
    `if (['create_sale', 'create_purchase', 'create_warehouse_doc'].includes(activeTab)) {`
);

// Line 1730-1732:
//       if (activeTab === 'create_warehouse_receipt') {
//         drafts[invoiceId] = { ... };
//       } else if (activeTab === 'create_warehouse_remittance') {
//         drafts[invoiceId] = { ... };
code = code.replace(
    /if \(activeTab === 'create_warehouse_receipt'\) \{[\s\S]*?\} else if \(activeTab === 'create_warehouse_remittance'\) \{[\s\S]*?\}/,
    `if (activeTab === 'create_warehouse_doc') {
      const dbDraftsStr = localStorage.getItem('drafts');
      let drafts = dbDraftsStr ? JSON.parse(dbDraftsStr) : {};
      delete drafts[invoiceId];
      localStorage.setItem('drafts', JSON.stringify(drafts));
    }`
);

// Line 1742-1743:
// const isRemittance = activeTab === 'create_warehouse_remittance';
code = code.replace(
    /const isRemittance = activeTab === 'create_warehouse_remittance';/g,
    `const isRemittance = activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_remittance';`
);

// Line 2079:
//      inv.type === 'warehouse_receipt' ? 'create_warehouse_receipt' : 
//      'create_warehouse_remittance'
code = code.replace(
    /inv.type === 'warehouse_receipt' \? 'create_warehouse_receipt' : \s*'create_warehouse_remittance'/g,
    `'create_warehouse_doc'`
);

// Line 2309:
//        } else if (activeTab === 'create_warehouse_receipt') {
//          setInvoiceType('warehouse_receipt');
//          setInvoiceTitle('رسید انبار (ورود کالا)');
//        } else if (activeTab === 'create_warehouse_remittance') {
//          setInvoiceType('warehouse_remittance');
//          setInvoiceTitle('حواله انبار (خروج کالا)');
code = code.replace(
    /\} else if \(activeTab === 'create_warehouse_receipt'\) \{[\s\S]*?\} else if \(activeTab === 'create_warehouse_remittance'\) \{[\s\S]*?\}/,
    `} else if (activeTab === 'create_warehouse_doc') {
        if (draft.type === 'warehouse_receipt') {
            setInvoiceType('warehouse_receipt');
            setInvoiceTitle('رسید انبار (ورود کالا)');
            setWarehouseOperationType('purchase_invoice');
        } else {
            setInvoiceType('warehouse_remittance');
            setInvoiceTitle('حواله انبار (خروج کالا)');
            setWarehouseOperationType('sales_invoice');
        }
        setWarehouseWizardStep(1);
    }`
);

fs.writeFileSync('src/App.tsx', code);
