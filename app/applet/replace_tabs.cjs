const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace activeTab references
code = code.replace(/create_warehouse_receipt/g, 'create_warehouse_doc')
           .replace(/create_warehouse_remittance/g, 'create_warehouse_doc')
           .replace(/list_warehouse_receipt/g, 'list_warehouse_docs')
           .replace(/list_warehouse_remittance/g, 'list_warehouse_docs');

// The replacement above might duplicate occurrences in array literals, like:
// 'create_warehouse_doc' | 'list_warehouse_docs' | 'create_warehouse_doc' | 'list_warehouse_docs'
// Let's deduplicate that if needed safely.
code = code.replace(/'create_warehouse_doc' \| 'list_warehouse_docs' \| 'create_warehouse_doc' \| 'list_warehouse_docs'/g, "'create_warehouse_doc' | 'list_warehouse_docs'");
code = code.replace(/\['create_sale', 'create_purchase', 'create_warehouse_doc', 'create_warehouse_doc'\]/g, "['create_sale', 'create_purchase', 'create_warehouse_doc']");
code = code.replace(/case 'create_warehouse_doc':\s*case 'create_warehouse_doc':/g, "case 'create_warehouse_doc':");

fs.writeFileSync('src/App.tsx', code);
