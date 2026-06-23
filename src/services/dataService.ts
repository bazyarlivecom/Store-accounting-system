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

// Document Number Generator based on system settings
export const generateDocNumber = async (docTypeKey: string): Promise<string> => {
  try {
    const settings = await getStoreSettings();
    if (!settings) return Date.now().toString().slice(-6);

    const prefixKey = `prefix_${docTypeKey}`;
    const startKey = `start_${docTypeKey}`;
    const lenKey = `len_${docTypeKey}`;

    const prefix = settings[prefixKey as keyof CompanySettings] !== undefined ? String(settings[prefixKey as keyof CompanySettings]) : '';
    const startObj = settings[startKey as keyof CompanySettings];
    const start = startObj && !isNaN(Number(startObj)) ? Number(startObj) : 1000;
    const lenObj = settings[lenKey as keyof CompanySettings];
    const len = lenObj && !isNaN(Number(lenObj)) ? Number(lenObj) : 6;

    let items: any[] = [];
    if (docTypeKey === 'sale' || docTypeKey === 'purchase' || docTypeKey.includes('return') || docTypeKey === 'proforma') {
      items = await getInvoices();
      items = items.filter(i => docTypeKey.includes('return') ? i.type === docTypeKey : (docTypeKey === 'sale' ? i.type === 'sale' : i.type === docTypeKey));
    } else if (docTypeKey === 'warehouse_receipt' || docTypeKey === 'warehouse_remittance') {
      items = await getInvoices();
      items = items.filter(i => i.type === docTypeKey);
    } else if (docTypeKey === 'receive_receipt' || docTypeKey === 'pay_receipt' || docTypeKey === 'salary') {
      items = await getTransactions();
      const typeMap: any = { 'receive_receipt': 'receive', 'pay_receipt': 'pay', 'salary': 'salary' };
      items = items.filter(i => i.type === typeMap[docTypeKey]);
    } else if (docTypeKey === 'check_issued') items = await getIssuedChecks();
    else if (docTypeKey === 'check_received') items = await getReceivedChecks();
    else if (docTypeKey === 'person') items = await getPersons();
    else if (docTypeKey === 'product') items = await getProducts();
    else if (docTypeKey === 'accounting_document') items = await getAccountingDocuments();
    else if (docTypeKey === 'loan') items = await getLoans();
    else if (docTypeKey === 'installment') items = await getInstallments();

    const sequentialNum = start + items.length;
    const numStr = String(sequentialNum).padStart(len, '0');
    return `${prefix}${numStr}`;
    
  } catch (err) {
    return Date.now().toString().slice(-6);
  }
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'User'.toUpperCase(), 'ثبت رکورد جدید در users', 'User', newUser.id);
  }

  return newUser;
};

export const updateUser = async (id: string, user: any) => {
  const users = await getLocalData<any[]>('users', []);
  const index = users.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    users[index] = { ...users[index], ...user, updatedAt: Date.now() };
    await saveLocalData('users', users);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'User'.toUpperCase(), 'ویرایش رکورد در users', 'User', users[index].id);
  }

    return users[index];
  }
  return null;
};

export const deleteUser = async (id: string) => {
  const users = await getLocalData<any[]>('users', []);
  await saveLocalData('users', users.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'PersonGroup'.toUpperCase(), 'ثبت رکورد جدید در person_groups', 'PersonGroup', newGroup.id);
  }

  return newGroup;
};

export const updatePersonGroup = async (id: string, group: any) => {
  const groups = await getLocalData<any[]>('person_groups', []);
  const index = groups.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    groups[index] = { ...groups[index], ...group, updatedAt: Date.now() };
    await saveLocalData('person_groups', groups);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'PersonGroup'.toUpperCase(), 'ویرایش رکورد در person_groups', 'PersonGroup', groups[index].id);
  }

    return groups[index];
  }
  return null;
};

export const deletePersonGroup = async (id: string) => {
  const groups = await getLocalData<any[]>('person_groups', []);
  await saveLocalData('person_groups', groups.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'PersonRole'.toUpperCase(), 'ثبت رکورد جدید در person_roles', 'PersonRole', newRole.id);
  }

  return newRole;
};

