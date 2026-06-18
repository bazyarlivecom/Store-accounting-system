export interface CompanySettings {
  storeName: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  currency?: string;
}

const getLocalData = async <T>(key: string, defaultValue: T, retries = 3): Promise<T> => {
  try {
    const res = await fetch(`/api/data/${key}`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data !== null ? data : defaultValue;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getLocalData(key, defaultValue, retries - 1);
    }
    console.error(`Error reading ${key} from API`, error);
    return defaultValue;
  }
};

const saveLocalData = async <T>(key: string, data: T, retries = 3): Promise<void> => {
  try {
    const res = await fetch(`/api/data/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return saveLocalData(key, data, retries - 1);
    }
    console.error(`Error saving ${key} to API`, error);
  }
};

export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const getStoreSettings = async (): Promise<CompanySettings | null> => {
  return await getLocalData<CompanySettings | null>('company_profile', null);
};

export const saveStoreSettings = async (settings: CompanySettings): Promise<void> => {
  await saveLocalData('company_profile', settings);
};

// Users
export const getUsers = async () => {
  const users = await getLocalData<any[]>('users', []);
  return users.sort((a, b) => b.createdAt - a.createdAt);
};

export const addUser = async (user: any) => {
  const users = await getLocalData<any[]>('users', []);
  const now = Date.now();
  const newUser = { ...user, id: generateId(), createdAt: now, updatedAt: now };
  users.push(newUser);
  await saveLocalData('users', users);
  return newUser;
};

export const updateUser = async (id: string, user: any) => {
  const users = await getLocalData<any[]>('users', []);
  const index = users.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...user, updatedAt: Date.now() };
    await saveLocalData('users', users);
    return users[index];
  }
  return null;
};

export const deleteUser = async (id: string) => {
  const users = await getLocalData<any[]>('users', []);
  await saveLocalData('users', users.filter((p: any) => p.id !== id));
};

// Person Groups
export const getPersonGroups = async () => {
  const groups = await getLocalData<any[]>('person_groups', []);
  return groups.sort((a, b) => b.createdAt - a.createdAt);
};

export const addPersonGroup = async (group: any) => {
  const groups = await getLocalData<any[]>('person_groups', []);
  const now = Date.now();
  const newGroup = { ...group, id: generateId(), createdAt: now, updatedAt: now };
  groups.push(newGroup);
  await saveLocalData('person_groups', groups);
  return newGroup;
};

export const updatePersonGroup = async (id: string, group: any) => {
  const groups = await getLocalData<any[]>('person_groups', []);
  const index = groups.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    groups[index] = { ...groups[index], ...group, updatedAt: Date.now() };
    await saveLocalData('person_groups', groups);
    return groups[index];
  }
  return null;
};

export const deletePersonGroup = async (id: string) => {
  const groups = await getLocalData<any[]>('person_groups', []);
  await saveLocalData('person_groups', groups.filter((p: any) => p.id !== id));
};

// Person Roles
export const getPersonRoles = async () => {
  const roles = await getLocalData<any[]>('person_roles', []);
  if (roles.length === 0) {
    // initialize defaults
    const defaults = [
      { id: 'customer', name: 'مشتری', code: '10', color: 'bg-emerald-50 text-emerald-800 border-emerald-100', createdAt: Date.now() },
      { id: 'supplier', name: 'تامین کننده', code: '20', color: 'bg-orange-50 text-orange-850 border-orange-100', createdAt: Date.now() },
      { id: 'employee', name: 'کارمند', code: '30', color: 'bg-purple-50 text-purple-800 border-purple-100', createdAt: Date.now() }
    ];
    await saveLocalData('person_roles', defaults);
    return defaults;
  }
  return roles.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const addPersonRole = async (role: any) => {
  const roles = await getLocalData<any[]>('person_roles', []);
  const now = Date.now();
  const newRole = { ...role, id: generateId(), createdAt: now, updatedAt: now };
  roles.push(newRole);
  await saveLocalData('person_roles', roles);
  return newRole;
};

export const updatePersonRole = async (id: string, role: any) => {
  const roles = await getLocalData<any[]>('person_roles', []);
  const index = roles.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    roles[index] = { ...roles[index], ...role, updatedAt: Date.now() };
    await saveLocalData('person_roles', roles);
    return roles[index];
  }
  return null;
};

export const deletePersonRole = async (id: string) => {
  const roles = await getLocalData<any[]>('person_roles', []);
  await saveLocalData('person_roles', roles.filter((p: any) => p.id !== id));
};

// Persons
export const getPersons = async () => {
  const persons = await getLocalData<any[]>('persons', []);
  return persons.sort((a, b) => b.createdAt - a.createdAt);
};

export const addPerson = async (person: any) => {
  const persons = await getLocalData<any[]>('persons', []);
  const roles = await getPersonRoles();
  
  const roleId = person.role;
  const roleObj = roles.find(r => r.id === roleId); // Try to find dynamic role
  
  // if not found, maybe fallback to standard code mapping '10', '20', '30'
  let roleCodePrefix = '10';
  if (roleObj && roleObj.code) {
    roleCodePrefix = roleObj.code;
  } else if (roleId === 'supplier') {
    roleCodePrefix = '20';
  } else if (roleId === 'employee') {
    roleCodePrefix = '30';
  }
  
  let maxSuffix = 0;
  for (const p of persons) {
    if (p.role === roleId && p.personCode && p.personCode.startsWith(roleCodePrefix)) {
      const suffix = Number(p.personCode.substring(roleCodePrefix.length));
      if (!isNaN(suffix) && suffix > maxSuffix) {
        maxSuffix = suffix;
      }
    }
  }

  const nextSuffix = (maxSuffix + 1).toString().padStart(4, '0'); // e.g. 0001
  const finalPersonCode = `${roleCodePrefix}${nextSuffix}`;

  const now = Date.now();
  const newPerson = { ...person, personCode: finalPersonCode, id: generateId(), createdAt: now, updatedAt: now };
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

// Warehouses
export const getWarehouses = async () => {
  const warehouses = await getLocalData<any[]>('warehouses', []);
  return warehouses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const addWarehouse = async (warehouse: any) => {
  const warehouses = await getLocalData<any[]>('warehouses', []);
  const now = Date.now();
  const newWarehouse = { ...warehouse, id: generateId(), createdAt: now, updatedAt: now };
  warehouses.push(newWarehouse);
  await saveLocalData('warehouses', warehouses);
  return newWarehouse;
};

export const updateWarehouse = async (id: string, warehouse: any) => {
  const warehouses = await getLocalData<any[]>('warehouses', []);
  const index = warehouses.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    warehouses[index] = { ...warehouses[index], ...warehouse, updatedAt: Date.now() };
    await saveLocalData('warehouses', warehouses);
    return warehouses[index];
  }
  return null;
};

export const deleteWarehouse = async (id: string) => {
  const warehouses = await getLocalData<any[]>('warehouses', []);
  await saveLocalData('warehouses', warehouses.filter((p: any) => p.id !== id));
};

// Product Categories
export const getProductCategories = async () => {
  const categories = await getLocalData<any[]>('product_categories', []);
  return categories.sort((a, b) => b.createdAt - a.createdAt);
};

export const addProductCategory = async (category: any) => {
  const categories = await getLocalData<any[]>('product_categories', []);
  const now = Date.now();
  
  let maxCatCode = 0;
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    if (c.code) {
      const num = parseInt(c.code, 10);
      if (!isNaN(num) && num > maxCatCode) maxCatCode = num;
    } else {
      const idx = i + 1;
      if (idx > maxCatCode) maxCatCode = idx;
    }
  }
  const catCode = (maxCatCode + 1).toString().padStart(2, '0');

  const newCategory = { ...category, code: catCode, id: generateId(), createdAt: now, updatedAt: now };
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
  const categories = await getLocalData<any[]>('product_categories', []);
  const now = Date.now();

  let newCode = product.code;
  if (!newCode && product.categoryId) {
    const catIndex = categories.findIndex(c => String(c.id) === String(product.categoryId));
    const category = categories[catIndex];
    let catCode = category?.code;
    if (!catCode && catIndex !== -1) {
      catCode = (catIndex + 1).toString().padStart(2, '0');
    } else if (!catCode) {
      catCode = '00';
    }

    const catProducts = products.filter(p => String(p.categoryId) === String(product.categoryId));
    let maxNum = 0;
    for(const p of catProducts) {
      if (p.code && typeof p.code === 'string' && p.code.startsWith(`${catCode}-`)) {
        const numStr = p.code.replace(`${catCode}-`, '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    maxNum++;
    newCode = `${catCode}-${maxNum.toString().padStart(3, '0')}`;
  } else if (!newCode) {
    // If no category is chosen, use '00' prefix
    let maxNum = 0;
    const catProducts = products.filter(p => !p.categoryId || p.categoryId === '');
    for(const p of catProducts) {
      if (p.code && typeof p.code === 'string' && p.code.startsWith(`00-`)) {
        const numStr = p.code.replace(`00-`, '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    maxNum++;
    newCode = `00-${maxNum.toString().padStart(3, '0')}`;
  }

  const newProduct = { ...product, code: newCode, id: generateId(), createdAt: now, updatedAt: now };
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

export const updateTransaction = async (id: string | number, updated: any) => {
  const transactions = await getLocalData<any[]>('transactions', []);
  const idx = transactions.findIndex((t: any) => t.id.toString() === id.toString());
  if (idx !== -1) {
    transactions[idx] = { ...transactions[idx], ...updated, updatedAt: Date.now() };
    await saveLocalData('transactions', transactions);
    return transactions[idx];
  }
  throw new Error('Transaction not found');
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

  // Recalculate warehouse stocks automatically
  await recalculateAllWarehouseStocks();

  return newInvoice;
};

export const updateInvoice = async (id: string | number, updated: any) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  const idx = invoices.findIndex((i: any) => i.id.toString() === id.toString());
  if (idx !== -1) {
    invoices[idx] = { ...invoices[idx], ...updated, updatedAt: Date.now() };
    await saveLocalData('invoices', invoices);
    await recalculateAllWarehouseStocks();
    return invoices[idx];
  }
  throw new Error('Invoice not found');
};

export const deleteInvoice = async (id: string) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  const invoiceToDelete = invoices.find((p: any) => p.id === id || p.id === Number(id) || p.id === String(id));
  
  const toDeleteIds = new Set([id, Number(id), String(id)]);
  
  if (invoiceToDelete) {
     invoices.forEach(inv => {
        if (inv.isAutoGenerated && inv.sourceInvoiceId && (inv.sourceInvoiceId === invoiceToDelete.id || inv.sourceInvoiceId === invoiceToDelete.invoiceNumber)) {
           toDeleteIds.add(inv.id);
           toDeleteIds.add(String(inv.id));
        }
     });
  }

  await saveLocalData('invoices', invoices.filter((p: any) => !toDeleteIds.has(p.id) && !toDeleteIds.has(String(p.id))));

  // Recalculate warehouse stocks automatically
  await recalculateAllWarehouseStocks();
};

// Checkbooks
export const getCheckbooks = async () => {
  const data = await getLocalData<any[]>('checkbooks', []);
  return data.sort((a, b) => b.createdAt - a.createdAt);
};

export const addCheckbook = async (record: any) => {
  const data = await getLocalData<any[]>('checkbooks', []);
  const now = Date.now();
  const newItem = { ...record, id: generateId(), createdAt: now, updatedAt: now };
  data.push(newItem);
  await saveLocalData('checkbooks', data);
  return newItem;
};

export const updateCheckbook = async (id: string, record: any) => {
  const data = await getLocalData<any[]>('checkbooks', []);
  const index = data.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...record, updatedAt: Date.now() };
    await saveLocalData('checkbooks', data);
    return data[index];
  }
  return null;
};

export const deleteCheckbook = async (id: string) => {
  const data = await getLocalData<any[]>('checkbooks', []);
  await saveLocalData('checkbooks', data.filter((p: any) => p.id !== id));
};

// Issued Checks
export const getIssuedChecks = async () => {
  const data = await getLocalData<any[]>('issued_checks', []);
  return data.sort((a, b) => b.createdAt - a.createdAt);
};

export const addIssuedCheck = async (record: any) => {
  const data = await getLocalData<any[]>('issued_checks', []);
  const now = Date.now();
  const newItem = { ...record, id: generateId(), createdAt: now, updatedAt: now };
  data.push(newItem);
  await saveLocalData('issued_checks', data);
  return newItem;
};

export const updateIssuedCheck = async (id: string, record: any) => {
  const data = await getLocalData<any[]>('issued_checks', []);
  const index = data.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...record, updatedAt: Date.now() };
    await saveLocalData('issued_checks', data);
    return data[index];
  }
  return null;
};

export const deleteIssuedCheck = async (id: string) => {
  const data = await getLocalData<any[]>('issued_checks', []);
  await saveLocalData('issued_checks', data.filter((p: any) => p.id !== id));
};

// Received Checks
export const getReceivedChecks = async () => {
  const data = await getLocalData<any[]>('received_checks', []);
  return data.sort((a, b) => b.createdAt - a.createdAt);
};

export const addReceivedCheck = async (record: any) => {
  const data = await getLocalData<any[]>('received_checks', []);
  const now = Date.now();
  const newItem = { ...record, id: generateId(), createdAt: now, updatedAt: now };
  data.push(newItem);
  await saveLocalData('received_checks', data);
  return newItem;
};

export const updateReceivedCheck = async (id: string, record: any) => {
  const data = await getLocalData<any[]>('received_checks', []);
  const index = data.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...record, updatedAt: Date.now() };
    await saveLocalData('received_checks', data);
    return data[index];
  }
  return null;
};

export const deleteReceivedCheck = async (id: string) => {
  const data = await getLocalData<any[]>('received_checks', []);
  await saveLocalData('received_checks', data.filter((p: any) => p.id !== id));
};

// Warehouse Stocks Persistence & Recalculation
export const getRefundRequests = async () => {
  return await getLocalData<any[]>('refundRequests', []);
};

export const addRefundRequest = async (request: any) => {
  const requests = await getLocalData<any[]>('refundRequests', []);
  const now = Date.now();
  const newRequest = { ...request, id: generateId(), createdAt: now, updatedAt: now };
  requests.push(newRequest);
  await saveLocalData('refundRequests', requests);
  return newRequest;
};

export const updateRefundRequest = async (id: string, updated: any) => {
  const requests = await getLocalData<any[]>('refundRequests', []);
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updated, updatedAt: Date.now() };
    await saveLocalData('refundRequests', requests);
    return requests[index];
  }
  return null;
};

export const deleteRefundRequest = async (id: string) => {
  const requests = await getLocalData<any[]>('refundRequests', []);
  const filtered = requests.filter(r => r.id !== id);
  await saveLocalData('refundRequests', filtered);
};

export const getWarehouseStocks = async () => {
  const data = await getLocalData<any[]>('warehouse_stocks', []);
  if (data.length === 0) {
    // Perform initial recalculation if empty
    return await recalculateAllWarehouseStocks();
  }
  return data;
};

export const saveWarehouseStocks = async (stocks: any[]) => {
  await saveLocalData('warehouse_stocks', stocks);
};

export const recalculateAllWarehouseStocks = async () => {
  const products = await getLocalData<any[]>('products', []);
  const invoices = await getLocalData<any[]>('invoices', []);
  const warehouses = await getLocalData<any[]>('warehouses', []);

  const stocksMap: Record<string, {
    productId: string | number;
    warehouseId: string | number;
    physicalStock: number;
    reservedStock: number;
    availableStock: number;
  }> = {};

  // 1. Initialize for all products that have stock/warehouse
  products.forEach(p => {
    if (p.type === 'service') return;
    const baseStock = Number(p.stock) || 0;
    const defaultWhId = (p.warehouseId || (warehouses[0]?.id) || 'unknown').toString();
    const key = `${p.id}_${defaultWhId}`;
    
    if (!stocksMap[key]) {
      stocksMap[key] = {
        productId: p.id,
        warehouseId: defaultWhId,
        physicalStock: 0,
        reservedStock: 0,
        availableStock: 0
      };
    }
    stocksMap[key].physicalStock += baseStock;
  });

  // Track sales and remittances to calculate reserved stock
  const saleQtysMap: Record<string, number> = {};
  const remittedSaleQtysMap: Record<string, number> = {};

  // 2. Process all invoices
  invoices.forEach(inv => {
    if (!inv.items || !Array.isArray(inv.items)) return;
    inv.items.forEach((i: any) => {
      const prodId = i.productId;
      if (!prodId) return;

      const product = products.find(p => p.id?.toString() === prodId.toString());
      if (!product || product.type === 'service') return;

      let q = Number(i.quantity) || 0;
      if (i.isSecondaryUnit && product.unitRatio) {
        q = q * Number(product.unitRatio);
      }

      const defaultWhId = (product.warehouseId || (warehouses[0]?.id) || 'unknown').toString();
      const whId = (i.warehouseId || inv.warehouseId || defaultWhId).toString();
      const key = `${prodId}_${whId}`;

      if (!stocksMap[key]) {
        stocksMap[key] = {
          productId: prodId,
          warehouseId: whId,
          physicalStock: 0,
          reservedStock: 0,
          availableStock: 0
        };
      }

      if (inv.type === 'warehouse_receipt') {
        stocksMap[key].physicalStock += q;
      } else if (inv.type === 'warehouse_remittance') {
        stocksMap[key].physicalStock -= q;
        if (inv.sourceInvoiceId) {
          const sourceInv = invoices.find(sinv => sinv.id?.toString() === inv.sourceInvoiceId?.toString());
          if (sourceInv && sourceInv.type === 'sale') {
            remittedSaleQtysMap[key] = (remittedSaleQtysMap[key] || 0) + q;
          }
        } else {
          remittedSaleQtysMap[key] = (remittedSaleQtysMap[key] || 0) + q;
        }
      } else if (inv.type === 'sale') {
        saleQtysMap[key] = (saleQtysMap[key] || 0) + q;
      }
    });
  });

  // 3. Process reservations by aggregating globally per product
  const productGlobalSales: Record<string, number> = {};
  const productGlobalRemitted: Record<string, number> = {};
  
  Object.keys(saleQtysMap).forEach(key => {
    const prodId = key.split('_')[0];
    productGlobalSales[prodId] = (productGlobalSales[prodId] || 0) + saleQtysMap[key];
  });
  
  Object.keys(remittedSaleQtysMap).forEach(key => {
    const prodId = key.split('_')[0];
    productGlobalRemitted[prodId] = (productGlobalRemitted[prodId] || 0) + remittedSaleQtysMap[key];
  });
  
  Object.keys(productGlobalSales).forEach(prodId => {
    const totalSale = productGlobalSales[prodId] || 0;
    const totalRemittedForSale = productGlobalRemitted[prodId] || 0;
    const unremitted = Math.max(0, totalSale - totalRemittedForSale);
    
    if (unremitted > 0) {
      const product = products.find(p => p.id.toString() === prodId.toString());
      const defaultWhId = (product?.warehouseId || (warehouses[0]?.id) || 'unknown').toString();
      const key = `${prodId}_${defaultWhId}`;
      
      if (!stocksMap[key]) {
        stocksMap[key] = {
          productId: prodId,
          warehouseId: defaultWhId,
          physicalStock: 0,
          reservedStock: 0,
          availableStock: 0
        };
      }
      stocksMap[key].reservedStock += unremitted;
    }
  });

  // 4. Transform and save
  const finalStocksList: any[] = Object.keys(stocksMap).map(key => {
    const item = stocksMap[key];
    return {
      id: key,
      productId: item.productId,
      warehouseId: item.warehouseId,
      physicalStock: item.physicalStock,
      reservedStock: item.reservedStock,
      availableStock: item.physicalStock - item.reservedStock,
      lastUpdated: Date.now()
    };
  });

  await saveLocalData('warehouse_stocks', finalStocksList);
  return finalStocksList;
};

