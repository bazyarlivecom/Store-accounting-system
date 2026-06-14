const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetLabelSubmit = `ثبت و بررسی فاکتور`;
const replacementLabelSubmit = `{activeTab.includes('warehouse') ? 'ثبت و بررسی سند' : 'ثبت و بررسی فاکتور'}`;
code = code.replace(targetLabelSubmit, replacementLabelSubmit);

const targetHeader1 = `<h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                  <span className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                     <Plus className="w-6 h-6" />
                  </span>
                  {invoiceTitle}
                </h2>`;
code = code.replace(targetHeader1, `<h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                  <span className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                     <Plus className="w-6 h-6" />
                  </span>
                  {invoiceTitle}
                </h2>`);

const submitInvLabel = `بازگشت و ویرایش فاکتور`;
const submitInvRep = `{activeTab.includes('warehouse') ? 'بازگشت و ویرایش سند' : 'بازگشت و ویرایش فاکتور'}`;
code = code.replace(submitInvLabel, submitInvRep);

const finalizeInvLabel = `ثبت قطعی فاکتور در سیستم`;
const finalizeInvRep = `{activeTab.includes('warehouse') ? 'ثبت قطعی سند در سیستم' : 'ثبت قطعی فاکتور در سیستم'}`;
code = code.replace(finalizeInvLabel, finalizeInvRep);

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing labels');