export const updatePersonRole = async (id: string, role: any) => {
  const roles = await getLocalData<any[]>('person_roles', []);
  const index = roles.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    roles[index] = { ...roles[index], ...role, updatedAt: Date.now() };
    await saveLocalData('person_roles', roles);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'PersonRole'.toUpperCase(), 'ویرایش رکورد در person_roles', 'PersonRole', roles[index].id);
  }

    return roles[index];
  }
  return null;
};

export const deletePersonRole = async (id: string) => {
  const roles = await getLocalData<any[]>('person_roles', []);
  await saveLocalData('person_roles', roles.filter((p: any) => String(p.id) !== String(id)));
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
  let finalPersonCode = `${roleCodePrefix}${nextSuffix}`;

  // Check if there is specific configuration for Person Code in settings
  const settings = await getStoreSettings();
  if (settings && (settings as any).prefix_person !== undefined) {
    finalPersonCode = await generateDocNumber('person');
  }

  // --- Handle Ledger Accounts for the Person ---
  let finalAccountingCode = person.accountingCode;
  
  const ledgerAccounts = await getLedgerAccounts();
  // Find standard parent for the role
  let parentCode = '12'; // Default to receivables for customer
  let parentNature = 'debit';
  if (roleId === 'supplier') {
    parentCode = '21';
    parentNature = 'credit';
  } else if (roleId === 'employee') {
    parentCode = '21'; // Maybe under payables
    parentNature = 'credit';
  }

  const parentGeneralAcc = ledgerAccounts.find(a => a.code === parentCode);
  
  if (parentGeneralAcc) {
    // Check for a specific subsidiary account for this role (e.g. "مشتریان", "تامین‌کنندگان")
    let subsidiaryCode = parentCode + '01'; // Default 01 sub-account
    if (roleId === 'supplier') subsidiaryCode = '2101';
    else if (roleId === 'employee') subsidiaryCode = '2102';
    
    let subAcc = ledgerAccounts.find(a => a.code === subsidiaryCode);
    if (!subAcc) {
      // Create it
      const subAccTitle = roleId === 'supplier' ? 'تامین‌کنندگان' : (roleId === 'employee' ? 'کارکنان' : 'مشتریان');
      subAcc = {
        id: generateId(),
        code: subsidiaryCode,
        title: subAccTitle,
        type: 'subsidiary',
        nature: parentNature,
        parentId: parentGeneralAcc.id
      };
      await addLedgerAccount(subAcc);
      ledgerAccounts.push(subAcc); // update local array
    }

    if (!finalAccountingCode || String(finalAccountingCode).trim() === '') {
      // Generate accounting code under subsidiary
      let maxAccSuffix = 0;
      ledgerAccounts.forEach(a => {
        if (a.parentId === subAcc.id && a.code && a.code.startsWith(subsidiaryCode)) {
          const s = Number(a.code.substring(subsidiaryCode.length));
          if (!isNaN(s) && s > maxAccSuffix) maxAccSuffix = s;
        }
      });
      finalAccountingCode = `${subsidiaryCode}${(maxAccSuffix + 1).toString().padStart(4, '0')}`;
    }

    // Always create a detailed ledger account for the person
    const newPersonLedger = {
      id: generateId(),
      code: finalAccountingCode,
      title: person.alias || person.name,
      type: 'detailed',
      nature: parentNature,
      parentId: subAcc.id
    };
    await addLedgerAccount(newPersonLedger);
  }

  const now = Date.now();
  const newPerson = { ...person, personCode: finalPersonCode, accountingCode: finalAccountingCode, id: generateId(), createdAt: now, updatedAt: now };
  persons.push(newPerson);
  await saveLocalData('persons', persons);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Person'.toUpperCase(), 'ثبت رکورد جدید در persons', 'Person', newPerson.id);
  }

  return newPerson;
};

