const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /(<div[^>]*>\s*<label className="block text-sm font-bold text-gray-700 mb-1">تاریخ پرداخت\/اصدار<\/label>\s*<DatePicker)/g;
content = content.replace(regex, (match) => {
    return `<div className="col-span-1 md:col-span-1">\n  <label className="block text-sm font-bold text-gray-700 mb-1">دوره حقوق (سال و ماه)</label>\n  <div className="flex gap-2">\n    <select value={salaryPeriodMonth} onChange={(e) => setSalaryPeriodMonth(e.target.value)} className="w-[120px] p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans">\n      {['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'].map((m, i) => (\n        <option key={String(i+1)} value={String(i+1)}>{m}</option>\n      ))}\n    </select>\n    <input type="number" value={salaryPeriodYear} onChange={(e) => setSalaryPeriodYear(e.target.value)} className="flex-1 min-w-[80px] p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center font-mono" />\n  </div>\n</div>\n\n` + match;
});

const gridRegex = /(<div className="grid grid-cols-1 md:grid-cols-3 gap-6")(\s*>\s*<div[^>]*>\s*<label className="block text-sm font-bold text-gray-700 mb-1">انتخاب کارمند<\/label>)/g;
content = content.replace(gridRegex, `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"$2`);

fs.writeFileSync('src/App.tsx', content);
console.log('done modifying date period UI!');
