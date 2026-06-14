const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/پیش‌نمایش فاکتور قبل از ثبت قطعی/g, "{activeTab.includes('warehouse') ? 'پیش‌نمایش قبل از ثبت قطع' : 'پیش‌نمایش فاکتور قبل از ثبت قطعی'}");

code = code.replace(/بازگشت و ویرایش فاکتور/g, "{activeTab.includes('warehouse') ? 'بازگشت و اصلاح' : 'بازگشت و ویرایش فاکتور'}");

code = code.replace(/ثبت قطعی فاکتور در سیستم/g, "{activeTab.includes('warehouse') ? 'ثبت قطعی در سیستم' : 'ثبت قطعی فاکتور در سیستم'}");

fs.writeFileSync('src/App.tsx', code);
console.log('done fixing mod labels');