export const updatePerson = async (id: string, person: any) => {
  const persons = await getLocalData<any[]>('persons', []);
  const index = persons.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    const oldPerson = persons[index];
    const updatedPerson = { ...oldPerson, ...person, updatedAt: Date.now() };

    // Ensure Ledger Account exists
    let finalAccountingCode = updatedPerson.accountingCode;
    const ledgerAccounts = await getLedgerAccounts();
    const roleId = updatedPerson.role;

    let parentCode = '12';
    let parentNature = 'debit';
    if (roleId === 'supplier') {
      parentCode = '21';
      parentNature = 'credit';
    } else if (roleId === 'employee') {
      parentCode = '21';
      parentNature = 'credit';
    }

    const parentGeneralAcc = ledgerAccounts.find(a => a.code === parentCode);
    
    if (parentGeneralAcc) {
      let subsidiaryCode = parentCode + '01';
      if (roleId === 'supplier') subsidiaryCode = '2101';
      else if (roleId === 'employee') subsidiaryCode = '2102';
      
      let subAcc = ledgerAccounts.find(a => a.code === subsidiaryCode);
      if (!subAcc) {
        const subAccTitle = roleId === 'supplier' ? 'تامین‌کنندگان' : (roleId === 'employee' ? 'کارکنان' : 'مشتریان');
        subAcc = { id: generateId(), code: subsidiaryCode, title: subAccTitle, type: 'subsidiary', nature: parentNature, parentId: parentGeneralAcc.id };
        await addLedgerAccount(subAcc);
        ledgerAccounts.push(subAcc);
      }

      if (!finalAccountingCode || String(finalAccountingCode).trim() === '') {
        let maxAccSuffix = 0;
        ledgerAccounts.forEach(a => {
          if (a.parentId === subAcc.id && a.code && a.code.startsWith(subsidiaryCode)) {
            const s = Number(a.code.substring(subsidiaryCode.length));
            if (!isNaN(s) && s > maxAccSuffix) maxAccSuffix = s;
          }
        });
        finalAccountingCode = `${subsidiaryCode}${(maxAccSuffix + 1).toString().padStart(4, '0')}`;
        updatedPerson.accountingCode = finalAccountingCode;

        const newPersonLedger = {
          id: generateId(),
          code: finalAccountingCode,
          title: updatedPerson.alias || updatedPerson.name,
          type: 'detailed',
          nature: parentNature,
          parentId: subAcc.id
        };
        await addLedgerAccount(newPersonLedger);
      } else {
        // If it exists, let's update title
        const existingAcc = ledgerAccounts.find(a => a.code === finalAccountingCode);
        if (existingAcc) {
           if (existingAcc.title !== (updatedPerson.alias || updatedPerson.name)) {
              await updateLedgerAccount(existingAcc.id, { ...existingAcc, title: updatedPerson.alias || updatedPerson.name });
           }
        }
      }
    }

    persons[index] = updatedPerson;
    await saveLocalData('persons', persons);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Person'.toUpperCase(), 'ویرایش رکورد در persons', 'Person', persons[index].id);
  }

    return persons[index];
  }
  return null;
};

export const deletePerson = async (id: string) => {
  const persons = await getLocalData<any[]>('persons', []);
  await saveLocalData('persons', persons.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Account'.toUpperCase(), 'ثبت رکورد جدید در accounts', 'Account', newAccount.id);
  }

  return newAccount;
};

export const updateAccount = async (id: string, account: any) => {
  const accounts = await getLocalData<any[]>('accounts', []);
  const index = accounts.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...account, updatedAt: Date.now() };
    await saveLocalData('accounts', accounts);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Account'.toUpperCase(), 'ویرایش رکورد در accounts', 'Account', accounts[index].id);
  }

    return accounts[index];
  }
  return null;
};

export const deleteAccount = async (id: string) => {
  const accounts = await getLocalData<any[]>('accounts', []);
  await saveLocalData('accounts', accounts.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Cashbox'.toUpperCase(), 'ثبت رکورد جدید در cashboxes', 'Cashbox', newCashbox.id);
  }

  return newCashbox;
};

export const updateCashbox = async (id: string, cashbox: any) => {
  const cashboxes = await getLocalData<any[]>('cashboxes', []);
  const index = cashboxes.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    cashboxes[index] = { ...cashboxes[index], ...cashbox, updatedAt: Date.now() };
    await saveLocalData('cashboxes', cashboxes);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Cashbox'.toUpperCase(), 'ویرایش رکورد در cashboxes', 'Cashbox', cashboxes[index].id);
  }

    return cashboxes[index];
  }
  return null;
};

