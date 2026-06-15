const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The boolean isWarehouseTab
code = code.replace(
  /const isWarehouseTab = activeTab === 'create_warehouse_receipt' \|\| activeTab === 'create_warehouse_remittance';/g,
  "const isWarehouseTab = activeTab === 'create_warehouse_doc';"
);

// General 'create_warehouse_receipt' || 'create_warehouse_remittance' pattern
code = code.replace(
  /activeTab === 'create_warehouse_receipt' \|\| activeTab === 'create_warehouse_remittance'/g,
  "activeTab === 'create_warehouse_doc'"
);

// create_purchase || create_warehouse_receipt
code = code.replace(
  /activeTab === 'create_purchase' \|\| activeTab === 'create_warehouse_receipt'/g,
  "activeTab === 'create_purchase' || (activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_receipt')"
);

code = code.replace(
  /activeTab === 'create_warehouse_remittance' \? i\.type === 'warehouse_remittance' : i\.type === 'warehouse_receipt'/g,
  "invoiceType === 'warehouse_remittance' ? i.type === 'warehouse_remittance' : i.type === 'warehouse_receipt'"
);

// For the label: currencyLabel
code = code.replace(
  /const currencyLabel = \(activeTab === 'create_sale' \|\| activeTab === 'create_purchase' \|\| activeTab === 'create_warehouse_doc'\) \? invoiceCurrency : storeSettings\.currency;/g,
  "const currencyLabel = (activeTab === 'create_sale' || activeTab === 'create_purchase' || activeTab === 'create_warehouse_doc') ? invoiceCurrency : storeSettings.currency;"
);

// invoice number auto-generate prefix
code = code.replace(
  /if \(activeTab === 'create_warehouse_receipt' \|\| invoiceType === 'warehouse_receipt'\) typeKey = 'warehouse_receipt';/g,
  "if ((activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_receipt') || invoiceType === 'warehouse_receipt') typeKey = 'warehouse_receipt';"
);
code = code.replace(
  /else if \(activeTab === 'create_warehouse_remittance' \|\| invoiceType === 'warehouse_remittance'\) typeKey = 'warehouse_remittance';/g,
  "else if ((activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_remittance') || invoiceType === 'warehouse_remittance') typeKey = 'warehouse_remittance';"
);

// isRemittance helper for item selection
code = code.replace(
  /const isRemittance = activeTab === 'create_warehouse_remittance' \|\| activeTab === 'list_warehouse_remittance';/g,
  "const isRemittance = (activeTab === 'create_warehouse_doc' && invoiceType === 'warehouse_remittance') || activeTab === 'list_warehouse_docs';"
);

// customer label in preview
code = code.replace(
  /\{activeTab === 'create_warehouse_receipt' \? 'تحویل‌دهنده کالا' :\n\s*activeTab === 'create_warehouse_remittance' \? 'تحویل‌گیرنده کالا \(بدهکار\)' :\n\s*'مخاطب \(خریدار\)'\}/g,
  "{activeTab === 'create_warehouse_doc' ? (invoiceType === 'warehouse_receipt' ? 'تحویل‌دهنده کالا' : 'تحویل‌گیرنده کالا (بدهکار)') : 'مخاطب (خریدار)'}"
);

// activeTab.includes('warehouse') logic:
// There is activeTab.includes('warehouse') which handles create_warehouse_doc nicely

fs.writeFileSync('src/App.tsx', code);
