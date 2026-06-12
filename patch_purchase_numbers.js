import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// We locate the preview blocks and update their classes
function patchBlock(startPattern, endPattern) {
    const startIndex = content.indexOf(startPattern);
    if (startIndex === -1) return;
    const endIndex = content.indexOf(endPattern, startIndex);
    if (endIndex === -1) return;
    
    let block = content.substring(startIndex, endIndex);
    
    block = block.replace(/font-mono/g, 'font-sans');
    block = block.replace(/dir="ltr"/g, 'dir="rtl"');
    
    content = content.substring(0, startIndex) + block + content.substring(endIndex);
}

// purely target purchase invoice viewing and previewing borders
patchBlock("viewingInvoice.type === 'purchase' ? (", "viewingInvoice.type === 'sale' ? (");
patchBlock("previewInvoiceData.type === 'purchase' ? (", "(!activeTab.includes('purchase') && previewInvoiceData.type === 'sale' ? (");

// wait a minute! previewInvoiceData condition at the bottom:
patchBlock("previewInvoiceData.type === 'purchase' ? (", "{/* Signatures */}");

fs.writeFileSync('src/App.tsx', content);
console.log('patched purchase invoice details');
