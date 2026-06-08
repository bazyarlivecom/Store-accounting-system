const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const fields = [
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

for (const field of fields) {
    const rx = new RegExp('<input[\\\\s\\\\S]*?value={' + field.state + '}[\\\\s\\\\S]*?/>', 'g');
    content = content.replace(rx, function(match) {
        if(match.includes('type="number"')) {
            let n = match.replace('<input', '<CurrencyInput');
            n = n.replace(/\\stype="number"/, '');
            n = n.replace(/\\smin="0"/, '');
            n = n.replace(/\\sstep="any"/, '');
            return n;
        }
        return match;
    });
}

const unitPriceRx = /<input[\\s\\S]*?value={item\\.unitPrice}[\\s\\S]*?\\/>/g;
content = content.replace(unitPriceRx, function(match) {
    if(match.includes('type="number"')) {
        let n = match.replace('<input', '<CurrencyInput');
        n = n.replace(/\\stype="number"/, '');
        n = n.replace(/\\smin="0"/, '');
        return n;
    }
    return match;
});

fs.writeFileSync('src/App.tsx', content);
console.log('DONE');
