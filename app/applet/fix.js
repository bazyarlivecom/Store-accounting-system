const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\!isSalary && \([\s\S]*?نامشخص'\}[\s\S]*?<\/span>[\s\S]*?<\/>[\s\S]*?\)\}/;
const match = code.match(regex);
if (match) {
   const newText = `{!isSalary && (
                      <>
                        {' '}{isReceive ? 'به' : 'توسط'} <span className="font-black text-xl md:text-2xl border-b-[3px] border-dashed border-gray-800 px-8 mx-1 pb-1 inline-block min-w-[200px] text-center">
                           {printingTransaction.resourceType === 'bank' 
                             ? \`حساب \${accounts.find(a => a.id === printingTransaction.resourceId || a.id?.toString() === printingTransaction.resourceId?.toString())?.bankName || 'نامشخص'}\`
                             : printingTransaction.resourceType === 'cashbox' 
                               ? \`صندوق \${cashboxes.find(c => c.id === printingTransaction.resourceId || c.id?.toString() === printingTransaction.resourceId?.toString())?.name || 'نامشخص'}\`
                               : 'نامشخص'}
                        </span>
                      </>
                    )}`;
   code = code.replace(regex, newText);
   fs.writeFileSync('src/App.tsx', code);
   console.log('Fixed syntax correctly');
} else {
   console.log('Not found regex');
}