export const deleteCashbox = async (id: string) => {
  const cashboxes = await getLocalData<any[]>('cashboxes', []);
  await saveLocalData('cashboxes', cashboxes.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Warehouse'.toUpperCase(), 'ثبت رکورد جدید در warehouses', 'Warehouse', newWarehouse.id);
  }

  return newWarehouse;
};

export const updateWarehouse = async (id: string, warehouse: any) => {
  const warehouses = await getLocalData<any[]>('warehouses', []);
  const index = warehouses.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    warehouses[index] = { ...warehouses[index], ...warehouse, updatedAt: Date.now() };
    await saveLocalData('warehouses', warehouses);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Warehouse'.toUpperCase(), 'ویرایش رکورد در warehouses', 'Warehouse', warehouses[index].id);
  }

    return warehouses[index];
  }
  return null;
};

export const deleteWarehouse = async (id: string) => {
  const warehouses = await getLocalData<any[]>('warehouses', []);
  await saveLocalData('warehouses', warehouses.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'ProductCategory'.toUpperCase(), 'ثبت رکورد جدید در product_categories', 'ProductCategory', newCategory.id);
  }

  return newCategory;
};

export const updateProductCategory = async (id: string, category: any) => {
  const categories = await getLocalData<any[]>('product_categories', []);
  const index = categories.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    categories[index] = { ...categories[index], ...category, updatedAt: Date.now() };
    await saveLocalData('product_categories', categories);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'ProductCategory'.toUpperCase(), 'ویرایش رکورد در product_categories', 'ProductCategory', categories[index].id);
  }

    return categories[index];
  }
  return null;
};

export const deleteProductCategory = async (id: string) => {
  const categories = await getLocalData<any[]>('product_categories', []);
  await saveLocalData('product_categories', categories.filter((p: any) => String(p.id) !== String(id)));
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
  
  // Check if there is specific configuration for Product Code in settings
  const settings = await getStoreSettings();
  if (settings && (settings as any).prefix_product !== undefined) {
    newCode = await generateDocNumber('product');
  }

  const newProduct = { ...product, code: newCode, id: generateId(), createdAt: now, updatedAt: now };
  newProduct.priceHistory = [];
  if (newProduct.price !== undefined || newProduct.purchasePrice !== undefined || newProduct.buyPrice !== undefined || newProduct.sellPrice !== undefined) {
      newProduct.priceHistory.push({
          date: new Date().toISOString(),
          buyPrice: Number(newProduct.purchasePrice || newProduct.buyPrice || 0),
          sellPrice: Number(newProduct.price || newProduct.sellPrice || 0)
      });
  }
  products.push(newProduct);
  await saveLocalData('products', products);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Product'.toUpperCase(), 'ثبت رکورد جدید در products', 'Product', newProduct.id);
  }

  return newProduct;
};

export const updateProduct = async (id: string, product: any) => {
  const products = await getLocalData<any[]>('products', []);
  const index = products.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    const oldProduct = products[index];
    const newProduct = { ...oldProduct, ...product, updatedAt: Date.now() };
    
    const newBuy = Number(newProduct.purchasePrice || newProduct.buyPrice || 0);
    const newSell = Number(newProduct.price || newProduct.sellPrice || 0);
    const oldBuy = Number(oldProduct.purchasePrice || oldProduct.buyPrice || 0);
    const oldSell = Number(oldProduct.price || oldProduct.sellPrice || 0);
    
    if (!newProduct.priceHistory) newProduct.priceHistory = [];
    if (newBuy !== oldBuy || newSell !== oldSell) {
       newProduct.priceHistory.push({
          date: new Date().toISOString(),
          buyPrice: newBuy,
          sellPrice: newSell
       });
    }

    products[index] = newProduct;
    await saveLocalData('products', products);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Product'.toUpperCase(), 'ویرایش رکورد در products', 'Product', products[index].id);
  }

    return products[index];
  }
  return null;
};

export const deleteProduct = async (id: string) => {
  const products = await getLocalData<any[]>('products', []);
  await saveLocalData('products', products.filter((p: any) => String(p.id) !== String(id)));
};

// Transactions
export const getTransactions = async () => {
  const transactions = await getLocalData<any[]>('transactions', []);
  return transactions.sort((a, b) => b.createdAt - a.createdAt);
};

