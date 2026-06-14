import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Ensure format imports
if (!content.includes("from './utils/format'")) {
    content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\\nimport { addCommas, removeCommas, numberToWords } from './utils/format';");
}


const utilsToAdd = \`
const customPersonFilter = (option, inputValue) => {
  if (!inputValue) return true;
  return (option.data.searchStr || option.label || '').toLowerCase().includes(inputValue.toLowerCase());
};

const mapPersonToOption = (p) => ({
  value: p.id.toString(),
  label: (p.personCode ? '[' + p.personCode + '] ' : '') + p.name + ' (' + (p.role === 'customer' ? 'مشتری' : p.role === 'supplier' ? 'تامین کننده' : 'کارمند') + ')',
  searchStr: \${"p.name + ' ' + (p.firstName||'') + ' ' + (p.lastName||'') + ' ' + (p.phone||'') + ' ' + (p.nationalId||'') + ' ' + (p.personCode||'')"}
});

const CurrencyInput = ({ value, onChange, placeholder, className, ...props }) => {
  const [localVal, setLocalVal] = React.useState(value ? addCommas(value) : '');

  React.useEffect(() => {
    if (value !== undefined) {
      setLocalVal(addCommas(value));
    }
  }, [value]);

  const handleChange = (e) => {
    let raw = e.target.value.replace(/,/g, '');
    if (raw && isNaN(Number(raw))) return;
    setLocalVal(addCommas(raw));
    if (onChange) onChange({ target: { value: raw } });
  };

  return (
    <div className="w-full relative">
      <input
        type="text"
        dir="ltr"
        value={localVal}
        onChange={handleChange}
        placeholder={placeholder}
        className={className + " text-left"}
        {...props}
      />
      {localVal && localVal !== '0' && (
        <p className="text-[10px] text-gray-500 font-medium mt-1 px-1 absolute -bottom-[22px] right-0 z-10 w-max">{numberToWords(localVal)} تومان</p>
      )}
    </div>
  );
};
\`;

if (!content.includes("mapPersonToOption")) {
    content = content.replace("export default function App() {", utilsToAdd + "\\nexport default function App() {");
}

let c2 = content.split("export default function App() {");
let core = c2[1];

// 1. Update Person Selects
core = core.replace(
    /options={\\[\\.\\.\\.persons\\].sort\\(\\(a, b\\) => {[\\s\\S]*?return 0;\\s*}\\).map\\(c => \\(\\{ value: c\\.id\\.toString\\(\\), label:[\\s\\S]*?\\}\\)\\) as any}/g,
    "options={[...persons].sort((a, b) => { const targetRole = invoiceType === 'sale' ? 'customer' : 'supplier'; if (a.role === targetRole && b.role !== targetRole) return -1; if (a.role !== targetRole && b.role === targetRole) return 1; return 0; }).map(mapPersonToOption)} filterOption={customPersonFilter}"
);

core = core.replace(
    /options={persons.map\\(p => \\(\\{[\\s\\S]*?value: p.id.toString\\(\\),[\\s\\S]*?label:[\\s\\S]*?\\}\\)\\) as any}/g,
    "options={persons.map(mapPersonToOption)} filterOption={customPersonFilter}"
);

core = core.replace(
    /options={persons.filter\\(p => p.role === 'employee'\\).map\\(p => \\(\\{[\\s\\S]*?\\}\\)\\) as any}/g,
    "options={persons.filter(p => p.role === 'employee').map(mapPersonToOption)} filterOption={customPersonFilter}"
);


// 2. Update Currency Inputs
const currencyFields = [
    { state: 'exchangeRateInput', setter: 'setExchangeRateInput' },
    { state: 'receiptAmount', setter: 'setReceiptAmount' },
    { state: 'salaryBaseAmount', setter: 'setSalaryBaseAmount' },
    { state: 'salaryHousingAllowance', setter: 'setSalaryHousingAllowance' },
    { state: 'salaryGroceryAllowance', setter: 'setSalaryGroceryAllowance' },
    { state: 'salaryOtherAllowances', setter: 'setSalaryOtherAllowances' },
    { state: 'salaryInsuranceDeduction', setter: 'setSalaryInsuranceDeduction' },
    { state: 'salaryTaxDeduction', setter: 'setSalaryTaxDeduction' },
    { state: 'salaryOtherDeductions', setter: 'setSalaryOtherDeductions' },
    { state: 'newProductPurchasePrice', setter: 'setNewProductPurchasePrice' },
    { state: 'newProductPrice', setter: 'setNewProductPrice' },
    { state: 'newAccountBalance', setter: 'setNewAccountBalance' },
    { state: 'newCashboxBalance', setter: 'setNewCashboxBalance' }
];

for (const field of currencyFields) {
    const rx = new RegExp(\`<input\\\\s+type="number"([\\\\s\\\\S]*?)value={\\\\s*\${field.state}\\\\s*}([\\\\s\\\\S]*?)onChange={\\\\(e\\\\) => \${field.setter}\\\\(e\\.target\\.value\\\\)}([\\\\s\\\\S]*?)/>\`, "g");
    core = core.replace(rx, \`<CurrencyInput$1value={\${field.state}}$2onChange={(e) => \${field.setter}(e.target.value)}$3/>\`);
}

// unitPrice case
core = core.replace(/<input\\s+type="number"\\s+min="0"\\s+value={item\\.unitPrice}\\s+onChange={\\(e\\) => handleItemChange\\(item\\.id, 'unitPrice', e\\.target\\.value\\)}\\s+className="w-full text-center py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"\\s+\\/>/g, 
\`<CurrencyInput
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                            className="w-full text-center py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          />\`);

content = c2[0] + "export default function App() {" + core;
fs.writeFileSync('src/App.tsx', content);
console.log("SUCCESS");
