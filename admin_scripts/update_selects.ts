import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacementLabel1 = "label: `${c.personCode ? '[' + c.personCode + '] ' : ''}${c.name} (${c.role === 'customer' ? 'مشتری' : c.role === 'supplier' ? 'تامین کننده' : 'کارمند'})`";
content = content.replace(/label: \`\$\{c\.name\} \(\$\{c\.role === 'customer' \? 'مشتری' : c\.role === 'supplier' \? 'تامین کننده' : 'کارمند'\}\)\`/g, replacementLabel1);

const replacementLabel2 = "label: `${p.personCode ? '[' + p.personCode + '] ' : ''}${p.name} (${p.role === 'customer' ? 'مشتری' : p.role === 'supplier' ? 'تامین کننده' : 'کارمند'})`";
content = content.replace(/label: \`\$\{p\.name\} \(\$\{p\.role === 'customer' \? 'مشتری' : p\.role === 'supplier' \? 'تأمین‌کننده' : 'کارمند'\}\)\`/g, replacementLabel2);
content = content.replace(/label: \`\$\{p\.name\} \(\$\{p\.role === 'customer' \? 'مشتری' : p\.role === 'supplier' \? 'تأمین‌کننده' : 'کارمند'\}\)\`/g, replacementLabel2);

const regexSalaryOptions = /options=\{persons\.filter\(p => p\.role === 'employee'\)\.map\(p => \(\{\n\s*value: p\.id\.toString\(\),\n\s*label: p\.name\n\s*\}\)\) as any\}/;
content = content.replace(regexSalaryOptions, `options={persons.filter(p => p.role === 'employee').map(p => ({
                        value: p.id.toString(),
                        label: p.personCode ? '[' + p.personCode + '] ' + p.name : p.name
                      })) as any}`);

content = content.replace(/label: persons\.find\(c => c\.id === customerId\)\?\.name/g, "label: persons.find(c => c.id === customerId)?.personCode ? '[' + persons.find(c => c.id === customerId)?.personCode + '] ' + persons.find(c => c.id === customerId)?.name : persons.find(c => c.id === customerId)?.name");

content = content.replace(/label: persons\.find\(p => p\.id === receiptPersonId\)\?\.name/g, "label: persons.find(p => p.id === receiptPersonId)?.personCode ? '[' + persons.find(p => p.id === receiptPersonId)?.personCode + '] ' + persons.find(p => p.id === receiptPersonId)?.name : persons.find(p => p.id === receiptPersonId)?.name");

content = content.replace(/label: persons\.find\(p => p\.id === salaryPersonId\)\?\.name/g, "label: persons.find(p => p.id === salaryPersonId)?.personCode ? '[' + persons.find(p => p.id === salaryPersonId)?.personCode + '] ' + persons.find(p => p.id === salaryPersonId)?.name : persons.find(p => p.id === salaryPersonId)?.name");

content = content.replace(/label: persons\.find\(p => p\.id\.toString\(\) === ledgerPersonId\.toString\(\)\)\?\.name/g, "label: persons.find(p => p.id.toString() === ledgerPersonId.toString())?.personCode ? '[' + persons.find(p => p.id.toString() === ledgerPersonId.toString())?.personCode + '] ' + persons.find(p => p.id.toString() === ledgerPersonId.toString())?.name : persons.find(p => p.id.toString() === ledgerPersonId.toString())?.name");


fs.writeFileSync('src/App.tsx', content);
