const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states for month and year
const stateInjection = `  const [salaryPeriodMonth, setSalaryPeriodMonth] = useState<string>('1');\n  const [salaryPeriodYear, setSalaryPeriodYear] = useState<string>('1403');\n`;

content = content.replace(
    `  const [salaryBaseAmount, setSalaryBaseAmount] = useState<string>('');`,
    stateInjection + `  const [salaryBaseAmount, setSalaryBaseAmount] = useState<string>('');`
);

// 2. Add confirm and payload injection
const submitFuncStart = `  const handleSubmitSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryPersonId || !salaryBaseAmount) {
      customAlert('لطفا کارمند و مبلغ حقوق پایه را تعیین کنید');
      return;
    }

    if (!window.confirm('آیا از ثبت و صدور این فیش حقوقی اطمینان دارید؟\\nدر صورت تایید، سند و گردش مالی به ثبت می‌رسد.')) return;

`;

// Have to use match/replace or just replace with string
content = content.replace(
    /const handleSubmitSalary = async \(e: React\.FormEvent\) => \{\s*e\.preventDefault\(\);\s*if \(\!salaryPersonId \|\| \!salaryBaseAmount\) \{\s*customAlert\('لطفا کارمند و مبلغ حقوق پایه را تعیین کنید'\);\s*return;\s*\}/,
    submitFuncStart
);

const payloadReplacement = `const payloadDescription = JSON.stringify({
        isPayslip: true,
        employeeName: personName,
        periodMonth: salaryPeriodMonth,
        periodYear: salaryPeriodYear,
        base,`;

content = content.replace(
    `const payloadDescription = JSON.stringify({
        isPayslip: true,
        employeeName: personName,
        base,`,
    payloadReplacement
);

// 3. Clear states on success
content = content.replace(
    `setSalaryDescription('');`,
    `setSalaryDescription('');\n      setSalaryPeriodMonth('1');\n      setSalaryPeriodYear('1403');`
);

// 4. Update UI to add Period Selection fields
const uiInputStr = `                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">تاریخ پرداخت/اصدار</label>
                        <DatePicker`;

const newUiInputStr = `                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">دوره حقوق (ماه و سال)</label>
                        <div className="flex gap-2">
                          <select value={salaryPeriodMonth} onChange={(e) => setSalaryPeriodMonth(e.target.value)} className="w-1/2 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans">
                            {['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'].map((m, i) => (
                              <option key={i+1} value={i+1}>{m}</option>
                            ))}
                          </select>
                          <input type="number" value={salaryPeriodYear} onChange={(e) => setSalaryPeriodYear(e.target.value)} className="w-1/2 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center font-mono" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">تاریخ پرداخت/اصدار</label>
                        <DatePicker`;

content = content.replace(uiInputStr, newUiInputStr);

// 5. Change grid cols if it was grid-cols-3
const gridRegex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-6">\s*<div>\s*<label className="block text-sm font-bold text-gray-700 mb-1">انتخاب کارمند<\/label>/;
content = content.replace(
    gridRegex,
    `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">\n                      <div>\n                        <label className="block text-sm font-bold text-gray-700 mb-1">انتخاب کارمند</label>`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Done!');
