import fs from 'fs';

let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "warehouseId?: string | number;",
  "warehouseId?: string | number;\n  imageUrl?: string;\n  isActive?: boolean;\n  salePrice?: number;\n  discountPercent?: number;\n  minStockLevel?: number;"
);

fs.writeFileSync('src/types.ts', code);
console.log('types.ts updated');

// Also do it for src/types/index.ts
let code2 = fs.readFileSync('src/types/index.ts', 'utf8');
code2 = code2.replace(
  "warehouseId?: string | number;",
  "warehouseId?: string | number;\n  imageUrl?: string;\n  isActive?: boolean;\n  salePrice?: number;\n  discountPercent?: number;\n  minStockLevel?: number;"
);
fs.writeFileSync('src/types/index.ts', code2);

