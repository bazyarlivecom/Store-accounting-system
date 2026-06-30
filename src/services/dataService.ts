import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export interface CompanySettings {
  storeName: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  currency?: string;
  fontFamily?: string;
  theme?: string;
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

export const getDatabaseLogs = async () => {
  const logs = await getLocalData<any[]>('database_logs', []);
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

export const addDatabaseLog = async (action: string, entityType: string, entityId: string, oldData: any, newData: any) => {
  const logs = await getLocalData<any[]>('database_logs', []);
  
  let userId = 'system';
  if (typeof window !== 'undefined') {
     try {
       const sessionStr = window.localStorage.getItem('auth_user');
       if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.name) userId = session.name;
          else if (session.username) userId = session.username;
       }
     } catch(e) {}
  }

  const newLog = {
     id: generateId(),
     timestamp: Date.now(),
     action,
     entityType,
     entityId,
     userId,
     oldData: oldData ? JSON.stringify(oldData) : null,
     newData: newData ? JSON.stringify(newData) : null
  };

  logs.unshift(newLog); // Add to beginning
  if (logs.length > 2000) {
     logs.length = 2000;
  }
  
  // Directly save without recursive logging
  try {
    await fetch('/api/data/database_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logs)
    });
  } catch(e) {}
};

export const appendLocalData = async <T>(key: string, data: T): Promise<T> => {
  const res = await fetch(`/api/data/${key}/append`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Network response was not ok');
  const result = await res.json();
  return result.data;
};

export const batchLocalData = async (operations: any[]): Promise<any> => {
  const res = await fetch(`/api/data/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations })
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return await res.json();
};

export const updateLocalData = async <T>(key: string, id: string | number, data: T): Promise<T> => {
  const res = await fetch(`/api/data/${key}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Network response was not ok');
  const result = await res.json();
  return result.data;
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

export const parseToGregorianDate = (dateStr: string | number | Date, calendarType: string): Date | null => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  let checkDate = new Date(dateStr);
  if (!isNaN(checkDate.getTime())) {
    if (typeof dateStr === 'number' || calendarType === 'gregorian' || checkDate.getFullYear() > 1900) {
      return checkDate;
    }
  }

  try {
    const cleanStr = String(dateStr).replace(/\//g, '-');
    const jalaliDate = new DateObject({
      date: cleanStr,
      format: "YYYY-MM-DD",
      calendar: persian,
      locale: persian_fa
    });
    const d = jalaliDate.toDate();
    if (d && !isNaN(d.getTime())) {
      return d;
    }
  } catch (e) {
    // fallback
  }

  return isNaN(checkDate.getTime()) ? null : checkDate;
};

export const getFinancialYears = async () => {
  return getLocalData<any[]>('financial_years', []);
};

export const saveFinancialYears = async (years: any[]) => {
  await saveLocalData('financial_years', years);
};

export const getActiveFinancialYear = async () => {
  const years = await getFinancialYears();
  return years.find(y => y.status === 'open') || null;
};

export const addFinancialYear = async (year: any) => {
  const years = await getFinancialYears();
  const hasOpen = years.some(y => y.status === 'open');
  if (hasOpen) {
    throw new Error('تا زمانیکه یک سال مالی باز و فعال وجود دارد، نمی‌توان سال مالی جدیدی تعریف کرد.');
  }
  const now = Date.now();
  const newYear = {
    ...year,
    id: generateId(),
    status: 'open',
    createdAt: now,
    updatedAt: now
  };
  years.push(newYear);
  await saveFinancialYears(years);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_FINANCIAL_YEAR', `تعریف سال مالی جدید: ${newYear.name}`, 'FinancialYear', newYear.id);
  }
  return newYear;
};

export const closeFinancialYear = async (id: string | number) => {
  const years = await getFinancialYears();
  const idx = years.findIndex(y => String(y.id) === String(id));
  if (idx !== -1) {
    years[idx].status = 'closed';
    years[idx].updatedAt = Date.now();
    await saveFinancialYears(years);
    
    if (typeof addSystemLog !== 'undefined') {
      await addSystemLog('CLOSE_FINANCIAL_YEAR', `بستن سال مالی: ${years[idx].name}`, 'FinancialYear', id);
    }
    return years[idx];
  }
  return null;
};

export const checkFinancialYear = async (dateStr: string | number) => {
  if (!dateStr) return;
  const activeYear = await getActiveFinancialYear();
  if (!activeYear) {
    throw new Error("هیچ سال مالی فعال و بازی در سیستم وجود ندارد. ابتدا یک سال مالی باز ایجاد کنید.");
  }
  
  const settings = await getStoreSettings() as any;
  const calendarType = settings?.calendarType || 'jalali';
  
  const checkDate = parseToGregorianDate(dateStr, calendarType);
  if (!checkDate) return;
  
  checkDate.setHours(0,0,0,0);
  
  const startDate = parseToGregorianDate(activeYear.startDate, calendarType);
  const endDate = parseToGregorianDate(activeYear.endDate, calendarType);
  
  if (startDate) {
    startDate.setHours(0,0,0,0);
    if (checkDate < startDate) {
      throw new Error(`تاریخ وارد شده (${dateStr}) قبل از شروع سال مالی فعال (${activeYear.startDate}) است.`);
    }
  }
  
  if (endDate) {
    endDate.setHours(23,59,59,999);
    if (checkDate > endDate) {
      throw new Error(`تاریخ وارد شده (${dateStr}) بعد از پایان سال مالی فعال (${activeYear.endDate}) است.`);
    }
  }
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
  return persons.filter(p => !p.isDeleted).sort((a, b) => b.createdAt - a.createdAt);
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
  let parentCode = '12';
  let parentNature = 'debit';
  let subsidiaryCode = '1201';
  let subAccTitle = 'مشتریان';
  if (roleId === 'supplier') {
    parentCode = '21';
    parentNature = 'credit';
    subsidiaryCode = '2101';
    subAccTitle = 'تامین‌کنندگان';
  } else if (roleId === 'employee') {
    parentCode = '21';
    parentNature = 'credit';
    subsidiaryCode = '2102';
    subAccTitle = 'کارکنان';
  }
  
  let finalAccountingCode = await ensureLedgerAccount(
    person,
    parentCode,
    subsidiaryCode,
    subAccTitle,
    person.alias || person.name,
    parentNature
  );

  const now = Date.now();
  const newPerson = { ...person, personCode: finalPersonCode, accountingCode: finalAccountingCode, id: generateId(), createdAt: now, updatedAt: now };
  await appendLocalData('persons', newPerson);
  
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
    let parentCode = '12';
    let parentNature = 'debit';
    const roleId = updatedPerson.role;
    let subsidiaryCode = '1201';
    let subAccTitle = 'مشتریان';
    if (roleId === 'supplier') {
      parentCode = '21';
      parentNature = 'credit';
      subsidiaryCode = '2101';
      subAccTitle = 'تامین‌کنندگان';
    } else if (roleId === 'employee') {
      parentCode = '21';
      parentNature = 'credit';
      subsidiaryCode = '2102';
      subAccTitle = 'کارکنان';
    }
    
    let finalAccountingCode = await ensureLedgerAccount(
      updatedPerson,
      parentCode,
      subsidiaryCode,
      subAccTitle,
      updatedPerson.alias || updatedPerson.name,
      parentNature
    );
    updatedPerson.accountingCode = finalAccountingCode;

    await updateLocalData('persons', id, updatedPerson);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Person'.toUpperCase(), 'ویرایش رکورد در persons', 'Person', id);
  }

    return updatedPerson;
  }
  return null;
};

