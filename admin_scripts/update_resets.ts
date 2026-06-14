import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/setNewProductCategory/g, 'setNewProductCategoryId');
content = content.replace(/newProductCategory/g, 'newProductCategoryId');

const missingResets = `setNewProductCategoryId('');
                setNewProductCode('');
                setNewProductBarcode('');
                setNewProductPurchasePrice('');
                setNewProductStock('');
                setNewProductMinStock('');
                setNewProductUnit('');
                setNewProductDesc('');`;

content = content.replace(/setNewProductCategoryId\(''\);/g, missingResets);

fs.writeFileSync('src/App.tsx', content);