export const addTransaction = async (transaction: any) => {
  const transactions = await getLocalData<any[]>('transactions', []);
  const now = Date.now();
  
  let finalTx = { ...transaction };
  if (!finalTx.receiptNumber) {
     const docTypeMap: any = { 'receive': 'receive_receipt', 'pay': 'pay_receipt', 'salary': 'salary' };
     if (docTypeMap[finalTx.type]) {
       finalTx.receiptNumber = await generateDocNumber(docTypeMap[finalTx.type]);
     }
  }

  const newTransaction = { ...finalTx, id: generateId(), createdAt: now, updatedAt: now };

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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Transaction'.toUpperCase(), 'ثبت رکورد جدید در accounts', 'Transaction', newTransaction.id);
  }

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

  // Auto-generate basic accounting document
  try {
     const docType = transaction.type === 'receive' ? 'receipt' : 'payment';
     const title = transaction.type === 'receive' ? 'رسید دریافت' : transaction.type === 'pay' ? 'رسید پرداخت' : transaction.type === 'salary' ? 'پرداخت حقوق' : 'تراکنش مالی';
     const items = [];
     const defaultLedgerIds = await getLocalData<any[]>('ledger_accounts', []);
     const defaultLedger = defaultLedgerIds.length > 0 ? defaultLedgerIds[0].id : '';
     if (transaction.type === 'receive') {
        items.push({ description: 'بدهکار - منابع', debit: Number(transaction.amount), credit: 0, ledgerAccountId: defaultLedger });
        items.push({ description: 'بستانکار - طرف حساب', debit: 0, credit: Number(transaction.amount), ledgerAccountId: defaultLedger, detailedAccountId: transaction.personId });
     } else {
        items.push({ description: 'بدهکار - طرف حساب', debit: Number(transaction.amount), credit: 0, ledgerAccountId: defaultLedger, detailedAccountId: transaction.personId });
        items.push({ description: 'بستانکار - منابع', debit: 0, credit: Number(transaction.amount), ledgerAccountId: defaultLedger });
     }
     await addAccountingDocument({
        date: new Date().toISOString().split('T')[0],
        description: `سند اتوماتیک ${title} به مبدا تراکنش ${newTransaction.id}`,
        status: 'approved',
        sourceType: docType,
        sourceId: newTransaction.id,
        items
     });
  } catch(e) {}

  return newTransaction;
};

export const updateTransaction = async (id: string | number, updated: any) => {
  const transactions = await getLocalData<any[]>('transactions', []);
  const idx = transactions.findIndex((t: any) => t.id.toString() === id.toString());
  if (idx !== -1) {
    transactions[idx] = { ...transactions[idx], ...updated, updatedAt: Date.now() };
    await saveLocalData('transactions', transactions);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Transaction'.toUpperCase(), 'ویرایش رکورد در transactions', 'Transaction', transactions[idx].id);
  }

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
  await saveLocalData('transactions', transactions.filter((p: any) => String(p.id) !== String(id)));
};

// Invoices
export const getInvoices = async () => {
  const invoices = await getLocalData<any[]>('invoices', []);
  return invoices.sort((a, b) => b.createdAt - a.createdAt);
};

