import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "{ id: 'create_purchase', label: 'ثبت فاکتور خرید', roles: ['admin', 'accountant'] },",
  "{ id: 'create_purchase', label: 'ثبت فاکتور خرید', roles: ['admin', 'accountant'] },\n        { id: 'create_sale_return', label: 'برگشت از فروش', roles: ['admin', 'cashier', 'accountant'] },\n        { id: 'create_purchase_return', label: 'برگشت از خرید', roles: ['admin', 'accountant'] },"
);

code = code.replace(
  "{ id: 'list_purchase', label: 'لیست فاکتورهای خرید', roles: ['admin', 'accountant'] },",
  "{ id: 'list_purchase', label: 'لیست فاکتورهای خرید', roles: ['admin', 'accountant'] },\n        { id: 'list_sale_return', label: 'لیست برگشتی‌های فروش', roles: ['admin', 'cashier', 'accountant'] },\n        { id: 'list_purchase_return', label: 'لیست برگشتی‌های خرید', roles: ['admin', 'accountant'] },"
);

code = code.replace(
  /useState\<'create_sale' \| ([^>]+)\>\('financial_report'\);/,
  "useState<'create_sale' | $1 | 'create_sale_return' | 'create_purchase_return' | 'list_sale_return' | 'list_purchase_return'>('financial_report');"
);

code = code.replace(
  "useState<'sale' | 'purchase' | 'warehouse_receipt' | 'warehouse_remittance' | 'proforma'>('sale')",
  "useState<'sale' | 'purchase' | 'warehouse_receipt' | 'warehouse_remittance' | 'proforma' | 'sale_return' | 'purchase_return'>('sale')"
);

code = code.replace(
  "['create_sale', 'create_purchase', 'create_warehouse_doc'].includes(activeTab)",
  "(['create_sale', 'create_purchase', 'create_warehouse_doc', 'create_sale_return', 'create_purchase_return'].includes(activeTab))"
);

code = code.replace(
  "const currencyLabel = (activeTab === 'create_sale' || activeTab === 'create_purchase' || activeTab === 'create_warehouse_doc') ? invoiceCurrency : storeSettings.currency;",
  "const currencyLabel = (activeTab === 'create_sale' || activeTab === 'create_purchase' || activeTab === 'create_warehouse_doc' || activeTab === 'create_sale_return' || activeTab === 'create_purchase_return') ? invoiceCurrency : storeSettings.currency;"
);

// We need to duplicate the whole block for case 'create_sale': and make it case 'create_sale_return':
const createSaleMatch = code.match(/case 'create_sale':\s+return \([\s\S]*?;\s+case 'create_warehouse_doc':/);
if (createSaleMatch) {
  let createSaleReturnBlock = createSaleMatch[0]
                                .replace("case 'create_sale':", "case 'create_sale_return':")
                                .replace(/case 'create_warehouse_doc':$/, "")
                                .replace(/فاکتور فروش کالا/g, "فاکتور برگشت از فروش")
                                .replace(/پیش‌فاکتور \(بدون کسر موجودی\)/g, "فاکتور برگشت از فروش")
                                .replace(/نوع فاکتور:/g, "")
                                .replace(/<option value="sale">فاکتور فروش \(استاندارد\)<\/option>\s*<option value="proforma">صدور پیش‌فاکتور<\/option>/g, "")
                                .replace(/<select\s+value=\{invoiceType\}[\s\S]*?<\/select>/g, "")
                                .replace(/setInvoiceType\([^)]+\)/g, "setInvoiceType('sale_return')")
                                .replace(/شماره فاکتور فروش/g, "شماره فاکتور برگشت از فروش")
                                .replace(/ثبت و صدور فاکتور فروش/g, "ثبت برگشت از فروش")
                                .replace(/ShoppingCart/g, "RotateCcw") // Or Undo
                                ;
  // duplicate list_sale as well
  const listSaleMatch = code.match(/case 'list_sale':\s+return \([\s\S]*?;\s+case 'list_purchase':/);
  if (listSaleMatch) {
    let listSaleReturnBlock = listSaleMatch[0]
                                .replace("case 'list_sale':", "case 'list_sale_return':")
                                .replace(/case 'list_purchase':$/, "")
                                .replace(/فاکتورهای ثبت شده فروش/g, "فاکتورهای برگشت از فروش")
                                .replace(/جستجو در فاکتورهای فروش.../g, "جستجو در فاکتورهای برگشت...")
                                .replace(/i\.type === 'sale' \|\| i\.type === 'proforma'/g, "i.type === 'sale_return'") // be careful
                                ;
                                
    // also create_purchase_return and list_purchase_return
    const createPurchaseMatch = code.match(/case 'create_purchase':\s+return \([\s\S]*?;\s+case 'create_sale':/);
    if (createPurchaseMatch) {
        let createPurchaseReturnBlock = createPurchaseMatch[0]
                                        .replace("case 'create_purchase':", "case 'create_purchase_return':")
                                        .replace(/case 'create_sale':$/, "")
                                        .replace(/فاکتور خرید کالا/g, "فاکتور برگشت از خرید")
                                        .replace(/خرید طی فاکتور/g, "برگشت از خرید طی فاکتور")
                                        .replace(/setInvoiceType\([^)]+\)/g, "setInvoiceType('purchase_return')")
                                        .replace(/شماره فاکتور خرید/g, "شماره فاکتور برگشت از خرید")
                                        .replace(/ثبت نهایی خرید/g, "ثبت برگشت از خرید")
                                        ;

        const listPurchaseMatch = code.match(/case 'list_purchase':\s+return \([\s\S]*?;\s+case 'list_warehouse_docs':/);
        if (listPurchaseMatch) {
            let listPurchaseReturnBlock = listPurchaseMatch[0]
                                        .replace("case 'list_purchase':", "case 'list_purchase_return':")
                                        .replace(/case 'list_warehouse_docs':$/, "")
                                        .replace(/فاکتورهای ثبت شده خرید/g, "فاکتورهای برگشت از خرید")
                                        .replace(/جستجو در فاکتورهای خرید.../g, "جستجو در برگشت از خرید...")
                                        .replace(/i\.type === 'purchase'/g, "i.type === 'purchase_return'")
                                        ;
            
            // Now insert these blocks
            code = code.replace(
                "case 'create_warehouse_doc':",
                createSaleReturnBlock + "\n" + createPurchaseReturnBlock + "\n" + "case 'create_warehouse_doc':"
            );
            
            code = code.replace(
                "case 'list_warehouse_docs':",
                listSaleReturnBlock + "\n" + listPurchaseReturnBlock + "\n" + "case 'list_warehouse_docs':"
            );

        }
    }
  }
}


fs.writeFileSync('src/App.tsx', code);
console.log("Applied!");
