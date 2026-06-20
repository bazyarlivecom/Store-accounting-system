const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importXlsx = "import * as XLSX from 'xlsx';";
if (!code.includes("import * as XLSX")) {
    code = code.replace("import { motion", importXlsx + "\nimport { motion");
}

const targetExport = `  const handleExportProductsData = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = \`products_export_\${new Date().toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR').replace(/\\//g, '-')}.json\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    customAlert('خروجی کالاها با موفقیت دریافت شد.');
  };`;

const newExport = `  const handleExportProductsData = () => {
    const worksheet = XLSX.utils.json_to_sheet(products.map(p => {
       const mapped = { ...p };
       delete mapped.priceHistory; // Remove history for smaller exports if large, optional.
       return mapped;
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const filename = \`products_export_\${new Date().toLocaleDateString(storeSettings?.calendarType === 'gregorian' ? 'en-US' : 'fa-IR').replace(/\\//g, '-')}.xlsx\`;
    XLSX.writeFile(workbook, filename);
    customAlert('خروجی اکسل کالاها با موفقیت دریافت شد.');
  };`;

const targetImport = `  const handleImportProductsData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (!Array.isArray(imported)) {
            customAlert('فایل نامعتبر است. فرمت صحیح ذخیره شده کالاها را انتخاب کنید.');
            return;
          }
          if (!confirm(\`تعداد \${imported.length} کالا آماده درون‌ریزی است. ادامه می‌دهید?\`)) return;
          
          setSubmittingProduct(true);
          for (const p of imported) {
             const payload = { ...p };
             delete payload.id;
             delete payload.createdAt;
             delete payload.updatedAt;
             await addProduct(payload);
          }
          await fetchProducts();
          setSubmittingProduct(false);
          customAlert('کالاها با موفقیت درون‌ریزی شدند.');
        } catch (err) {
          console.error(err);
          customAlert('خطا در خواندن فایل!');
          setSubmittingProduct(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };`;

const newImport = `  const handleImportProductsData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const imported = XLSX.utils.sheet_to_json(worksheet);
          
          if (!Array.isArray(imported) || imported.length === 0) {
            customAlert('فایل نامعتبر یا خالی است.');
            return;
          }
          if (!confirm(\`تعداد \${imported.length} کالا آماده درون‌ریزی است. ادامه می‌دهید?\`)) return;
          
          setSubmittingProduct(true);
          for (const p of imported) {
             const payload = { ...p };
             delete payload.id;
             delete payload.createdAt;
             delete payload.updatedAt;
             await addProduct(payload);
          }
          await fetchProducts();
          setSubmittingProduct(false);
          customAlert('کالاها با موفقیت درون‌ریزی شدند.');
        } catch (err) {
          console.error(err);
          customAlert('خطا در خواندن فایل اکسل!');
          setSubmittingProduct(false);
        }
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };`;

if (code.includes(targetExport)) {
   code = code.replace(targetExport, newExport);
   console.log('Replaced export');
} else {
   console.log('Export code not found');
}

// Check with types as well since it might have "e: any"
const targetImportWithAny = targetImport.replace('(e)', '(e: any)').replace('(event)', '(event: any)');
const newImportWithAny = newImport.replace('(e)', '(e: any)').replace('(event)', '(event: any)');

if (code.includes(targetImport)) {
   code = code.replace(targetImport, newImport);
   console.log('Replaced import');
} else if (code.includes(targetImportWithAny)) {
   code = code.replace(targetImportWithAny, newImportWithAny);
   console.log('Replaced import (with any)');
} else {
   console.log('Import code not found');
}

const targetTitle1 = 'title="خروجی پشتیبان کالاها (JSON)"';
if (code.includes(targetTitle1)) {
    code = code.replace(targetTitle1, 'title="خروجی اکسل کالاها"');
}
const targetTitle2 = 'title="ورود اطلاعات کالاها از فایل JSON"';
if (code.includes(targetTitle2)) {
    code = code.replace(targetTitle2, 'title="ورود اطلاعات کالاها از فایل اکسل"');
}

fs.writeFileSync('src/App.tsx', code);