export const deletePerson = async (id: string) => {
  // Check relations
  const invoices = await getInvoices();
  if (invoices.some(inv => String(inv.customerId) === String(id))) {
    throw new Error('این شخص دارای فاکتور ثبت شده است و قابل حذف نیست.');
  }
  const transactions = await getTransactions();
  if (transactions.some(t => String(t.personId) === String(id))) {
    throw new Error('این شخص دارای سند دریافت/پرداخت است و قابل حذف نیست.');
  }
  const issuedChecks = await getIssuedChecks();
  if (issuedChecks.some(c => String(c.payeeId) === String(id))) {
    throw new Error('این شخص دارای چک پرداختی است و قابل حذف نیست.');
  }
  const receivedChecks = await getReceivedChecks();
  if (receivedChecks.some(c => String(c.payerId) === String(id))) {
    throw new Error('این شخص دارای چک دریافتی است و قابل حذف نیست.');
  }

  const persons = await getLocalData<any[]>('persons', []);
  // Instead of physical delete, maybe just soft delete if needed, but user says "هیچ چیز به صورت فیزیکی حذف نشود".
  // Actually, we can do soft delete by setting isDeleted = true. Or just keep it as is if there are no relations, we can physically delete it, since it has no relations. The user says "هیچ چیز به صورت فیزیکی حذف نشود". So let's soft delete.
  const index = persons.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    persons[index].isDeleted = true;
    await updateLocalData('persons', id, persons[index]);
  }
};

// Accounts
export const ensureLedgerAccount = async (
  entity: any,
  parentCode: string,
  subsidiaryCode: string,
  subsidiaryTitle: string,
  entityTitle: string,
  nature: string
) => {
  let finalAccountingCode = entity.accountingCode;
  const ledgerAccounts = await getLedgerAccounts();
  
  const parentGeneralAcc = ledgerAccounts.find(a => a.code === parentCode);
  if (!parentGeneralAcc) return finalAccountingCode;

  let subAcc = ledgerAccounts.find(a => a.code === subsidiaryCode);
  if (!subAcc) {
    subAcc = { id: generateId(), code: subsidiaryCode, title: subsidiaryTitle, type: 'subsidiary', nature, parentId: parentGeneralAcc.id };
    await addLedgerAccount(subAcc);
    ledgerAccounts.push(subAcc);
  }

  if (!finalAccountingCode || String(finalAccountingCode).trim() === '') {
    let maxAccSuffix = 0;
    ledgerAccounts.forEach(a => {
      if (a.code && a.code.startsWith(subsidiaryCode) && a.code.length > subsidiaryCode.length) {
        const s = Number(a.code.substring(subsidiaryCode.length));
        if (!isNaN(s) && s > maxAccSuffix) maxAccSuffix = s;
      }
    });
    finalAccountingCode = `${subsidiaryCode}${(maxAccSuffix + 1).toString().padStart(4, '0')}`;
    
    const newEntityLedger = {
      id: generateId(),
      code: finalAccountingCode,
      title: entityTitle,
      type: 'detailed',
      nature,
      parentId: subAcc.id
    };
    await addLedgerAccount(newEntityLedger);
  } else {
    const existingAcc = ledgerAccounts.find(a => a.code === finalAccountingCode);
    if (existingAcc && existingAcc.title !== entityTitle) {
      await updateLedgerAccount(existingAcc.id, { ...existingAcc, title: entityTitle });
    }
  }

  return finalAccountingCode;
};