export const addInvoice = async (invoice: any) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  const now = Date.now();
  
  // Apply auto-generated invoice number if missing
  let finalInvoiceObj = { ...invoice };
  if (!finalInvoiceObj.invoiceNumber || finalInvoiceObj.invoiceNumber.trim() === '') {
     finalInvoiceObj.invoiceNumber = await generateDocNumber(finalInvoiceObj.type);
  }

  const newInvoice = { ...finalInvoiceObj, id: generateId(), createdAt: now, updatedAt: now };
  invoices.push(newInvoice);
  await saveLocalData('invoices', invoices);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Invoice'.toUpperCase(), 'ثبت رکورد جدید در invoices', 'Invoice', newInvoice.id);
  }


  // Recalculate warehouse stocks automatically
  await recalculateAllWarehouseStocks();

  try {
     const docType = newInvoice.type;
     let title = 'فاکتور';
     if (docType === 'sale') title = 'فاکتور فروش';
     if (docType === 'purchase') title = 'فاکتور خرید';
     if (docType === 'sale_return') title = 'برگشت از فروش';
     if (docType === 'purchase_return') title = 'برگشت از خرید';
     
     const items = [];
     const defaultLedgerIds = await getLocalData<any[]>('ledger_accounts', []);
     const defaultLedger = defaultLedgerIds.length > 0 ? defaultLedgerIds[0].id : '';
     const total = Number(newInvoice.totalAmount) || 0;
     
     if (docType === 'sale' || docType === 'purchase_return') {
        items.push({ description: 'بدهکار - شخص', debit: total, credit: 0, ledgerAccountId: defaultLedger, detailedAccountId: newInvoice.customerId });
        items.push({ description: 'بستانکار - درآمد/موجودی', debit: 0, credit: total, ledgerAccountId: defaultLedger });
     } else if (docType === 'purchase' || docType === 'sale_return') {
        items.push({ description: 'بدهکار - موجودی/هزینه', debit: total, credit: 0, ledgerAccountId: defaultLedger });
        items.push({ description: 'بستانکار - شخص', debit: 0, credit: total, ledgerAccountId: defaultLedger, detailedAccountId: newInvoice.customerId });
     }
     
     if (items.length > 0) {
       await addAccountingDocument({
          date: new Date().toISOString().split('T')[0],
          description: `سند اتوماتیک ${title} شماره ${newInvoice.invoiceNumber || newInvoice.id}`,
          status: 'approved',
          sourceType: docType.includes('sale') ? 'invoice_sale' : 'invoice_purchase',
          sourceId: newInvoice.id,
          items
       });
     }
  } catch(e) {}

  return newInvoice;
};

export const updateInvoice = async (id: string | number, updated: any) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  const idx = invoices.findIndex((i: any) => i.id.toString() === id.toString());
  if (idx !== -1) {
    invoices[idx] = { ...invoices[idx], ...updated, updatedAt: Date.now() };
    await saveLocalData('invoices', invoices);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Invoice'.toUpperCase(), 'ویرایش رکورد در invoices', 'Invoice', invoices[idx].id);
  }

    await recalculateAllWarehouseStocks();
    return invoices[idx];
  }
  throw new Error('Invoice not found');
};

export const deleteInvoice = async (id: string) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  const invoiceToDelete = invoices.find((p: any) => String(p.id) === String(id) || p.id === Number(id) || p.id === String(id));
  
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Checkbook'.toUpperCase(), 'ثبت رکورد جدید در checkbooks', 'Checkbook', newItem.id);
  }

  return newItem;
};

export const updateCheckbook = async (id: string, record: any) => {
  const data = await getLocalData<any[]>('checkbooks', []);
  const index = data.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    data[index] = { ...data[index], ...record, updatedAt: Date.now() };
    await saveLocalData('checkbooks', data);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Checkbook'.toUpperCase(), 'ویرایش رکورد در checkbooks', 'Checkbook', data[index].id);
  }

    return data[index];
  }
  return null;
};

export const deleteCheckbook = async (id: string) => {
  const data = await getLocalData<any[]>('checkbooks', []);
  await saveLocalData('checkbooks', data.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'IssuedCheck'.toUpperCase(), 'ثبت رکورد جدید در issued_checks', 'IssuedCheck', newItem.id);
  }

  return newItem;
};

export const updateIssuedCheck = async (id: string, record: any) => {
  const data = await getLocalData<any[]>('issued_checks', []);
  const index = data.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    data[index] = { ...data[index], ...record, updatedAt: Date.now() };
    await saveLocalData('issued_checks', data);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'IssuedCheck'.toUpperCase(), 'ویرایش رکورد در issued_checks', 'IssuedCheck', data[index].id);
  }

    return data[index];
  }
  return null;
};

export const deleteIssuedCheck = async (id: string) => {
  const data = await getLocalData<any[]>('issued_checks', []);
  await saveLocalData('issued_checks', data.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'ReceivedCheck'.toUpperCase(), 'ثبت رکورد جدید در received_checks', 'ReceivedCheck', newItem.id);
  }

  return newItem;
};

