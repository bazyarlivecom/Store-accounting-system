import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStateStr = `  const [newProductType, setNewProductType] = useState<'product' | 'service'>('product');
  const [newProductCategory, setNewProductCategory] = useState('');`;

const newStateVars = `  const [newProductType, setNewProductType] = useState<'product' | 'service'>('product');
  const [newProductCategoryId, setNewProductCategoryId] = useState('');
  
  // Extended product fields
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [newProductPurchasePrice, setNewProductPurchasePrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductMinStock, setNewProductMinStock] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');

  // Categories list
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
`;

content = content.replace(targetStateStr, newStateVars);

const getProductsStr = `      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);`;

const getProductsVarsStr = `      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      const fetchedCats = await getProductCategories();
      setProductCategories(fetchedCats);`;

content = content.replace(getProductsStr, getProductsVarsStr);

const handleEditProductStr = `  const handleEditProduct = (product: Product) => {
    setEditingProductId(String(product.id));
    setNewProductName(product.name);
    setNewProductPrice(String(product.price));
    setNewProductType(product.type);
    setNewProductCategory(product.category || '');
    setIsProductModalOpen(true);
  };`;

const handleEditProductNewStr = `  const handleEditProduct = (product: Product) => {
    setEditingProductId(String(product.id));
    setNewProductName(product.name);
    setNewProductPrice(String(product.price));
    setNewProductType(product.type);
    setNewProductCategoryId(String(product.categoryId || ''));
    setNewProductCode(String(product.code || ''));
    setNewProductBarcode(String(product.barcode || ''));
    setNewProductPurchasePrice(String(product.purchasePrice || ''));
    setNewProductStock(String(product.stock || ''));
    setNewProductMinStock(String(product.minStock || ''));
    setNewProductUnit(String(product.unit || ''));
    setNewProductDesc(product.description || '');
    setIsProductModalOpen(true);
  };`;
content = content.replace(handleEditProductStr, handleEditProductNewStr);

const handleSaveCategory = `
  const handleSaveCategory = async () => {
    if (!newCatName) return;

    if (editingCategoryId) {
      const updated = await updateProductCategory(editingCategoryId, { name: newCatName, description: newCatDesc });
      setProductCategories(productCategories.map(c => c.id === editingCategoryId ? updated : c));
      showSuccess('گروه کالا با موفقیت بروزرسانی شد.');
    } else {
      const added = await addProductCategory({ name: newCatName, description: newCatDesc });
      setProductCategories([...productCategories, added]);
      showSuccess('گروه کالا با موفقیت ثبت شد.');
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('آیا از حذف این گروه اطمینان دارید؟')) {
      await deleteProductCategory(id);
      setProductCategories(productCategories.filter(c => c.id !== id));
      // Optionally update products that have this category
      showSuccess('گروه کالا حذف شد.');
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setNewCatName(cat.name);
    setNewCatDesc(cat.description || '');
    setIsCategoryModalOpen(true);
  };
`;

const handleSaveProductStr = `  const handleSaveProduct = async () => {
    if (!newProductName || !newProductPrice) return;

    if (editingProductId) {
      const updated = await updateProduct(editingProductId, { 
        name: newProductName, 
        price: Number(newProductPrice),
        buyPrice: Number(newProductPrice), // Adding for firebase blueprint validation
        sellPrice: Number(newProductPrice), // Adding for firebase blueprint validation
        type: newProductType,
        category: newProductCategory || 'عمومی'
      });
      setProducts(products.map(p => p.id === updated.id ? updated : p));
      showSuccess('کالا با موفقیت ویرایش شد.');
    } else {
      const added = await addProduct({ 
        name: newProductName, 
        price: Number(newProductPrice),
        buyPrice: Number(newProductPrice), // Adding for firebase blueprint validation
        sellPrice: Number(newProductPrice), // Adding for firebase blueprint validation
        type: newProductType,
        category: newProductCategory || 'عمومی'
      });
      setProducts([...products, added]);
      showSuccess('کالای جدید با موفقیت ثبت شد.');
    }
    
    setIsProductModalOpen(false);
  };`;

const handleSaveProductNewStr = `  const handleSaveProduct = async () => {
    if (!newProductName || !newProductPrice) return;

    const catName = productCategories.find(c => String(c.id) === String(newProductCategoryId))?.name || 'عمومی';

    const productPayload = {
        name: newProductName, 
        price: Number(newProductPrice),
        buyPrice: Number(newProductPurchasePrice || 0), // Adding for firebase blueprint validation
        sellPrice: Number(newProductPrice), // Adding for firebase blueprint validation
        type: newProductType,
        categoryId: newProductCategoryId,
        category: catName,
        code: newProductCode,
        barcode: newProductBarcode,
        purchasePrice: Number(newProductPurchasePrice || 0),
        stock: Number(newProductStock || 0),
        minStock: Number(newProductMinStock || 0),
        unit: newProductUnit,
        description: newProductDesc
    };

    if (editingProductId) {
      const updated = await updateProduct(editingProductId, productPayload);
      setProducts(products.map(p => p.id === updated.id ? updated : p));
      showSuccess('کالا با موفقیت ویرایش شد.');
    } else {
      const added = await addProduct(productPayload);
      setProducts([...products, added]);
      showSuccess('کالای جدید با موفقیت ثبت شد.');
    }
    
    setIsProductModalOpen(false);
  };` + handleSaveCategory;

content = content.replace(handleSaveProductStr, handleSaveProductNewStr);

fs.writeFileSync('src/App.tsx', content);
