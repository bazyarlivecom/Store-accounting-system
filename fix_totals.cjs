const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<span className="font-sans">\{formatCurrency\(viewingInvoice\.items\?\.reduce/g, '<span className="font-mono text-left" dir="ltr">{formatCurrency(viewingInvoice.items?.reduce');
code = code.replace(/<span className="font-sans">\{formatCurrency\(\(viewingInvoice\.items\?\.reduce/g, '<span className="font-mono text-left" dir="ltr">{formatCurrency((viewingInvoice.items?.reduce');
code = code.replace(/<span className="font-sans">\{formatCurrency\(viewingInvoice\.totalAmount\)/g, '<span className="font-mono text-left" dir="ltr">{formatCurrency(viewingInvoice.totalAmount)');

code = code.replace(/<span className="text-gray-900 font-sans font-bold">\{formatCurrency\(\n\s*viewingInvoice\.items\?\.reduce/g, '<span className="text-gray-900 font-mono text-left font-bold" dir="ltr">{formatCurrency(\n                                viewingInvoice.items?.reduce');
code = code.replace(/<span className="font-sans font-bold">\{formatCurrency\(\n\s*\(viewingInvoice\.items\?\.reduce/g, '<span className="font-mono text-left font-bold" dir="ltr">{formatCurrency(\n                                  (viewingInvoice.items?.reduce');
code = code.replace(/<span className="text-indigo-700 font-sans font-black text-2xl px-2">\{formatCurrency\(viewingInvoice\.totalAmount\)/g, '<span className="text-indigo-700 font-mono text-left font-black text-2xl px-2" dir="ltr">{formatCurrency(viewingInvoice.totalAmount)');

code = code.replace(/<span className="font-sans">\{formatCurrency\(previewInvoiceData\.items\?\.reduce/g, '<span className="font-mono text-left" dir="ltr">{formatCurrency(previewInvoiceData.items?.reduce');
code = code.replace(/<span className="font-sans">\{formatCurrency\(\(previewInvoiceData\.items\?\.reduce/g, '<span className="font-mono text-left" dir="ltr">{formatCurrency((previewInvoiceData.items?.reduce');
code = code.replace(/<span className="font-sans">\{formatCurrency\(previewInvoiceData\.totalAmount\)/g, '<span className="font-mono text-left" dir="ltr">{formatCurrency(previewInvoiceData.totalAmount)');

code = code.replace(/<span className="text-gray-900 font-sans font-bold">\{formatCurrency\(\n\s*previewInvoiceData\.items\?\.reduce/g, '<span className="text-gray-900 font-mono text-left font-bold" dir="ltr">{formatCurrency(\n                                previewInvoiceData.items?.reduce');
code = code.replace(/<span className="font-sans font-bold">\{formatCurrency\(\n\s*\(previewInvoiceData\.items\?\.reduce/g, '<span className="font-mono text-left font-bold" dir="ltr">{formatCurrency(\n                                  (previewInvoiceData.items?.reduce');
code = code.replace(/<span className="text-amber-700 font-sans font-black text-2xl px-2">\{formatCurrency\(previewInvoiceData\.totalAmount\)/g, '<span className="text-amber-700 font-mono text-left font-black text-2xl px-2" dir="ltr">{formatCurrency(previewInvoiceData.totalAmount)');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
