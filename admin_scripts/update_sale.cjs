const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove case 'create_sale': from line 2049
code = code.replace("        case 'create_sale':\n        case 'create_warehouse_receipt':", "        case 'create_warehouse_receipt':");

// 2. We need to add case 'create_sale': right before case 'list_sale':
// To do this, I will copy the block of case 'create_purchase'
const purchaseRegex = /(case 'create_purchase':\s+return \([\s\S]*?;\s+case 'list_sale':)/;
const match = purchaseRegex.exec(code);

if (match) {
    let purchaseBlock = match[1];
    let saleBlock = purchaseBlock.replace("case 'create_purchase':", "case 'create_sale':");
    saleBlock = saleBlock.replace("case 'list_sale':", ""); // remove the suffix that we matched
    
    // Replace emerald with indigo
    saleBlock = saleBlock.replace(/emerald/g, "indigo");
    // Change wording
    saleBlock = saleBlock.replace(/لیست اقلام خریداری شده/g, "لیست اقلام آماده فروش");
    saleBlock = saleBlock.replace(/جستجوی کالای خریداری شده/g, "جستجوی کالای مورد نظر برای فروش");
    saleBlock = saleBlock.replace(/شماره فاکتور خرید/g, "شماره فاکتور فروش");
    saleBlock = saleBlock.replace(/ثبت نهایی خرید/g, "ثبت و صدور فاکتور فروش");
    saleBlock = saleBlock.replace(/مبلغ نهایی خرید/g, "مبلغ نهایی فاکتور");
    saleBlock = saleBlock.replace(/شماره فاکتور سیستم تامین/g, "شماره دلخواه...");
    
    // Also we need to change "تامین کننده" to "مشتری" for the customer selection if it exists inside this block.
    saleBlock = saleBlock.replace(/تامین کننده/g, "مشتری");
    
    // allowNegativeStock filter
    saleBlock = saleBlock.replace(/options=\{products\.map\(/g, `options={products.filter(p => storeSettings.allowNegativeStock || p.type === 'service' || calculateProductCurrentStock(p.id) > 0).map(`);
    
    // Update subLabel stock
    saleBlock = saleBlock.replace(/p\.stock/g, "calculateProductCurrentStock(p.id)");
    
    // We should also replace the ShoppingCart icon in the title if we want, or keep Plus. The Plus icon is now indigo.
    saleBlock = saleBlock.replace(/<Plus className="w-6 h-6" \/>/g, `<ShoppingCart className="w-6 h-6" />`);
    
    const finalReplacement = saleBlock + "\n        case 'list_sale':";
    
    // Inject into the main code
    code = code.replace(match[0], match[0].replace("case 'list_sale':", finalReplacement));
    
    // Need to inject calculateProductCurrentStock
    if (!code.includes('calculateProductCurrentStock')) {
        const stockFunc = `  const calculateProductCurrentStock = (productId: string | number) => {
    let total = 0;
    invoices.forEach(inv => {
      if (!inv.items) return;
      inv.items.forEach((i: any) => {
        if (i.productId?.toString() === productId.toString()) {
           const q = Number(i.quantity) || 0;
           if (inv.type === 'purchase' || inv.type === 'warehouse_receipt') total += q;
           else if (inv.type === 'sale' || inv.type === 'warehouse_remittance') total -= q;
        }
      });
    });
    return total;
  };

  `;
        code = code.replace('const calculateFinalTotal = () => {', stockFunc + 'const calculateFinalTotal = () => {');
    }
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success");
} else {
    console.log("Purchase block not found.");
}
