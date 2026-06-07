export interface CompanySettings {
  storeName: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  currency?: string;
}

const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

const saveLocalData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const getStoreSettings = async (): Promise<CompanySettings | null> => {
  return getLocalData<CompanySettings | null>('company_profile', null);
};

export const saveStoreSettings = async (settings: CompanySettings): Promise<void> => {
  saveLocalData('company_profile', settings);
};

// Persons
export const getPersons = async () => {
  const persons = getLocalData<any[]>('persons', []);
  return persons.sort((a, b) => b.createdAt - a.createdAt);
};

export const addPerson = async (person: any) => {
  const persons = getLocalData<any[]>('persons', []);
  const now = Date.now();
  const newPerson = { ...person, id: generateId(), createdAt: now, updatedAt: now };
  persons.push(newPerson);
  saveLocalData('persons', persons);
  return newPerson;
};

export const updatePerson = async (id: string, person: any) => {
  const persons = getLocalData<any[]>('persons', []);
  const index = persons.findIndex(p => p.id === id);
  if (index !== -1) {
    persons[index] = { ...persons[index], ...person, updatedAt: Date.now() };
    saveLocalData('persons', persons);
    return persons[index];
  }
  return null;
};

export const deletePerson = async (id: string) => {
  const persons = getLocalData<any[]>('persons', []);
  saveLocalData('persons', persons.filter(p => p.id !== id));
};

// Accounts
export const getAccounts = async () => {
  const accounts = getLocalData<any[]>('accounts', []);
  return accounts.sort((a, b) => b.createdAt - a.createdAt);
};

export const addAccount = async (account: any) => {
  const accounts = getLocalData<any[]>('accounts', []);
  const now = Date.now();
  const newAccount = { ...account, id: generateId(), createdAt: now, updatedAt: now };
  accounts.push(newAccount);
  saveLocalData('accounts', accounts);
  return newAccount;
};

export const updateAccount = async (id: string, account: any) => {
  const accounts = getLocalData<any[]>('accounts', []);
  const index = accounts.findIndex(p => p.id === id);
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...account, updatedAt: Date.now() };
    saveLocalData('accounts', accounts);
    return accounts[index];
  }
  return null;
};

export const deleteAccount = async (id: string) => {
  const accounts = getLocalData<any[]>('accounts', []);
  saveLocalData('accounts', accounts.filter(p => p.id !== id));
};

// Cashboxes
export const getCashboxes = async () => {
  const cashboxes = getLocalData<any[]>('cashboxes', []);
  return cashboxes.sort((a, b) => b.createdAt - a.createdAt);
};

export const addCashbox = async (cashbox: any) => {
  const cashboxes = getLocalData<any[]>('cashboxes', []);
  const now = Date.now();
  const newCashbox = { ...cashbox, id: generateId(), createdAt: now, updatedAt: now };
  cashboxes.push(newCashbox);
  saveLocalData('cashboxes', cashboxes);
  return newCashbox;
};

export const updateCashbox = async (id: string, cashbox: any) => {
  const cashboxes = getLocalData<any[]>('cashboxes', []);
  const index = cashboxes.findIndex(p => p.id === id);
  if (index !== -1) {
    cashboxes[index] = { ...cashboxes[index], ...cashbox, updatedAt: Date.now() };
    saveLocalData('cashboxes', cashboxes);
    return cashboxes[index];
  }
  return null;
};

export const deleteCashbox = async (id: string) => {
  const cashboxes = getLocalData<any[]>('cashboxes', []);
  saveLocalData('cashboxes', cashboxes.filter(p => p.id !== id));
};

// Products
export const getProducts = async () => {
  const products = getLocalData<any[]>('products', []);
  return products.sort((a, b) => b.createdAt - a.createdAt);
};

