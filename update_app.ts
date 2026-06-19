import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const tabRegex = /const \[activeTab, setActiveTab \] = useState<'([^>]+)'>\(/;
let match = tabRegex.exec(code);
if (match) {
  const newTabsStr = match[1] + " | 'loans'";
  code = code.replace(match[0], `const [activeTab, setActiveTab ] = useState<'${newTabsStr}'>(`);
}

const stateAddStr = `
  const [loans, setLoans] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);`;

if(!code.includes('const [loans, setLoans]')) {
  code = code.replace('const [settings, setSettings] = useState<CompanySettings>(', stateAddStr + '\n  const [settings, setSettings] = useState<CompanySettings>(');
}

code = code.replace(', storeSettings, productCategories, returnRefundRequests, warehouseDocs, salaryPayrolls]);', ', storeSettings, productCategories, returnRefundRequests, warehouseDocs, salaryPayrolls, loans, installments]);');

code = code.replace(/setReturnRefundRequests\(\s*saved\.returnRefundRequests\s*\|\|\s*\[\]\s*\);/, `setReturnRefundRequests(saved.returnRefundRequests || []);\n      if(saved.loans) setLoans(saved.loans);\n      if(saved.installments) setInstallments(saved.installments);`);

code = code.replace(/salaryPayrolls,\s*returnRefundRequests/, 'salaryPayrolls, returnRefundRequests, loans, installments');

// Also update the dependencies array for the useMemo of saving
const memoRegex = /localStorage\.setItem\('appData', JSON\.stringify\(\{([\s\S]+?)\}\)\);/;
const memoMatch = memoRegex.exec(code);
if (memoMatch && !memoMatch[0].includes('loans')) {
    code = code.replace(memoMatch[0], memoMatch[0].replace('}', ',\n        loans,\n        installments\n      }'));
}


fs.writeFileSync('src/App.tsx', code);
console.log('updated');
