import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const prefixCode = `const receiptPrefix = type === 'receive' ? (storeSettings.prefix_receive_receipt || 'RD-') : (storeSettings.prefix_pay_receipt || 'PD-');`;
const newPrefixCode = `const receiptPrefix = type === 'receive' ? (storeSettings.prefix_receive_receipt || 'RD-') : type === 'salary' ? (storeSettings.prefix_salary || 'PAY-') : (storeSettings.prefix_pay_receipt || 'PD-');`;

code = code.replace(prefixCode, newPrefixCode);

// Add receiptNumber logic to handleSubmitSalary
const salaryPayloadOld = `const payload = {
        type: 'salary',
        personId: salaryPersonId,
        amount: netSalary,
        date: typeof salaryDate.toDate === 'function' ? salaryDate.toDate().toISOString() : new Date(salaryDate).toISOString(),
        jalaliDate: new Date(salaryDate).toLocaleDateString('fa-IR'),
        resourceType: salaryDirectPayment ? salaryResourceType : 'none',
        resourceId: salaryDirectPayment ? salaryResourceId : 0,
        description: payloadDescription
      };`;

const salaryPayloadNew = `
      // Auto-assign receipt number for salary
      const salaryPrefix = storeSettings.prefix_salary || 'PAY-';
      const existingRelated = transactions.filter((t: any) => t.type === 'salary' && t.receiptNumber);
      let nextNum = 1001;
      if (existingRelated.length > 0) {
        const nums = existingRelated.map((t: any) => {
          const match = String(t.receiptNumber).match(/\\d+/);
          return match ? parseInt(match[0], 10) : 0;
        });
        nextNum = Math.max(...nums) + 1;
      }
      const receiptNumber = \`\${salaryPrefix}\${nextNum}\`;

      const payload = {
        type: 'salary',
        receiptNumber,
        personId: salaryPersonId,
        amount: netSalary,
        date: typeof salaryDate.toDate === 'function' ? salaryDate.toDate().toISOString() : new Date(salaryDate).toISOString(),
        jalaliDate: new Date(salaryDate).toLocaleDateString('fa-IR'),
        resourceType: salaryDirectPayment ? salaryResourceType : 'none',
        resourceId: salaryDirectPayment ? salaryResourceId : 0,
        description: payloadDescription
      };`;
      
code = code.replace(salaryPayloadOld, salaryPayloadNew);

fs.writeFileSync('src/App.tsx', code);
