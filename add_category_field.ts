import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace(
  /export type ProductCategory = \{[\s\S]*?\};/,
  "export type ProductCategory = {\n  id: string | number;\n  name: string;\n  description?: string;\n  parentId?: string | number | null;\n};"
);
fs.writeFileSync('src/types.ts', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(
  "const [newCatDesc, setNewCatDesc] = useState('');",
  "const [newCatDesc, setNewCatDesc] = useState('');\n  const [newCatParentId, setNewCatParentId] = useState<string | number | ''>('');"
);
appContent = appContent.replace(
  "await updateProductCategory(editingCategoryId, { name: newCatName, description: newCatDesc });",
  "await updateProductCategory(editingCategoryId, { name: newCatName, description: newCatDesc, parentId: newCatParentId || null });"
);
appContent = appContent.replace(
  "await addProductCategory({ name: newCatName, description: newCatDesc });",
  "await addProductCategory({ name: newCatName, description: newCatDesc, parentId: newCatParentId || null });"
);
appContent = appContent.replace(
  "setNewCatDesc(cat.description || '');",
  "setNewCatDesc(cat.description || '');\n    setNewCatParentId(cat.parentId || '');"
);
appContent = appContent.replace(
  "setNewCatDesc('');\n                setIsCategoryModalOpen(true);",
  "setNewCatDesc('');\n                setNewCatParentId('');\n                setIsCategoryModalOpen(true);"
);
fs.writeFileSync('src/App.tsx', appContent);