export const getAccounts = async () => {
  const accounts = await getLocalData<any[]>('accounts', []);
  let modified = false;
  for (let i = 0; i < accounts.length; i++) {
    if (!accounts[i].accountingCode || String(accounts[i].accountingCode).trim() === '') {
      accounts[i].accountingCode = await ensureLedgerAccount(
        accounts[i],
        '11',
        '1102',
        'بانک‌ها',
        accounts[i].bankName + ' - ' + (accounts[i].branchName || ''),
        'debit'
      );
      modified = true;
    }
  }
  if (modified) {
    await saveLocalData('accounts', accounts);
  }
  return accounts.sort((a, b) => b.createdAt - a.createdAt);
};

export const addAccount = async (account: any) => {
  const accounts = await getLocalData<any[]>('accounts', []);
  const now = Date.now();
  let finalAccountingCode = await ensureLedgerAccount(account, '11', '1102', 'بانک‌ها', account.bankName + ' - ' + (account.branchName || ''), 'debit');
  const newAccount = { ...account, accountingCode: finalAccountingCode, id: generateId(), createdAt: now, updatedAt: now };
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
    const oldAccount = accounts[index];
    const mergedAccount = { ...oldAccount, ...account };
    let finalAccountingCode = await ensureLedgerAccount(mergedAccount, '11', '1102', 'بانک‌ها', mergedAccount.bankName + ' - ' + (mergedAccount.branchName || ''), 'debit');
    accounts[index] = { ...mergedAccount, accountingCode: finalAccountingCode, updatedAt: Date.now() };
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
  let modified = false;
  for (let i = 0; i < cashboxes.length; i++) {
    if (!cashboxes[i].accountingCode || String(cashboxes[i].accountingCode).trim() === '') {
      cashboxes[i].accountingCode = await ensureLedgerAccount(
        cashboxes[i],
        '11',
        '1101',
        'صندوق‌ها',
        cashboxes[i].name,
        'debit'
      );
      modified = true;
    }
  }
  if (modified) {
    await saveLocalData('cashboxes', cashboxes);
  }
  return cashboxes.sort((a, b) => b.createdAt - a.createdAt);
};

export const addCashbox = async (cashbox: any) => {
  const cashboxes = await getLocalData<any[]>('cashboxes', []);
  const now = Date.now();
  let finalAccountingCode = await ensureLedgerAccount(cashbox, '11', '1101', 'صندوق‌ها', cashbox.name, 'debit');
  const newCashbox = { ...cashbox, accountingCode: finalAccountingCode, id: generateId(), createdAt: now, updatedAt: now };
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
    const oldCashbox = cashboxes[index];
    const mergedCashbox = { ...oldCashbox, ...cashbox };
    let finalAccountingCode = await ensureLedgerAccount(mergedCashbox, '11', '1101', 'صندوق‌ها', mergedCashbox.name, 'debit');
    cashboxes[index] = { ...mergedCashbox, accountingCode: finalAccountingCode, updatedAt: Date.now() };
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
  return warehouses.filter(w => !w.isDeleted).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
  const invoices = await getInvoices();
  if (invoices.some(inv => String(inv.warehouseId) === String(id))) {
     throw new Error('این انبار در اسناد یا فاکتورها استفاده شده است و قابل حذف نیست.');
  }
  const warehouses = await getLocalData<any[]>('warehouses', []);
  const index = warehouses.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    warehouses[index].isDeleted = true;
    await saveLocalData('warehouses', warehouses);
  }
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
  return products.filter(p => !p.isDeleted).sort((a, b) => b.createdAt - a.createdAt);
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
  
  await appendLocalData('products', newProduct);
  
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

    const updated = await updateLocalData('products', id, newProduct);
  
    if (typeof addSystemLog !== 'undefined') {
      await addSystemLog('UPDATE_' + 'Product'.toUpperCase(), 'ویرایش رکورد در products', 'Product', updated.id);
    }

    return updated;
  }
  return null;
};

export const deleteProduct = async (id: string) => {
  const invoices = await getInvoices();
  if (invoices.some(inv => inv.items && inv.items.some((item: any) => String(item.productId) === String(id)))) {
     throw new Error('این کالا در فاکتور استفاده شده است و قابل حذف نیست.');
  }
  const products = await getLocalData<any[]>('products', []);
  const index = products.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    products[index].isDeleted = true;
    await saveLocalData('products', products);
  }
};

// Transactions
export const getTransactions = async () => {
  const transactions = await getLocalData<any[]>('transactions', []);
  return transactions.filter(t => !t.isDeleted).sort((a, b) => b.createdAt - a.createdAt);
};

