import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/newProductCategoryIdId/g, 'newProductCategoryId');
content = content.replace(/setNewProductCategoryIdId/g, 'setNewProductCategoryId');

fs.writeFileSync('src/App.tsx', content);
