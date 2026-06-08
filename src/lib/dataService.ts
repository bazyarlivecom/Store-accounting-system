export interface CompanySettings {
  storeName: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  currency?: string;
}

const getLocalData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const res = await fetch(`/api/data/${key}`);
    const data = await res.json();
    return data !== null ? data : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from API`, error);
    return defaultValue;
  }
};

const saveLocalData = async <T>(key: string, data: T): Promise<void> => {
  try {
    await fetch(`/api/data/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error(`Error saving ${key} to API`, error);
  }
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const getStoreSettings = async (): Promise<CompanySettings | null> => {
  return await getLocalData<CompanySettings | null>('company_profile', null);
};

export const saveStoreSettings = async (settings: CompanySettings): Promise<void> => {
  await saveLocalData('company_profile', settings);
};

// Persons
export const getPersons = async () => {
  const persons = await getLocalData<any[]>('persons', []);
  return persons.sort((a, b) => b.createdAt - a.createdAt);
};

export const addPerson = async (person: any) => {
  const persons = await getLocalData<any[]>('persons', []);
  
  let nextCode = 10000;
  if (persons.length > 0) {
    const maxCode = Math.max(...persons.map(p => Number(p.personCode) || 0));
    if (maxCode >= 10000) {
      nextCode = maxCode + 1;
    }
  }

  const now = Date.now();
  const newPerson = { ...person, personCode: String(nextCode), id: generateId(), createdAt: now, updatedAt: now };
  persons.push(newPerson);
  await saveLocalData('persons', persons);
  return newPerson;
};

export const updatePerson = async (id: string, person: any) => {
  const persons = await getLocalData<any[]>('persons', []);
  const index = persons.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    persons[index] = { ...persons[index], ...person, updatedAt: Date.now() };
    await saveLocalData('persons', persons);
    return persons[index];
  }
  return null;
};

export const deletePerson = async (id: string) => {
  const persons = await getLocalData<any[]>('persons', []);
  await saveLocalData('persons', persons.filter((p: any) => p.id !== id));
};

// Accounts
export const getAccounts = async () => {
  const accounts = await getLocalData<any[]>('accounts', []);
  return accounts.sort((a, b) => b.createdAt - a.createdAt);
};

export const addAccount = async (account: any) => {
  const accounts = await getLocalData<any[]>('accounts', []);
  const now = Date.now();
  const newAccount = { ...account, id: generateId(), createdAt: now, updatedAt: now };
  accounts.push(newAccount);
  await saveLocalData('accounts', accounts);
  return newAccount;
};

export const updateAccount = async (id: string, account: any) => {
  const accounts = await getLocalData<any[]>('accounts', []);
  const index = accounts.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...account, updatedAt: Date.now() };
    await saveLocalData('accounts', accounts);
    return accounts[index];
  }
  return null;
};

export const deleteAccount = async (id: string) => {
  const accounts = await getLocalData<any[]>('accounts', []);
  await saveLocalData('accounts', accounts.filter((p: any) => p.id !== id));
};

// Cashboxes
export const getCashboxes = async () => {
  const cashboxes = await getLocalData<any[]>('cashboxes', []);
  return cashboxes.sort((a, b) => b.createdAt - a.createdAt);
};

export const addCashbox = async (cashbox: any) => {
  const cashboxes = await getLocalData<any[]>('cashboxes', []);
  const now = Date.now();
  const newCashbox = { ...cashbox, id: generateId(), createdAt: now, updatedAt: now };
  cashboxes.push(newCashbox);
  await saveLocalData('cashboxes', cashboxes);
  return newCashbox;
};

export const updateCashbox = async (id: string, cashbox: any) => {
  const cashboxes = await getLocalData<any[]>('cashboxes', []);
  const index = cashboxes.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    cashboxes[index] = { ...cashboxes[index], ...cashbox, updatedAt: Date.now() };
    await saveLocalData('cashboxes', cashboxes);
    return cashboxes[index];
  }
  return null;
};

export const deleteCashbox = async (id: string) => {
  const cashboxes = await getLocalData<any[]>('cashboxes', []);
  await saveLocalData('cashboxes', cashboxes.filter((p: any) => p.id !== id));
};

// Product Categories
export const getProductCategories = async () => {
  const categories = await getLocalData<any[]>('product_categories', []);
  return categories.sort((a, b) => b.createdAt - a.createdAt);
};

export const addProductCategory = async (category: any) => {
  const categories = await getLocalData<any[]>('product_categories', []);
  const now = Date.now();
  const newCategory = { ...category, id: generateId(), createdAt: now, updatedAt: now };
  categories.push(newCategory);
  await saveLocalData('product_categories', categories);
  return newCategory;
};