export const addTransaction = async (transaction: any) => {
  if (transaction.date) await checkFinancialYear(transaction.date);
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
        await updateLocalData('accounts', accounts[index].id, accounts[index]);
  
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
        await updateLocalData('cashboxes', cashboxes[index].id, cashboxes[index]);
      }
    }
  }

  await appendLocalData('transactions', newTransaction);

  // Auto-generate basic accounting document
  try {
     const docType = transaction.type === 'receive' ? 'receipt' : 'payment';
     const title = transaction.type === 'receive' ? 'رسید دریافت' : transaction.type === 'pay' ? 'رسید پرداخت' : transaction.type === 'salary' ? 'پرداخت حقوق' : 'تراکنش مالی';
     const items = [];
     const ledgerAccounts = await getLedgerAccounts();
     const defaultLedger = ledgerAccounts.length > 0 ? ledgerAccounts[0].id : '';

     // Find Person Ledger Account
     let personLedgerId = defaultLedger;
     if (transaction.personId) {
        const persons = await getLocalData<any[]>('persons', []);
        const person = persons.find(p => String(p.id) === String(transaction.personId));
        if (person && person.accountingCode) {
           const acc = ledgerAccounts.find(a => a.code === person.accountingCode);
           if (acc) personLedgerId = acc.id;
        }
     }

     // Find Bank/Cashbox Resource Ledger Account
     let resourceLedgerId = defaultLedger;
     const resType = transaction.resourceType || (transaction.accountId ? 'bank' : transaction.cashboxId ? 'cashbox' : '');
     const resId = transaction.resourceId || transaction.accountId || transaction.cashboxId;

     if (resType === 'bank' && resId) {
        const accountsList = await getLocalData<any[]>('accounts', []);
        const account = accountsList.find(a => String(a.id) === String(resId));
        if (account && account.accountingCode) {
           const acc = ledgerAccounts.find(a => a.code === account.accountingCode);
           if (acc) resourceLedgerId = acc.id;
        } else {
           const acc = ledgerAccounts.find(a => a.code === '1102');
           if (acc) resourceLedgerId = acc.id;
        }
     } else if (resType === 'cashbox' && resId) {
        const cashboxesList = await getLocalData<any[]>('cashboxes', []);
        const cashbox = cashboxesList.find(c => String(c.id) === String(resId));
        if (cashbox && cashbox.accountingCode) {
           const acc = ledgerAccounts.find(a => a.code === cashbox.accountingCode);
           if (acc) resourceLedgerId = acc.id;
        } else {
           const acc = ledgerAccounts.find(a => a.code === '1101');
           if (acc) resourceLedgerId = acc.id;
        }
     } else {
        const acc = ledgerAccounts.find(a => a.code === '11');
        if (acc) resourceLedgerId = acc.id;
     }

     if (transaction.type === 'receive') {
        items.push({ description: 'بدهکار - منابع', debit: Number(transaction.amount), credit: 0, ledgerAccountId: resourceLedgerId });
        items.push({ description: 'بستانکار - طرف حساب', debit: 0, credit: Number(transaction.amount), ledgerAccountId: personLedgerId, detailedAccountId: transaction.personId });
     } else {
        items.push({ description: 'بدهکار - طرف حساب', debit: Number(transaction.amount), credit: 0, ledgerAccountId: personLedgerId, detailedAccountId: transaction.personId });
        items.push({ description: 'بستانکار - منابع', debit: 0, credit: Number(transaction.amount), ledgerAccountId: resourceLedgerId });
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
  if (updated.date) await checkFinancialYear(updated.date);
  const updatedData = { ...updated, updatedAt: Date.now() };
  try {
     const newTx = await updateLocalData('transactions', id, updatedData);
     if (typeof addSystemLog !== 'undefined') {
       await addSystemLog('UPDATE_' + 'Transaction'.toUpperCase(), 'ویرایش رکورد در transactions', 'Transaction', newTx.id);
     }
     return newTx;
  } catch (e) {
     throw new Error('Transaction not found');
  }
};

export const deleteTransaction = async (id: string) => {
  const transactions = await getLocalData<any[]>('transactions', []);
  const t = transactions.find(tx => String(tx.id) === String(id));
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
        await updateLocalData('accounts', accounts[index].id, accounts[index]);
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
        await updateLocalData('cashboxes', cashboxes[index].id, cashboxes[index]);
      }
    }
    const index = transactions.findIndex((p: any) => String(p.id) === String(id));
    if (index !== -1) {
      transactions[index].isDeleted = true;
      await updateLocalData('transactions', id, transactions[index]);
    }
  }
};

// Invoices
export const getInvoices = async () => {
  const invoices = await getLocalData<any[]>('invoices', []);
  return invoices.filter(inv => !inv.isDeleted).sort((a, b) => b.createdAt - a.createdAt);
};