export const addProduct = async (product: any) => {
  const products = getLocalData<any[]>('products', []);
  const now = Date.now();
  const newProduct = { ...product, id: generateId(), createdAt: now, updatedAt: now };
  products.push(newProduct);
  saveLocalData('products', products);
  return newProduct;
};

export const updateProduct = async (id: string, product: any) => {
  const products = getLocalData<any[]>('products', []);
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...product, updatedAt: Date.now() };
    saveLocalData('products', products);
    return products[index];
  }
  return null;
};

export const deleteProduct = async (id: string) => {
  const products = getLocalData<any[]>('products', []);
  saveLocalData('products', products.filter(p => p.id !== id));
};

// Transactions
export const getTransactions = async () => {
  const transactions = getLocalData<any[]>('transactions', []);
  return transactions.sort((a, b) => b.createdAt - a.createdAt);
};

export const addTransaction = async (transaction: any) => {
  const transactions = getLocalData<any[]>('transactions', []);
  const now = Date.now();
  const newTransaction = { ...transaction, id: generateId(), createdAt: now, updatedAt: now };

  if (transaction.type === 'receive' || transaction.type === 'pay' || transaction.type === 'salary') {
    const amount = Number(transaction.amount) || 0;
    if (transaction.resourceType === 'bank') {
      const accounts = getLocalData<any[]>('accounts', []);
      const index = accounts.findIndex(a => a.id === transaction.resourceId);
      if (index !== -1) {
        if (transaction.type === 'receive') {
          accounts[index].balance += amount;
        } else {
          accounts[index].balance -= amount;
        }
        saveLocalData('accounts', accounts);
      }
    } else if (transaction.resourceType === 'cashbox') {
      const cashboxes = getLocalData<any[]>('cashboxes', []);
      const index = cashboxes.findIndex(c => c.id === transaction.resourceId);
      if (index !== -1) {
        if (transaction.type === 'receive') {
          cashboxes[index].balance += amount;
        } else {
          cashboxes[index].balance -= amount;
        }
        saveLocalData('cashboxes', cashboxes);
      }
    }
  }

  transactions.push(newTransaction);
  saveLocalData('transactions', transactions);
  return newTransaction;
};

export const deleteTransaction = async (id: string) => {
  const transactions = getLocalData<any[]>('transactions', []);
  const t = transactions.find(tx => tx.id === id);
  if (t) {
    const amount = Number(t.amount) || 0;
    if (t.resourceType === 'bank') {
      const accounts = getLocalData<any[]>('accounts', []);
      const index = accounts.findIndex(a => a.id === t.resourceId);
      if (index !== -1) {
        if (t.type === 'receive') {
          accounts[index].balance -= amount;
        } else {
          accounts[index].balance += amount;
        }
        saveLocalData('accounts', accounts);
      }
    } else if (t.resourceType === 'cashbox') {
      const cashboxes = getLocalData<any[]>('cashboxes', []);
      const index = cashboxes.findIndex(c => c.id === t.resourceId);
      if (index !== -1) {
        if (t.type === 'receive') {
          cashboxes[index].balance -= amount;
        } else {
          cashboxes[index].balance += amount;
        }
        saveLocalData('cashboxes', cashboxes);
      }
    }
  }
  saveLocalData('transactions', transactions.filter(p => p.id !== id));
};

// Invoices
export const getInvoices = async () => {
  const invoices = getLocalData<any[]>('invoices', []);
  return invoices.sort((a, b) => b.createdAt - a.createdAt);
};

export const addInvoice = async (invoice: any) => {
  const invoices = getLocalData<any[]>('invoices', []);
  const now = Date.now();
  const newInvoice = { ...invoice, id: generateId(), createdAt: now, updatedAt: now };
  invoices.push(newInvoice);
  saveLocalData('invoices', invoices);
  return newInvoice;
};

export const deleteInvoice = async (id: string) => {
  const invoices = getLocalData<any[]>('invoices', []);
  saveLocalData('invoices', invoices.filter(p => p.id !== id));
};