export const updateProductCategory = async (id: string, category: any) => {
  const categories = await getLocalData<any[]>('product_categories', []);
  const index = categories.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...category, updatedAt: Date.now() };
    await saveLocalData('product_categories', categories);
    return categories[index];
  }
  return null;
};

export const deleteProductCategory = async (id: string) => {
  const categories = await getLocalData<any[]>('product_categories', []);
  await saveLocalData('product_categories', categories.filter((p: any) => p.id !== id));
};

// Products
export const getProducts = async () => {
  const products = await getLocalData<any[]>('products', []);
  return products.sort((a, b) => b.createdAt - a.createdAt);
};

export const addProduct = async (product: any) => {
  const products = await getLocalData<any[]>('products', []);
  const now = Date.now();
  const newProduct = { ...product, id: generateId(), createdAt: now, updatedAt: now };
  products.push(newProduct);
  await saveLocalData('products', products);
  return newProduct;
};

export const updateProduct = async (id: string, product: any) => {
  const products = await getLocalData<any[]>('products', []);
  const index = products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...product, updatedAt: Date.now() };
    await saveLocalData('products', products);
    return products[index];
  }
  return null;
};

export const deleteProduct = async (id: string) => {
  const products = await getLocalData<any[]>('products', []);
  await saveLocalData('products', products.filter((p: any) => p.id !== id));
};

// Transactions
export const getTransactions = async () => {
  const transactions = await getLocalData<any[]>('transactions', []);
  return transactions.sort((a, b) => b.createdAt - a.createdAt);
};

export const addTransaction = async (transaction: any) => {
  const transactions = await getLocalData<any[]>('transactions', []);
  const now = Date.now();
  const newTransaction = { ...transaction, id: generateId(), createdAt: now, updatedAt: now };

  if (transaction.type === 'receive' || transaction.type === 'pay' || transaction.type === 'salary') {
    const amount = Number(transaction.amount) || 0;
    if (transaction.resourceType === 'bank') {
      const accounts = await getLocalData<any[]>('accounts', []);
      const index = accounts.findIndex(a => a.id === transaction.resourceId);
      if (index !== -1) {
        if (transaction.type === 'receive') {
          accounts[index].balance += amount;
        } else {
          accounts[index].balance -= amount;
        }
        await saveLocalData('accounts', accounts);
      }
    } else if (transaction.resourceType === 'cashbox') {
      const cashboxes = await getLocalData<any[]>('cashboxes', []);
      const index = cashboxes.findIndex(c => c.id === transaction.resourceId);
      if (index !== -1) {
        if (transaction.type === 'receive') {
          cashboxes[index].balance += amount;
        } else {
          cashboxes[index].balance -= amount;
        }
        await saveLocalData('cashboxes', cashboxes);
      }
    }
  }

  transactions.push(newTransaction);
  await saveLocalData('transactions', transactions);
  return newTransaction;
};

export const deleteTransaction = async (id: string) => {
  const transactions = await getLocalData<any[]>('transactions', []);
  const t = transactions.find(tx => tx.id === id);
  if (t) {
    const amount = Number(t.amount) || 0;
    if (t.resourceType === 'bank') {
      const accounts = await getLocalData<any[]>('accounts', []);
      const index = accounts.findIndex(a => a.id === t.resourceId);
      if (index !== -1) {
        if (t.type === 'receive') {
          accounts[index].balance -= amount;
        } else {
          accounts[index].balance += amount;
        }
        await saveLocalData('accounts', accounts);
      }
    } else if (t.resourceType === 'cashbox') {
      const cashboxes = await getLocalData<any[]>('cashboxes', []);
      const index = cashboxes.findIndex(c => c.id === t.resourceId);
      if (index !== -1) {
        if (t.type === 'receive') {
          cashboxes[index].balance -= amount;
        } else {
          cashboxes[index].balance += amount;
        }
        await saveLocalData('cashboxes', cashboxes);
      }
    }
  }
  await saveLocalData('transactions', transactions.filter((p: any) => p.id !== id));
};

// Invoices
export const getInvoices = async () => {
  const invoices = await getLocalData<any[]>('invoices', []);
  return invoices.sort((a, b) => b.createdAt - a.createdAt);
};

export const addInvoice = async (invoice: any) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  const now = Date.now();
  const newInvoice = { ...invoice, id: generateId(), createdAt: now, updatedAt: now };
  invoices.push(newInvoice);
  await saveLocalData('invoices', invoices);
  return newInvoice;
};

export const deleteInvoice = async (id: string) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  await saveLocalData('invoices', invoices.filter((p: any) => p.id !== id));
};