export const addInvoice = async (invoice: any, skipRecalc: boolean = false) => {
  if (invoice.date) await checkFinancialYear(invoice.date);
  const now = Date.now();
  
  // Apply auto-generated invoice number if missing
  let finalInvoiceObj = { ...invoice };
  if (!finalInvoiceObj.invoiceNumber || finalInvoiceObj.invoiceNumber.trim() === '') {
     finalInvoiceObj.invoiceNumber = await generateDocNumber(finalInvoiceObj.type);
  }

  const newInvoice = { ...finalInvoiceObj, id: generateId(), createdAt: now, updatedAt: now };
  await appendLocalData('invoices', newInvoice);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'Invoice'.toUpperCase(), 'ثبت رکورد جدید در invoices', 'Invoice', newInvoice.id);
  }

  // Recalculate warehouse stocks automatically
  if (!skipRecalc) {
    await recalculateAllWarehouseStocks();
  }

  if (newInvoice.isDraft || newInvoice.status === 'draft') {
    return newInvoice;
  }

  try {
     const docType = newInvoice.type;
     let title = 'فاکتور';
     if (docType === 'sale') title = 'فاکتور فروش';
     if (docType === 'purchase') title = 'فاکتور خرید';
     if (docType === 'sale_return') title = 'برگشت از فروش';
     if (docType === 'purchase_return') title = 'برگشت از خرید';
     
     const items = [];
     const ledgerAccounts = await getLedgerAccounts();
     const defaultLedger = ledgerAccounts.length > 0 ? ledgerAccounts[0].id : '';
     const total = Number(newInvoice.totalAmount) || 0;

     // Find Customer/Supplier/Person Ledger Account
     let personLedgerId = defaultLedger;
     if (newInvoice.customerId) {
        const persons = await getLocalData<any[]>('persons', []);
        const person = persons.find(p => String(p.id) === String(newInvoice.customerId));
        if (person && person.accountingCode) {
           const acc = ledgerAccounts.find(a => a.code === person.accountingCode);
           if (acc) personLedgerId = acc.id;
        }
     }

     // Find Sales Revenue ('41') Ledger Account
     let salesLedgerId = defaultLedger;
     const salesAcc = ledgerAccounts.find(a => a.code === '41');
     if (salesAcc) salesLedgerId = salesAcc.id;

     // Find Inventory ('13') Ledger Account
     let inventoryLedgerId = defaultLedger;
     const inventoryAcc = ledgerAccounts.find(a => a.code === '13');
     if (inventoryAcc) inventoryLedgerId = inventoryAcc.id;
     
     if (docType === 'sale' || docType === 'purchase_return') {
        items.push({ description: 'بدهکار - شخص', debit: total, credit: 0, ledgerAccountId: personLedgerId, detailedAccountId: newInvoice.customerId });
        items.push({ description: 'بستانکار - درآمد/فروش', debit: 0, credit: total, ledgerAccountId: salesLedgerId });
     } else if (docType === 'purchase' || docType === 'sale_return') {
        items.push({ description: 'بدهکار - موجودی کالا', debit: total, credit: 0, ledgerAccountId: inventoryLedgerId });
        items.push({ description: 'بستانکار - شخص', debit: 0, credit: total, ledgerAccountId: personLedgerId, detailedAccountId: newInvoice.customerId });
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

export const updateInvoice = async (id: string | number, updated: any, skipRecalc: boolean = false) => {
  if (updated.date) await checkFinancialYear(updated.date);
  
  const updatedData = { ...updated, updatedAt: Date.now() };
  const newInvoice = await updateLocalData('invoices', id, updatedData);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('UPDATE_' + 'Invoice'.toUpperCase(), 'ویرایش رکورد در invoices', 'Invoice', newInvoice.id);
  }

  if (!skipRecalc) {
    await recalculateAllWarehouseStocks();
  }
  return newInvoice;
};

export const voidInvoice = async (id: string | number) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  const invoiceToVoid = invoices.find((p: any) => String(p.id) === String(id) || p.id === Number(id));
  
  if (invoiceToVoid) {
    const toVoidIds = new Set([id, Number(id), String(id)]);
    
    invoices.forEach(inv => {
       if (inv.isAutoGenerated && inv.sourceInvoiceId && (inv.sourceInvoiceId === invoiceToVoid.id || inv.sourceInvoiceId === invoiceToVoid.invoiceNumber)) {
          toVoidIds.add(inv.id);
          toVoidIds.add(String(inv.id));
       }
    });

    invoices.forEach(inv => {
      if (toVoidIds.has(inv.id) || toVoidIds.has(String(inv.id))) {
        inv.status = 'voided';
      }
    });
    await saveLocalData('invoices', invoices);

    // void related accounting docs
    const accDocs = await getLocalData<any[]>('accounting_documents', []);
    let accDocsChanged = false;
    accDocs.forEach(d => {
       if (toVoidIds.has(d.sourceId) || toVoidIds.has(String(d.sourceId))) {
          d.status = 'voided';
          d.isDeleted = true; // also delete so it doesn't affect ledger
          accDocsChanged = true;
       }
    });
    if (accDocsChanged) await saveLocalData('accounting_documents', accDocs);

    await recalculateAllWarehouseStocks();
  }
};

export const deleteInvoice = async (id: string, forceDelete: boolean = false, skipRecalc: boolean = false) => {
  const invoices = await getLocalData<any[]>('invoices', []);
  const invoiceToDelete = invoices.find((p: any) => String(p.id) === String(id) || p.id === Number(id) || p.id === String(id));
  
  if (invoiceToDelete) {
    if (invoiceToDelete.status !== 'draft' && !invoiceToDelete.isDraft && !forceDelete) {
      throw new Error('این فاکتور تایید شده است و قابلیت حذف ندارد. می‌توانید آن را ابطال یا مرجوع کنید.');
    }
    const toDeleteIds = new Set([id, Number(id), String(id)]);
    
    invoices.forEach(inv => {
       if (inv.isAutoGenerated && inv.sourceInvoiceId && (inv.sourceInvoiceId === invoiceToDelete.id || inv.sourceInvoiceId === invoiceToDelete.invoiceNumber)) {
          toDeleteIds.add(inv.id);
          toDeleteIds.add(String(inv.id));
       }
    });

    const operations: any[] = [];
    
    // Soft delete
    invoices.forEach(inv => {
      if (toDeleteIds.has(inv.id) || toDeleteIds.has(String(inv.id))) {
        operations.push({ type: 'delete', key: 'invoices', id: inv.id });
      }
    });
    
    // delete related accounting docs
    const accDocs = await getLocalData<any[]>('accounting_documents', []);
    accDocs.forEach(d => {
       if (toDeleteIds.has(d.sourceId) || toDeleteIds.has(String(d.sourceId))) {
          operations.push({ type: 'delete', key: 'accounting_documents', id: d.id });
       }
    });

    if (operations.length > 0) {
      await batchLocalData(operations);
    }

    if (typeof addSystemLog !== 'undefined') {
       // addSystemLog is no-op, backend handles log for batch
    }

    // Recalculate warehouse stocks automatically
    if (!skipRecalc) {
      await recalculateAllWarehouseStocks();
    }
  }
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
  if (record.issueDate) await checkFinancialYear(record.issueDate);
  const now = Date.now();
  const newItem = { ...record, id: generateId(), createdAt: now, updatedAt: now };
  await appendLocalData('issued_checks', newItem);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'IssuedCheck'.toUpperCase(), 'ثبت رکورد جدید در issued_checks', 'IssuedCheck', newItem.id);
  }

  return newItem;
};

