import fs from 'fs';

let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  "description?: string;",
  "description?: string;\n  imageUrl?: string;\n  isActive?: boolean;\n  salePrice?: number;\n  discountPercent?: number;\n  minStockLevel?: number;"
);

fs.writeFileSync('src/types/index.ts', code);
console.log('types updated');
