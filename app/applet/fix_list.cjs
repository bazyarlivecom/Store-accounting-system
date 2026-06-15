const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /activeTab === 'list_warehouse_receipt' \? i\.type === 'warehouse_receipt' :\n\s*i\.type === 'warehouse_remittance'/g,
  `activeTab === 'list_warehouse_docs' ? (
       typeof listFilter !== 'undefined' && listFilter === 'receipt' ? i.type === 'warehouse_receipt' :
       typeof listFilter !== 'undefined' && listFilter === 'remittance' ? i.type === 'warehouse_remittance' :
       (i.type === 'warehouse_receipt' || i.type === 'warehouse_remittance')
   ) : false`
);

fs.writeFileSync('src/App.tsx', code);
