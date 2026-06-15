const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// For options={products.map(p => ({ ... }))} in SearchableSelect
code = code.replace(
  /options=\{products\.map\(p => \(\{\n\s*value: p\.id,\n\s*label: p\.name,\n\s*subLabel: (.*?),\n\s*badge: (.*?)\n\s*\}\)\)\}/g,
  `options={products.map(p => ({
                                value: p.id,
                                label: p.name,
                                subLabel: $1,
                                badge: $2,
                                searchStr: \`\${p.productCode || ''} \${p.barcode || ''}\`
                              }))}`
);

// For options={products.filter(...).map(p => ({ ... }))} in SearchableSelect
code = code.replace(
  /options=\{products\.filter\((.*?)\)\.map\(p => \(\{\n\s*value: p\.id,\n\s*label: p\.name,\n\s*subLabel: (.*?),\n\s*badge: (.*?)\n\s*\}\)\)\}/g,
  `options={products.filter($1).map(p => ({
                              value: p.id,
                              label: p.name,
                              subLabel: $2,
                              badge: $3,
                              searchStr: \`\${p.productCode || ''} \${p.barcode || ''}\`
                            }))}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced");
