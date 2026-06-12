import fs from 'fs';
let code = fs.readFileSync('src/lib/dataService.ts', 'utf8');

// Patch addInvoice
const addInvoiceStr = `
  // Update product stock based on invoice type
  if (invoice.items && Array.isArray(invoice.items)) {
    const products = await getLocalData<any[]>('products', []);
    let productsUpdated = false;

    for (const item of invoice.items) {
      const prodIndex = products.findIndex((p: any) => p.id === item.productId || p.id === Number(item.productId) || p.id === String(item.productId));
      if (prodIndex !== -1) {
        const qty = Number(item.quantity) || 0;
        if (invoice.type === 'sale' || invoice.type === 'warehouse_remittance') {
          products[prodIndex].stock = (Number(products[prodIndex].stock) || 0) - qty;
          productsUpdated = true;
        } else if (invoice.type === 'purchase' || invoice.type === 'warehouse_receipt') {
          products[prodIndex].stock = (Number(products[prodIndex].stock) || 0) + qty;
          productsUpdated = true;
        }
      }
    }

    if (productsUpdated) {
      await saveLocalData('products', products);
    }
  }
`;
code = code.replace(addInvoiceStr, '\n  // Stock is computed dynamically\n');

// Patch deleteInvoice
const deleteInvoiceStr = `
  if (invoiceToDelete && invoiceToDelete.items && Array.isArray(invoiceToDelete.items)) {
    const products = await getLocalData<any[]>('products', []);
    let productsUpdated = false;

    for (const item of invoiceToDelete.items) {
      const prodIndex = products.findIndex((p: any) => p.id === item.productId || p.id === Number(item.productId) || p.id === String(item.productId));
      if (prodIndex !== -1) {
        const qty = Number(item.quantity) || 0;
        // Revert the stock
        if (invoiceToDelete.type === 'sale' || invoiceToDelete.type === 'warehouse_remittance') {
          products[prodIndex].stock = (Number(products[prodIndex].stock) || 0) + qty;
          productsUpdated = true;
        } else if (invoiceToDelete.type === 'purchase' || invoiceToDelete.type === 'warehouse_receipt') {
          products[prodIndex].stock = (Number(products[prodIndex].stock) || 0) - qty;
          productsUpdated = true;
        }
      }
    }

    if (productsUpdated) {
      await saveLocalData('products', products);
    }
  }
`;
code = code.replace(deleteInvoiceStr, '\n  // Stock is computed dynamically\n');

fs.writeFileSync('src/lib/dataService.ts', code);
console.log('patched dataService.ts');
