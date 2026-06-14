import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /fetchChecks\(\)\n\s+\]\);\n\s+\} catch \(err\)/;

if (regex.test(content)) {
    content = content.replace(regex, `fetchChecks()\n      ]);\n\n      setReceiptSuccessMsg(previewReceiptData.type === 'receive' ? 'رسید دریافت با موفقیت صادر شد' : 'رسید پرداخت با موفقیت صادر شد');\n    } catch (err)`);
    fs.writeFileSync('src/App.tsx', content);
    console.log('Success added msg');
} else {
    console.log('Regex fail');
}
