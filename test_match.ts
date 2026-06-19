import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const createSaleMatch = code.match(/case 'create_sale':\s+return \([\s\S]*?;\s+case /);
console.log(createSaleMatch ? "Matched create_sale!" : "create_sale NOT MATCHED!");

const createPurchaseMatch = code.match(/case 'create_purchase':\s+return \([\s\S]*?;\s+case /);
console.log(createPurchaseMatch ? "Matched create_purchase!" : "create_purchase NOT MATCHED!");

const listSaleMatch = code.match(/case 'list_sale':\s+return \([\s\S]*?;\s+case /);
console.log(listSaleMatch ? "Matched list_sale!" : "list_sale NOT MATCHED!");

const listPurchaseMatch = code.match(/case 'list_purchase':\s+return \([\s\S]*?;\s+case /);
console.log(listPurchaseMatch ? "Matched list_purchase!" : "list_purchase NOT MATCHED!");