export const updateReceivedCheck = async (id: string, record: any) => {
  const data = await getLocalData<any[]>('received_checks', []);
  const index = data.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    data[index] = { ...data[index], ...record, updatedAt: Date.now() };
    await saveLocalData('received_checks', data);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'ReceivedCheck'.toUpperCase(), 'ویرایش رکورد در received_checks', 'ReceivedCheck', data[index].id);
  }

    return data[index];
  }
  return null;
};

export const deleteReceivedCheck = async (id: string) => {
  const data = await getLocalData<any[]>('received_checks', []);
  await saveLocalData('received_checks', data.filter((p: any) => String(p.id) !== String(id)));
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
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'RefundRequest'.toUpperCase(), 'ثبت رکورد جدید در refundRequests', 'RefundRequest', newRequest.id);
  }

  return newRequest;
};

export const updateRefundRequest = async (id: string, updated: any) => {
  const requests = await getLocalData<any[]>('refundRequests', []);
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updated, updatedAt: Date.now() };
    await saveLocalData('refundRequests', requests);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'RefundRequest'.toUpperCase(), 'ویرایش رکورد در refundRequests', 'RefundRequest', requests[index].id);
  }

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


export const getStocktakings = async () => getLocalData<any[]>('stocktakings', []);
export const saveStocktakings = async (data: any[]) => saveLocalData('stocktakings', data);
export const addStocktaking = async (st: any) => {
  const stocktakings = await getStocktakings();
  const added = { ...st, id: generateId() };
  stocktakings.push(added);
  await saveStocktakings(stocktakings);
  return added;
};
export const updateStocktaking = async (id: string | number, updatedSt: any) => {
  const stocktakings = await getStocktakings();
  const idx = stocktakings.findIndex(s => s.id?.toString() === id?.toString());
  if (idx > -1) {
    stocktakings[idx] = updatedSt;
    await saveStocktakings(stocktakings);
    return updatedSt;
  }
  return null;
};
export const deleteStocktaking = async (id: string | number) => {
  const stocktakings = await getStocktakings();
  const newSts = stocktakings.filter(s => s.id?.toString() !== id?.toString());
  await saveStocktakings(newSts);
};

export const getLoans = async () => getLocalData<any[]>('loans', []);
export const saveLoans = async (roles: any[]) => saveLocalData('loans', roles);

export const getLedgerAccounts = async () => {
  let accs = await getLocalData<any[]>('ledger_accounts', []);
  if (accs.length === 0) {
    const assetsId = generateId();
    const liabilitiesId = generateId();
    const equityId = generateId();
    const incomeId = generateId();
    const expensesId = generateId();
    
    accs = [
      { id: assetsId, code: '1', title: 'دارایی‌ها', type: 'group', nature: 'debit', parentId: null },
      { id: liabilitiesId, code: '2', title: 'بدهی‌ها', type: 'group', nature: 'credit', parentId: null },
      { id: equityId, code: '3', title: 'حقوق صاحبان سهام', type: 'group', nature: 'credit', parentId: null },
      { id: incomeId, code: '4', title: 'درآمدها', type: 'group', nature: 'credit', parentId: null },
      { id: expensesId, code: '5', title: 'هزینه‌ها', type: 'group', nature: 'debit', parentId: null },
      
      { id: generateId(), code: '11', title: 'موجودی نقد و بانک', type: 'general', nature: 'debit', parentId: assetsId },
      { id: generateId(), code: '12', title: 'حساب‌ها و اسناد دریافتنی تجاری', type: 'general', nature: 'debit', parentId: assetsId },
      { id: generateId(), code: '13', title: 'موجودی مواد و کالا', type: 'general', nature: 'debit', parentId: assetsId },
      { id: generateId(), code: '14', title: 'پیش پرداخت‌ها', type: 'general', nature: 'debit', parentId: assetsId },
      { id: generateId(), code: '15', title: 'دارایی‌های ثابت', type: 'general', nature: 'debit', parentId: assetsId },
      
      { id: generateId(), code: '21', title: 'حساب‌ها و اسناد پرداختنی تجاری', type: 'general', nature: 'credit', parentId: liabilitiesId },
      { id: generateId(), code: '22', title: 'پیش دریافت‌ها', type: 'general', nature: 'credit', parentId: liabilitiesId },
      
      { id: generateId(), code: '31', title: 'سرمایه', type: 'general', nature: 'credit', parentId: equityId },
      
      { id: generateId(), code: '41', title: 'فروش کالا و خدمات', type: 'general', nature: 'credit', parentId: incomeId },
      
      { id: generateId(), code: '51', title: 'بهای تمام شده کالای فروش رفته', type: 'general', nature: 'debit', parentId: expensesId },
      { id: generateId(), code: '52', title: 'هزینه‌های حقوق و دستمزد', type: 'general', nature: 'debit', parentId: expensesId },
      { id: generateId(), code: '53', title: 'هزینه‌های اداری و تشکیلاتی', type: 'general', nature: 'debit', parentId: expensesId }
    ];
    await saveLocalData('ledger_accounts', accs);
  }
  return accs;
};
export const saveLedgerAccounts = async (data: any[]) => saveLocalData('ledger_accounts', data);
export const addLedgerAccount = async (la: any) => {
  const accs = await getLedgerAccounts();
  const added = { ...la, id: generateId() };
  accs.push(added);
  await saveLedgerAccounts(accs);
  return added;
};
export const updateLedgerAccount = async (id: string | number, updated: any) => {
  const accs = await getLedgerAccounts();
  const idx = accs.findIndex((x: any) => x.id?.toString() === id?.toString());
  if (idx > -1) {
    accs[idx] = updated;
    await saveLedgerAccounts(accs);
    return updated;
  }
  return null;
};
export const deleteLedgerAccount = async (id: string | number) => {
  const accs = await getLedgerAccounts();
  const newAccs = accs.filter((x: any) => x.id?.toString() !== id?.toString());
  await saveLedgerAccounts(newAccs);
};

