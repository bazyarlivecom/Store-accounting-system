const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetChange = `            const qty = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
            const price = field === 'unitPrice' ? Number(value) : Number(updatedItem.unitPrice);`;

const repChange = `            let qty = field === 'quantity' ? Number(value) : Number(updatedItem.quantity);
            if (activeTab === 'create_warehouse_receipt' && typeof updatedItem.maxQuantity !== 'undefined') {
              if (qty > updatedItem.maxQuantity) qty = updatedItem.maxQuantity;
            }
            updatedItem.quantity = qty;
            const price = field === 'unitPrice' ? Number(value) : Number(updatedItem.unitPrice);`;

code = code.replace(targetChange, repChange);

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing quantity check');