export const updateIssuedCheck = async (id: string, record: any) => {
  if (record.issueDate) await checkFinancialYear(record.issueDate);
  const updatedData = { ...record, updatedAt: Date.now() };
  try {
     const saved = await updateLocalData('issued_checks', id, updatedData);
     if (typeof addSystemLog !== 'undefined') {
       await addSystemLog('UPDATE_' + 'IssuedCheck'.toUpperCase(), 'ویرایش رکورد در issued_checks', 'IssuedCheck', saved.id);
     }
     return saved;
  } catch (e) {
     return null;
  }
};

export const deleteIssuedCheck = async (id: string) => {
  const data = await getLocalData<any[]>('issued_checks', []);
  const index = data.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    await updateLocalData('issued_checks', id, { ...data[index], isDeleted: true });
  }
};

// Received Checks
export const getReceivedChecks = async () => {
  const data = await getLocalData<any[]>('received_checks', []);
  return data.sort((a, b) => b.createdAt - a.createdAt);
};

export const addReceivedCheck = async (record: any) => {
  if (record.issueDate) await checkFinancialYear(record.issueDate);
  const now = Date.now();
  const newItem = { ...record, id: generateId(), createdAt: now, updatedAt: now };
  await appendLocalData('received_checks', newItem);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'ReceivedCheck'.toUpperCase(), 'ثبت رکورد جدید در received_checks', 'ReceivedCheck', newItem.id);
  }

  return newItem;
};

export const updateReceivedCheck = async (id: string, record: any) => {
  if (record.issueDate) await checkFinancialYear(record.issueDate);
  const updatedData = { ...record, updatedAt: Date.now() };
  try {
     const saved = await updateLocalData('received_checks', id, updatedData);
     if (typeof addSystemLog !== 'undefined') {
       await addSystemLog('UPDATE_' + 'ReceivedCheck'.toUpperCase(), 'ویرایش رکورد در received_checks', 'ReceivedCheck', saved.id);
     }
     return saved;
  } catch (e) {
     return null;
  }
};

export const deleteReceivedCheck = async (id: string) => {
  const data = await getLocalData<any[]>('received_checks', []);
  const index = data.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    await updateLocalData('received_checks', id, { ...data[index], isDeleted: true });
  }
};

// Warehouse Stocks Persistence & Recalculation
export const getRefundRequests = async () => {
  return await getLocalData<any[]>('refundRequests', []);
};

export const addRefundRequest = async (request: any) => {
  const now = Date.now();
  const newRequest = { ...request, id: generateId(), createdAt: now, updatedAt: now };
  await appendLocalData('refundRequests', newRequest);
  
  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_' + 'RefundRequest'.toUpperCase(), 'ثبت رکورد جدید در refundRequests', 'RefundRequest', newRequest.id);
  }

  return newRequest;
};

export const updateRefundRequest = async (id: string, updated: any) => {
  const updatedData = { ...updated, updatedAt: Date.now() };
  try {
     const saved = await updateLocalData('refundRequests', id, updatedData);
     if (typeof addSystemLog !== 'undefined') {
       await addSystemLog('UPDATE_' + 'RefundRequest'.toUpperCase(), 'ویرایش رکورد در refundRequests', 'RefundRequest', saved.id);
     }
     return saved;
  } catch(e) {
     return null;
  }
};

export const deleteRefundRequest = async (id: string) => {
  const requests = await getLocalData<any[]>('refundRequests', []);
  const index = requests.findIndex(r => String(r.id) === String(id));
  if (index !== -1) {
    await updateLocalData('refundRequests', id, { ...requests[index], isDeleted: true });
  }
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
  try {
    const res = await fetch('/api/db/recalculate-stocks', { method: 'POST' });
    if (res.ok) {
      const result = await res.json();
      return result.data;
    }
  } catch(e) {
    console.error('Error recalculating stocks', e);
  }
  return [];
};


