const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /'create_warehouse_receipt' \| 'list_warehouse_receipt' \| 'create_warehouse_remittance' \| 'list_warehouse_remittance'/g,
  "'create_warehouse_doc' | 'list_warehouse_docs'"
);

code = code.replace(
  /\} else if \(activeTab === 'create_warehouse_receipt'\) \{[\s\S]*?\} else if \(activeTab === 'create_warehouse_remittance'\) \{[\s\S]*?\}/,
  `} else if (activeTab === 'create_warehouse_doc') {
      setInvoiceType('warehouse_receipt');
      setInvoiceTitle('صدور رسید پایانه انبار');
      setWarehouseWizardStep(1);
      setWarehouseOperationType('receipt_purchase');
    }`
);

code = code.replace(
  /\['create_sale', 'create_purchase', 'create_warehouse_receipt', 'create_warehouse_remittance'\]/g,
  "['create_sale', 'create_purchase', 'create_warehouse_doc']"
);

fs.writeFileSync('src/App.tsx', code);