export const getAccountingDocuments = async () => getLocalData<any[]>('accounting_documents', []);
export const saveAccountingDocuments = async (data: any[]) => saveLocalData('accounting_documents', data);
export const addAccountingDocument = async (doc: any) => {
  const docs = await getAccountingDocuments();
  // Generate a document number if not provided
  let docNum = doc.documentNumber;
  if (!docNum || String(docNum).trim() === '') {
     const settings = await getStoreSettings();
     if (settings && (settings as any).prefix_accounting_document !== undefined) {
         docNum = await generateDocNumber('accounting_document');
     } else {
         let maxDocNum = 0;
         docs.forEach((d: any) => { if (Number(d.documentNumber) > maxDocNum) maxDocNum = Number(d.documentNumber); });
         docNum = String(maxDocNum + 1).padStart(4, '0');
     }
  }
  const added = { ...doc, id: generateId(), documentNumber: docNum, createdAt: Date.now() };
  docs.push(added);
  await saveAccountingDocuments(docs);
  return added;
};
export const updateAccountingDocument = async (id: string | number, updated: any) => {
  const docs = await getAccountingDocuments();
  const idx = docs.findIndex((x: any) => x.id?.toString() === id?.toString());
  if (idx > -1) {
    docs[idx] = { ...updated, updatedAt: Date.now() };
    await saveAccountingDocuments(docs);
    return docs[idx];
  }
  return null;
};
export const deleteAccountingDocument = async (id: string | number) => {
  const docs = await getAccountingDocuments();
  const newDocs = docs.filter((x: any) => x.id?.toString() !== id?.toString());
  await saveAccountingDocuments(newDocs);
};

export const getInstallments = async () => getLocalData<any[]>('installments', []);
export const saveInstallments = async (groups: any[]) => saveLocalData('installments', groups);

export const getSystemLogs = async () => {
  const logs = await getLocalData('system_logs', []);
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

export const addSystemLog = async (action, details, entityType, entityId) => {
  const logs = await getLocalData('system_logs', []);
  
  // Try to get current user from localStorage if we're in browser
  let userId = 'system';
  if (typeof window !== 'undefined') {
     try {
       const sessionStr = window.localStorage.getItem('auth_session');
       if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.userId) userId = session.userId;
       }
     } catch(e) {}
  }
  
  const newLog = {
     id: generateId(),
     action,
     userId,
     details: typeof details === 'string' ? details : JSON.stringify(details),
     entityType,
     entityId,
     timestamp: Date.now()
  };
  
  logs.push(newLog);
  await saveLocalData('system_logs', logs);
  return newLog;
};
