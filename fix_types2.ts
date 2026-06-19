import fs from 'fs';

let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "description?: string;",
  "description?: string;\n  imageUrl?: string;\n  isActive?: boolean;\n  salePrice?: number;\n  discountPercent?: number;\n  minStockLevel?: number;"
);

fs.writeFileSync('src/types.ts', code);
console.log('types.ts updated');