export const getStocktakings = async () => getLocalData<any[]>('stocktakings', []);
export const saveStocktakings = async (data: any[]) => saveLocalData('stocktakings', data);
export const addStocktaking = async (st: any) => {
  if (st.date) await checkFinancialYear(st.date);
  const stocktakings = await getStocktakings();
  const added = { ...st, id: generateId() };
  stocktakings.push(added);
  await saveStocktakings(stocktakings);
  return added;
};
export const updateStocktaking = async (id: string | number, updatedSt: any) => {
  if (updatedSt.date) await checkFinancialYear(updatedSt.date);
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

// --- Follow Ups (CRM) ---
export const getPersonFollowUps = async () => {
  const followUps = await getLocalData<any[]>('person_follow_ups', []);
  return followUps.sort((a, b) => b.createdAt - a.createdAt);
};

export const addPersonFollowUp = async (followUp: any) => {
  const followUps = await getPersonFollowUps();
  const newFollowUp = { ...followUp, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() };
  followUps.push(newFollowUp);
  await saveLocalData('person_follow_ups', followUps);
  return newFollowUp;
};

export const updatePersonFollowUp = async (id: string | number, followUp: any) => {
  const followUps = await getPersonFollowUps();
  const index = followUps.findIndex((p: any) => String(p.id) === String(id));
  if (index !== -1) {
    followUps[index] = { ...followUps[index], ...followUp, updatedAt: Date.now() };
    await saveLocalData('person_follow_ups', followUps);
  }
};

export const deletePersonFollowUp = async (id: string | number) => {
  const followUps = await getPersonFollowUps();
  await saveLocalData('person_follow_ups', followUps.filter((p: any) => String(p.id) !== String(id)));
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
  const added = { ...la, id: la.id || generateId() };
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

export const getAccountingDocuments = async () => {
  const docs = await getLocalData<any[]>('accounting_documents', []);
  return docs.filter(d => !d.isDeleted);
};
export const saveAccountingDocuments = async (data: any[]) => saveLocalData('accounting_documents', data);
export const addAccountingDocument = async (doc: any) => {
  if (doc.date) await checkFinancialYear(doc.date);
  
  // Generate a document number if not provided
  let docNum = doc.documentNumber;
  if (!docNum || String(docNum).trim() === '') {
     const settings = await getStoreSettings();
     if (settings && (settings as any).prefix_accounting_document !== undefined) {
         docNum = await generateDocNumber('accounting_document');
     } else {
         const docs = await getAccountingDocuments();
         let maxDocNum = 0;
         docs.forEach((d: any) => { if (Number(d.documentNumber) > maxDocNum) maxDocNum = Number(d.documentNumber); });
         docNum = String(maxDocNum + 1).padStart(4, '0');
     }
  }
  const added = { ...doc, id: generateId(), documentNumber: docNum, createdAt: Date.now() };
  await appendLocalData('accounting_documents', added);
  return added;
};
export const updateAccountingDocument = async (id: string | number, updated: any) => {
  if (updated.date) await checkFinancialYear(updated.date);
  const updatedDoc = { ...updated, updatedAt: Date.now() };
  try {
     const saved = await updateLocalData('accounting_documents', id, updatedDoc);
     return saved;
  } catch (e) {
     return null;
  }
};
export const deleteAccountingDocument = async (id: string | number) => {
  const docs = await getAccountingDocuments();
  const index = docs.findIndex((x: any) => x.id?.toString() === id?.toString());
  if (index !== -1) {
    if (docs[index].isAutoGenerated) {
       throw new Error('اسناد اتوماتیک قابل حذف دستی نیستند.');
    }
    await updateLocalData('accounting_documents', id, { ...docs[index], isDeleted: true });
  }
};

export const getInstallments = async () => getLocalData<any[]>('installments', []);
export const saveInstallments = async (groups: any[]) => saveLocalData('installments', groups);

export const getSystemLogs = async () => {
  const logs = await getLocalData('system_logs', []);
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

export const addSystemLog = async (action, details, entityType, entityId) => {
  // Backend automatically handles system_logs on POST /api/data/:key
  // We make this a no-op to prevent huge performance overhead and duplicate logs
  return { id: generateId(), action, userId: 'system', details, entityType, entityId, timestamp: Date.now() };
};

// --- SMS Messages ---
export const getSmsMessages = async (): Promise<any[]> => {
  return await getLocalData('sms_messages', []);
};

export const addSmsMessage = async (message: any): Promise<void> => {
  const messages = await getSmsMessages();
  messages.push(message);
  await saveLocalData('sms_messages', messages);
};

export const deleteSmsMessage = async (id: string): Promise<void> => {
  const messages = await getSmsMessages();
  await saveLocalData('sms_messages', messages.filter(m => m.id !== id));
};

// --- Persons Opening Balances ---
export const getPersonOpeningBalances = async () => {
  const balances = await getLocalData<any[]>('person_opening_balances', []);
  return balances.sort((a, b) => b.createdAt - a.createdAt);
};

export const addPersonOpeningBalance = async (balanceDoc: any) => {
  const balances = await getLocalData<any[]>('person_opening_balances', []);
  const now = Date.now();
  const newBalance = { ...balanceDoc, id: generateId(), createdAt: now, updatedAt: now };
  balances.push(newBalance);
  await saveLocalData('person_opening_balances', balances);
  
  // Sync with person collection
  const persons = await getLocalData<any[]>('persons', []);
  const idx = persons.findIndex((p: any) => String(p.id) === String(balanceDoc.personId));
  let personName = '';
  if (idx !== -1) {
    personName = persons[idx].name;
    persons[idx].initialBalance = Number(balanceDoc.amount || 0);
    persons[idx].initialBalanceType = balanceDoc.balanceType || "settled";
    persons[idx].updatedAt = now;
    await saveLocalData('persons', persons);
  }

  // Auto-generate basic accounting document
  try {
     const ledgerAccounts = await getLedgerAccounts();
     const defaultLedger = ledgerAccounts.length > 0 ? ledgerAccounts[0].id : '';
     let personLedgerId = defaultLedger;
     if (balanceDoc.personId) {
        const person = persons.find(p => String(p.id) === String(balanceDoc.personId));
        if (person && person.accountingCode) {
           const acc = ledgerAccounts.find(a => a.code === person.accountingCode);
           if (acc) personLedgerId = acc.id;
        }
     }

     const items = [];
     if (balanceDoc.balanceType === 'debtor') {
        items.push({ description: 'بدهکار - طرف حساب', debit: Number(balanceDoc.amount), credit: 0, ledgerAccountId: personLedgerId, detailedAccountId: balanceDoc.personId });
        items.push({ description: 'بستانکار - تراز افتتاحیه', debit: 0, credit: Number(balanceDoc.amount), ledgerAccountId: defaultLedger });
     } else {
        items.push({ description: 'بدهکار - تراز افتتاحیه', debit: Number(balanceDoc.amount), credit: 0, ledgerAccountId: defaultLedger });
        items.push({ description: 'بستانکار - طرف حساب', debit: 0, credit: Number(balanceDoc.amount), ledgerAccountId: personLedgerId, detailedAccountId: balanceDoc.personId });
     }
     
     await addAccountingDocument({
        date: balanceDoc.date || new Date().toISOString().split('T')[0],
        description: balanceDoc.description || `سند افتتاحیه طرف حساب: ${personName}`,
        status: 'approved',
        sourceType: 'opening_balance',
        sourceId: balanceDoc.personId,
        items
     });
  } catch(e) {}

  if (typeof addSystemLog !== 'undefined') {
    await addSystemLog('ADD_PERSON_OPENING_BALANCE', `ثبت سند افتتاحیه جدید برای شخص ${balanceDoc.personId}`, 'PersonOpeningBalance', newBalance.id);
  }

  return newBalance;
};

export const updatePersonOpeningBalance = async (id: string, balanceDoc: any) => {
  const balances = await getLocalData<any[]>('person_opening_balances', []);
  const index = balances.findIndex((b: any) => String(b.id) === String(id));
  if (index !== -1) {
    const oldBalance = balances[index];
    const now = Date.now();
    const updatedBalance = { ...oldBalance, ...balanceDoc, updatedAt: now };
    balances[index] = updatedBalance;
    await saveLocalData('person_opening_balances', balances);

    // Sync with person collection
    const persons = await getLocalData<any[]>('persons', []);
    const idx = persons.findIndex((p: any) => String(p.id) === String(updatedBalance.personId));
    let personName = '';
    if (idx !== -1) {
      personName = persons[idx].name;
      persons[idx].initialBalance = Number(updatedBalance.amount || 0);
      persons[idx].initialBalanceType = updatedBalance.balanceType || "settled";
      persons[idx].updatedAt = now;
      await saveLocalData('persons', persons);
    }

    // Update auto-generated accounting document
    try {
       const accountingDocs = await getAccountingDocuments();
       const existingDoc = accountingDocs.find((d: any) => d.sourceType === 'opening_balance' && String(d.sourceId) === String(updatedBalance.personId));
       
       const ledgerAccounts = await getLedgerAccounts();
       const defaultLedger = ledgerAccounts.length > 0 ? ledgerAccounts[0].id : '';
       let personLedgerId = defaultLedger;
       if (updatedBalance.personId) {
          const person = persons.find(p => String(p.id) === String(updatedBalance.personId));
          if (person && person.accountingCode) {
             const acc = ledgerAccounts.find(a => a.code === person.accountingCode);
             if (acc) personLedgerId = acc.id;
          }
       }

       const items = [];
       if (updatedBalance.balanceType === 'debtor') {
          items.push({ description: 'بدهکار - طرف حساب', debit: Number(updatedBalance.amount), credit: 0, ledgerAccountId: personLedgerId, detailedAccountId: updatedBalance.personId });
          items.push({ description: 'بستانکار - تراز افتتاحیه', debit: 0, credit: Number(updatedBalance.amount), ledgerAccountId: defaultLedger });
       } else {
          items.push({ description: 'بدهکار - تراز افتتاحیه', debit: Number(updatedBalance.amount), credit: 0, ledgerAccountId: defaultLedger });
          items.push({ description: 'بستانکار - طرف حساب', debit: 0, credit: Number(updatedBalance.amount), ledgerAccountId: personLedgerId, detailedAccountId: updatedBalance.personId });
       }

       if (existingDoc) {
          await updateAccountingDocument(existingDoc.id, {
             ...existingDoc,
             date: updatedBalance.date || existingDoc.date,
             description: updatedBalance.description || `سند افتتاحیه طرف حساب: ${personName}`,
             items
          });
       } else {
          await addAccountingDocument({
             date: updatedBalance.date || new Date().toISOString().split('T')[0],
             description: updatedBalance.description || `سند افتتاحیه طرف حساب: ${personName}`,
             status: 'approved',
             sourceType: 'opening_balance',
             sourceId: updatedBalance.personId,
             items
          });
       }
    } catch(e) {}

    if (typeof addSystemLog !== 'undefined') {
      await addSystemLog('UPDATE_PERSON_OPENING_BALANCE', `ویرایش سند افتتاحیه شخص ${updatedBalance.personId}`, 'PersonOpeningBalance', updatedBalance.id);
    }

    return updatedBalance;
  }
  return null;
};

export const deletePersonOpeningBalance = async (id: string) => {
  const balances = await getLocalData<any[]>('person_opening_balances', []);
  const doc = balances.find((b: any) => String(b.id) === String(id));
  if (doc) {
    const personId = doc.personId;
    await saveLocalData('person_opening_balances', balances.filter((b: any) => String(b.id) !== String(id)));

    // Sync with person collection - reset to settled
    const persons = await getLocalData<any[]>('persons', []);
    const idx = persons.findIndex((p: any) => String(p.id) === String(personId));
    if (idx !== -1) {
      persons[idx].initialBalance = 0;
      persons[idx].initialBalanceType = "settled";
      persons[idx].updatedAt = Date.now();
      await saveLocalData('persons', persons);
    }

    // Delete auto-generated accounting document
    try {
       const accountingDocs = await getAccountingDocuments();
       const existingDoc = accountingDocs.find((d: any) => d.sourceType === 'opening_balance' && String(d.sourceId) === String(personId));
       if (existingDoc) {
          await deleteAccountingDocument(existingDoc.id);
       }
    } catch(e) {}

    if (typeof addSystemLog !== 'undefined') {
      await addSystemLog('DELETE_PERSON_OPENING_BALANCE', `حذف سند افتتاحیه شخص ${personId}`, 'PersonOpeningBalance', id);
    }
  }
};
