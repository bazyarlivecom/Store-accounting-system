import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const createSaleMatch = code.match(/case 'create_sale':\s+return \([\s\S]*?;\s+case /);
if (createSaleMatch) {
  let createSaleReturnBlock = createSaleMatch[0]
      .replace("case 'create_sale':", "case 'create_sale_return':")
      .replace(/case $/, "")
      .replace(/فاکتور فروش کالا/g, "فاکتور برگشت از فروش")
      .replace(/پیش‌فاکتور \(بدون کسر موجودی\)/g, "فاکتور برگشت از فروش")
      .replace(/نوع فاکتور:/g, "")
      .replace(/<option value="sale">فاکتور فروش \(استاندارد\)<\/option>\s*<option value="proforma">صدور پیش‌فاکتور<\/option>/g, "")
      .replace(/<select\s+value=\{invoiceType\}[\s\S]*?<\/select>/g, "")
      .replace(/setInvoiceType\([^)]+\)/g, "setInvoiceType('sale_return')")
      .replace(/شماره فاکتور فروش/g, "شماره فاکتور برگشت از فروش")
      .replace(/ثبت و صدور فاکتور فروش/g, "ثبت برگشت از فروش")
      .replace(/<ShoppingCart className="w-6 h-6"/g, "<CornerDownLeft className=\"w-6 h-6\"");
      
  code = code.replace(
      "case 'create_sale':",
      createSaleReturnBlock + "\n        case 'create_sale':"
  );
}

const createPurchaseMatch = code.match(/case 'create_purchase':\s+return \([\s\S]*?;\s+case /);
if (createPurchaseMatch) {
  let createPurchaseReturnBlock = createPurchaseMatch[0]
      .replace("case 'create_purchase':", "case 'create_purchase_return':")
      .replace(/case $/, "")
      .replace(/فاکتور خرید کالا/g, "فاکتور برگشت از خرید")
      .replace(/خرید طی فاکتور/g, "برگشت از خرید طی فاکتور")
      .replace(/setInvoiceType\([^)]+\)/g, "setInvoiceType('purchase_return')")
      .replace(/شماره فاکتور خرید/g, "شماره فاکتور برگشت از خرید")
      .replace(/ثبت نهایی خرید/g, "ثبت برگشت از خرید")
      .replace(/<ShoppingCart className="w-6 h-6"/g, "<CornerUpRight className=\"w-6 h-6\"")
      ;

  code = code.replace(
      "case 'create_purchase':",
      createPurchaseReturnBlock + "\n        case 'create_purchase':"
  );
}

// Add lists to the shared list block
code = code.replace(
  "case 'list_sale':\n         case 'list_purchase':",
  "case 'list_sale':\n         case 'list_sale_return':\n         case 'list_purchase':\n         case 'list_purchase_return':"
);

// We need to fix the title/query inside the list block
code = code.replace(
  "let listTitle = activeTab === 'list_sale' ? 'فاکتورهای ثبت شده فروش' :",
  "let listTitle = activeTab === 'list_sale' ? 'فاکتورهای ثبت شده فروش' :\n                         activeTab === 'list_sale_return' ? 'فاکتورهای برگشت از فروش' :\n                         activeTab === 'list_purchase_return' ? 'فاکتورهای برگشت از خرید' :"
);

code = code.replace(
  "const searchPlaceholder = activeTab === 'list_sale' ? 'جستجو در فاکتورهای فروش...'",
  "const searchPlaceholder = activeTab === 'list_sale' ? 'جستجو در فاکتورهای فروش...'\n                                   : activeTab === 'list_sale_return' ? 'جستجو در فاکتورهای برگشت فروش...'\n                                   : activeTab === 'list_purchase_return' ? 'جستجو در فاکتورهای برگشت خرید...'"
);

code = code.replace(
  "const displayedInvoices = activeTab === 'list_sale' ? invoices.filter(i => i.type === 'sale' || i.type === 'proforma') :",
  "const displayedInvoices = activeTab === 'list_sale' ? invoices.filter(i => i.type === 'sale' || i.type === 'proforma') :\n                           activeTab === 'list_sale_return' ? invoices.filter(i => i.type === 'sale_return') :\n                           activeTab === 'list_purchase_return' ? invoices.filter(i => i.type === 'purchase_return') :"
);


fs.writeFileSync('src/App.tsx', code);
console.log("Applied updates!");
