const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSign1 = `                        {/* Standard Signature Block */}`;
const sign1Rep = `                        )}
                        {/* Standard Signature Block */}`;
code = code.replace(targetSign1, sign1Rep);
code = code.replace(targetSign1, sign1Rep);

// And "بازگشت و ویرایش سند" messed up because of my previous replace:
// '{activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : '{activeTab.includes('warehouse') ? 'بازگشت و اصلاح' : 'بازگشت و ویرایش فاکتور'}'}'
const badButtonText = `'{activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : '{activeTab.includes('warehouse') ? 'بازگشت و اصلاح' : 'بازگشت و ویرایش فاکتور'}'}'`;
const goodButtonText = `activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : 'بازگشت و ویرایش فاکتور'`;
code = code.replace(badButtonText, goodButtonText);
code = code.replace(`{activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : '{activeTab.includes('warehouse') ? 'بازگشت و اصلاح' : 'بازگشت و ویرایش فاکتور'}'}`, goodButtonText);
code = code.replace(`{activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : '{activeTab.includes('warehouse') ? 'بازگشت و اصلاح' : 'بازگشت و ویرایش فاکتور'}'}`, goodButtonText);

const finalizeButtonText = `'{activeTab.includes('warehouse') ? 'ثبت قطعی در سیستم' : '{activeTab.includes('warehouse') ? 'ثبت قطعی سند در سیستم' : 'ثبت قطعی فاکتور در سیستم'}'}'`;
const goodFinalize = `activeTab.includes('warehouse') ? 'ثبت قطعی در سیستم' : 'ثبت قطعی فاکتور در سیستم'`;
code = code.replace(finalizeButtonText, goodFinalize);
code = code.replace(`{activeTab.includes('warehouse') ? 'ثبت قطعی در سیستم' : '{activeTab.includes('warehouse') ? 'ثبت قطعی سند در سیستم' : 'ثبت قطعی فاکتور در سیستم'}'}`, goodFinalize);

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing bracket');
